import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

const run = promisify(execFile);
const script = path.join(path.dirname(fileURLToPath(import.meta.url)), "../scripts/sync-projects.mjs");
const b64 = (s) => Buffer.from(s).toString("base64");

const repoNode = (name, extra = {}) => ({
  name,
  owner: { login: "me" },
  url: `https://github.com/me/${name}`,
  homepageUrl: "",
  description: `${name} desc`,
  isFork: false,
  isArchived: false,
  isPrivate: false,
  pushedAt: new Date().toISOString(),
  defaultBranchRef: { name: "main" },
  latestRelease: null,
  languages: { edges: [{ size: 100, node: { name: "JavaScript" } }] },
  repositoryTopics: { nodes: [] },
  ...extra,
});

// Minimal stand-in for the GitHub REST + GraphQL endpoints the script uses.
function fakeGitHub(readmeSha) {
  const routes = {
    "/repos/me/app/readme": { sha: readmeSha, content: b64("# App\nDoes things.") },
    "/repos/me/app/git/trees/main?recursive=1": {
      tree: [
        { type: "blob", path: "frontend/package.json", sha: "p1" },
        { type: "blob", path: "node_modules/x/package.json", sha: "p2" },
      ],
    },
    "/repos/me/app/git/blobs/p1": {
      content: b64(JSON.stringify({ dependencies: { react: "1", express: "1", mongoose: "1" } })),
    },
  };
  return http.createServer((req, res) => {
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", () => {
      let data = routes[req.url];
      if (req.url === "/graphql") {
        data = {
          data: {
            user: {
              pinnedItems: { nodes: [repoNode("app"), repoNode("secret", { isPrivate: true })] },
              repositories: { nodes: [repoNode("tagged", { repositoryTopics: { nodes: [{ topic: { name: "portfolio" } }] } })] },
            },
          },
        };
      }
      res.writeHead(data ? 200 : 404, { "content-type": "application/json" });
      res.end(JSON.stringify(data ?? { message: "Not Found" }));
    });
  });
}

async function withServer(readmeSha, fn) {
  const server = fakeGitHub(readmeSha);
  await new Promise((r) => server.listen(0, r));
  try {
    return await fn(`http://127.0.0.1:${server.address().port}`);
  } finally {
    server.close();
  }
}

function sync(cwd, phase, env) {
  const output = path.join(cwd, "gh-output");
  fs.writeFileSync(output, "");
  return run("node", [script, phase], {
    cwd,
    env: { ...process.env, GITHUB_TOKEN: "t", GITHUB_USERNAME: "me", GITHUB_OUTPUT: output, ...env },
  }).then(({ stdout }) => ({ stdout, outputs: fs.readFileSync(output, "utf-8") }));
}

test("prepare → Claude → finalize → re-run only summarises changed READMEs", async () => {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), "sync-"));
  const projectsFile = path.join(cwd, "src/data/projects.json");
  const read = () => JSON.parse(fs.readFileSync(projectsFile, "utf-8"));

  await withServer("sha1", async (api) => {
    const { outputs } = await sync(cwd, "prepare", { GITHUB_API_URL: api });
    assert.match(outputs, /pending_count=1/);
    assert.match(outputs, /pending=app/);
    assert.equal(fs.readFileSync(path.join(cwd, ".sync/readmes/app.md"), "utf-8"), "# App\nDoes things.");

    const [app, tagged] = read();
    assert.deepEqual(read().map((p) => p.id), ["app", "tagged"]); // private repo skipped
    assert.deepEqual(app.tech, ["MERN Stack"]);
    assert.equal(app.status, "Active");
    assert.equal(app.readmeSha, null);
    assert.equal(tagged.summary, "tagged desc"); // no README → description, never pending

    await sync(cwd, "finalize", {
      SUMMARIES_JSON: JSON.stringify({
        projects: [{ repo: "app", name: "App", summary: "Does things.", whyItMatters: "It helps." }],
      }),
    });
    assert.equal(read()[0].summary, "Does things.");
    assert.equal(read()[0].readmeSha, "sha1");

    // Same README next day → nothing for Claude to do, text kept.
    const again = await sync(cwd, "prepare", { GITHUB_API_URL: api });
    assert.match(again.outputs, /pending_count=0/);
    assert.equal(read()[0].whyItMatters, "It helps.");
  });

  // README edited → summarised again.
  await withServer("sha2", async (api) => {
    const { outputs } = await sync(cwd, "prepare", { GITHUB_API_URL: api });
    assert.match(outputs, /pending_count=1/);
  });
});
