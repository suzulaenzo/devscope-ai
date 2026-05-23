import type { GitHubRepo, GitHubContent } from "@/types/analysis";

const BASE = "https://api.github.com";

function makeHeaders(): HeadersInit {
  const token = process.env.GITHUB_TOKEN;
  return {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function ghFetch<T>(path: string, revalidate = 300): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: makeHeaders(),
    next: { revalidate },
  });
  if (!res.ok) {
    const err = new Error(`GitHub ${res.status}: ${path}`) as Error & {
      status: number;
    };
    err.status = res.status;
    throw err;
  }
  return res.json() as Promise<T>;
}

/** Fetch repo metadata */
export function fetchRepo(owner: string, repo: string) {
  return ghFetch<GitHubRepo>(`/repos/${owner}/${repo}`);
}

/** Fetch language breakdown (bytes per language) */
export function fetchLanguages(owner: string, repo: string) {
  return ghFetch<Record<string, number>>(`/repos/${owner}/${repo}/languages`);
}

/** Fetch root-level directory contents — falls back to [] on error */
export function fetchContents(owner: string, repo: string) {
  return ghFetch<GitHubContent[]>(`/repos/${owner}/${repo}/contents`).catch(
    () => [] as GitHubContent[]
  );
}

/** Fetch and parse package.json — returns null if not a Node.js project */
export async function fetchPackageJson(
  owner: string,
  repo: string
): Promise<Record<string, unknown> | null> {
  try {
    const data = await ghFetch<{ encoding: string; content: string }>(
      `/repos/${owner}/${repo}/contents/package.json`,
      60 // shorter cache for package.json
    );
    if (data.encoding === "base64" && data.content) {
      const decoded = Buffer.from(
        data.content.replace(/\n/g, ""),
        "base64"
      ).toString("utf-8");
      return JSON.parse(decoded) as Record<string, unknown>;
    }
    return null;
  } catch {
    return null;
  }
}

/** Fetch pyproject.toml raw content (for Python projects) */
export async function fetchPyprojectToml(
  owner: string,
  repo: string
): Promise<string | null> {
  try {
    const data = await ghFetch<{ encoding: string; content: string }>(
      `/repos/${owner}/${repo}/contents/pyproject.toml`,
      300
    );
    if (data.encoding === "base64" && data.content) {
      return Buffer.from(data.content.replace(/\n/g, ""), "base64").toString(
        "utf-8"
      );
    }
    return null;
  } catch {
    return null;
  }
}
