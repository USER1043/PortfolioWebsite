import { githubRateLimiter } from "./rateLimit.mjs";

const GITHUB_TOKEN = import.meta.env.GITHUB_TOKEN;
const GITHUB_USERNAME = import.meta.env.GITHUB_USERNAME;

const LANGUAGE_COLORS = {
  JavaScript: "#F7DF1E",
  TypeScript: "#3178C6",
  Python: "#3776AB",
  Rust: "#DEA584",
  Go: "#00ADD8",
  Java: "#B07219",
  C: "#555555",
  "C++": "#F34B7D",
  "C#": "#239120",
  Ruby: "#701516",
  PHP: "#4F5D95",
  Swift: "#F05138",
  Kotlin: "#A97BFF",
  Dart: "#0175C2",
  Shell: "#89E051",
  HTML: "#E34C26",
  CSS: "#563D7C",
  SQL: "#CC2927",
  Markdown: "#083FA1",
  Astro: "#FF5D01",
  Vue: "#4FC08D",
  React: "#61DAFB",
  Angular: "#DD0031",
  Svelte: "#FF3E00",
  default: "#8B949E",
};

export function getLanguageColor(language) {
  if (!language) return LANGUAGE_COLORS.default;
  return LANGUAGE_COLORS[language] || LANGUAGE_COLORS.default;
}

export async function fetchReadme(repoName) {
  if (!GITHUB_TOKEN || !GITHUB_USERNAME) {
    console.warn("GITHUB_TOKEN or GITHUB_USERNAME not set");
    return null;
  }

  const allowed = await githubRateLimiter(`readme:${repoName}`);
  if (!allowed) {
    console.warn(`Rate limit exceeded for README fetch: ${repoName}`);
    return null;
  }

  try {
    const response = await fetch(
      `https://api.github.com/repos/${GITHUB_USERNAME}/${repoName}/readme`,
      {
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          Accept: "application/vnd.github.v3+json",
        },
      },
    );

    if (!response.ok) {
      if (response.status === 404) {
        return null; // No README found
      }
      console.error(`Failed to fetch README for ${repoName}:`, response.status);
      return null;
    }

    const data = await response.json();
    // README content is base64 encoded
    const content = Buffer.from(data.content, "base64").toString("utf-8");
    return content;
  } catch (error) {
    console.error(`Error fetching README for ${repoName}:`, error);
    return null;
  }
}

export async function fetchReadmesInParallel(repos, batchSize = 5) {
  const reposWithReadmes = [];

  for (let i = 0; i < repos.length; i += batchSize) {
    const batch = repos.slice(i, i + batchSize);

    const batchResults = await Promise.all(
      batch.map(async (repo) => {
        const readme = await fetchReadme(repo.name);
        return {
          ...repo,
          hasReadme: readme !== null,
          readme,
        };
      }),
    );

    reposWithReadmes.push(...batchResults);

    // Add delay between batches to avoid rate limiting
    if (i + batchSize < repos.length) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  return reposWithReadmes;
}

export async function getRepos() {
  if (!GITHUB_TOKEN || !GITHUB_USERNAME) {
    console.warn(
      "GITHUB_TOKEN or GITHUB_USERNAME not set, returning empty array",
    );
    return [];
  }

  const allowed = await githubRateLimiter("repos:list");
  if (!allowed) {
    console.warn("Rate limit exceeded for repository list fetch");
    return [];
  }

  try {
    const response = await fetch(
      `https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100&sort=updated`,
      {
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          Accept: "application/vnd.github.v3+json",
        },
      },
    );

    if (!response.ok) {
      console.error("Failed to fetch repos:", response.status);
      return [];
    }

    const repos = await response.json();

    // Filter out forks, archived repos, and the portfolio repo itself
    const filteredRepos = repos.filter(
      (repo) =>
        !repo.fork && !repo.archived && repo.name !== "PortfolioWebsite",
    );

    // Transform to our data structure
    const transformedRepos = filteredRepos.map((repo) => ({
      id: repo.id,
      name: repo.name,
      description: repo.description || "No description provided",
      url: repo.html_url,
      homepage: repo.homepage,
      language: repo.language,
      updatedAt: repo.updated_at,
      createdAt: repo.created_at,
      topics: repo.topics || [],
      stars: repo.stargazers_count,
      hasReadme: false,
      readme: null,
    }));

    // Fetch READMEs in parallel
    const reposWithReadmes = await fetchReadmesInParallel(transformedRepos);

    return reposWithReadmes;
  } catch (error) {
    console.error("Error fetching repos:", error);
    return [];
  }
}
