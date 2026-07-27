import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

test("getRepos uses the cached GitHub data when no environment credentials are set", async () => {
  const tempDir = fs.mkdtempSync(
    path.join(os.tmpdir(), "portfolio-github-cache-"),
  );
  const cacheFile = path.join(tempDir, "repos-cache.json");

  fs.writeFileSync(
    cacheFile,
    JSON.stringify(
      [
        {
          id: 1,
          name: "cached-project",
          description: "Cached from disk",
          url: "https://github.com/example/cached-project",
          homepage: "https://example.com",
          language: "TypeScript",
          updatedAt: "2024-01-01T00:00:00Z",
          createdAt: "2023-01-01T00:00:00Z",
          topics: ["portfolio"],
          stars: 12,
          hasReadme: false,
          readme: null,
        },
      ],
      null,
      2,
    ),
  );

  const previousCwd = process.cwd();
  process.chdir(tempDir);
  delete process.env.GITHUB_TOKEN;
  delete process.env.GITHUB_USERNAME;

  try {
    const githubModuleUrl = pathToFileURL(
      path.join(repoRoot, "src/lib/github.js"),
    ).href;
    const { getRepos } = await import(githubModuleUrl);
    const repos = await getRepos();

    assert.equal(repos.length, 1);
    assert.equal(repos[0].name, "cached-project");
    assert.equal(repos[0].url, "https://github.com/example/cached-project");
  } finally {
    process.chdir(previousCwd);
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});
