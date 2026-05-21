const BASE = "https://api.github.com";

function makeHeaders(): HeadersInit {
  const token = process.env.GITHUB_TOKEN;
  return {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function ghFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: makeHeaders(),
    next: { revalidate: 300 }, // cache 5 min
  });

  if (!res.ok) {
    const err = new Error(`GitHub ${res.status}`) as Error & { status: number };
    err.status = res.status;
    throw err;
  }

  return res.json() as Promise<T>;
}

export const GitHub = {
  repo: (owner: string, repo: string) =>
    ghFetch(`/repos/${owner}/${repo}`),

  languages: (owner: string, repo: string) =>
    ghFetch<Record<string, number>>(`/repos/${owner}/${repo}/languages`),

  contents: (owner: string, repo: string) =>
    ghFetch<unknown[]>(`/repos/${owner}/${repo}/contents`).catch(() => [] as unknown[]),
} as const;
