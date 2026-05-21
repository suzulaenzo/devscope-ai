import type { NextRequest } from "next/server";
import { parseGithubUrl } from "@/lib/utils";
import { GitHub } from "@/services/github";
import {
  extractMetrics,
  computeScores,
  detectStack,
  generateInsights,
} from "@/services/analyzer";
import type { GitHubRepo, GitHubContent, AnalysisInsight } from "@/types/analysis";

export const runtime = "nodejs";

/* ─── Helpers ──────────────────────────────────── */
function normalizeRepoParam(raw: string): string {
  return raw.includes("github.com") ? raw : `github.com/${raw}`;
}

/** Try to call Claude API for richer AI insights. Falls back gracefully. */
async function callClaudeForInsights(
  repo: GitHubRepo,
  languages: Record<string, number>,
  stackInfo: ReturnType<typeof detectStack>,
  scores: ReturnType<typeof computeScores>
): Promise<AnalysisInsight[] | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  const topLangs = Object.entries(languages)
    .slice(0, 4)
    .map(([l, b]) => `${l}: ${b}`)
    .join(", ");

  const prompt = `You are an expert software engineer reviewing a GitHub repository.

Repository: ${repo.full_name}
Description: ${repo.description ?? "None"}
Stars: ${repo.stargazers_count} | Forks: ${repo.forks_count} | Open Issues: ${repo.open_issues_count}
Primary Language: ${repo.language}
Languages breakdown (bytes): ${topLangs}
Framework: ${stackInfo.framework}
Runtime: ${stackInfo.runtime}
Package Manager: ${stackInfo.packageManager}
CI/CD: ${stackInfo.cicd}
Quality Scores: Code Health ${scores.codeHealth}/100, Security ${scores.security}/100, Maintainability ${scores.maintainability}/100, Documentation ${scores.documentation}/100, Overall ${scores.overall}/100

Generate exactly 5 concise, specific insights about this repository. Each insight should be 1-2 sentences.
Mix positives and constructive points based on the actual data.

Respond ONLY with a JSON array. No preamble, no markdown, no backticks. Example:
[{"type":"success","text":"..."},{"type":"warning","text":"..."}]

type must be one of: "success", "warning", "info"`;

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 600,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!res.ok) return null;
    const data = await res.json();
    const text: string = data.content?.[0]?.text ?? "";
    const parsed = JSON.parse(text) as AnalysisInsight[];
    if (!Array.isArray(parsed)) return null;
    return parsed;
  } catch {
    return null;
  }
}

/* ─── Route Handler ─────────────────────────────── */
export async function GET(request: NextRequest) {
  const start = Date.now();
  const raw = request.nextUrl.searchParams.get("repo");

  if (!raw) {
    return Response.json(
      { error: "Query param `repo` is required." },
      { status: 400 }
    );
  }

  const normalized = normalizeRepoParam(raw.trim());
  const parsed = parseGithubUrl(normalized);

  if (!parsed) {
    return Response.json(
      { error: "Could not parse repository URL. Use format: github.com/owner/repo" },
      { status: 400 }
    );
  }

  const { owner, repo: repoName } = parsed;

  try {
    // Parallel fetch
    const [repoData, languages, rawContents] = await Promise.all([
      GitHub.repo(owner, repoName) as Promise<GitHubRepo>,
      GitHub.languages(owner, repoName),
      GitHub.contents(owner, repoName),
    ]);

    const contents = (Array.isArray(rawContents) ? rawContents : []) as GitHubContent[];

    const metrics = extractMetrics(contents, repoData);
    const scores = computeScores(repoData, metrics);
    const stack = detectStack(languages, contents);

    // AI insights — Claude first, fall back to rule-based
    const aiInsights = await callClaudeForInsights(repoData, languages, stack, scores);
    const insights = aiInsights ?? generateInsights(repoData, metrics, scores, stack);

    return Response.json({
      owner,
      name: repoName,
      repo: {
        fullName: repoData.full_name,
        description: repoData.description,
        stars: repoData.stargazers_count,
        forks: repoData.forks_count,
        openIssues: repoData.open_issues_count,
        watchers: repoData.watchers_count,
        defaultBranch: repoData.default_branch,
        createdAt: repoData.created_at,
        pushedAt: repoData.pushed_at,
        topics: repoData.topics ?? [],
        homepage: repoData.homepage,
        license: repoData.license?.name ?? null,
        sizeKb: repoData.size,
        visibility: repoData.visibility ?? "public",
      },
      languages,
      stack,
      scores,
      metrics,
      insights,
      analysisTime: Date.now() - start,
      aiPowered: aiInsights !== null,
    });
  } catch (err: unknown) {
    const status = (err as { status?: number }).status;

    if (status === 404) {
      return Response.json(
        { error: `Repository "${owner}/${repoName}" not found. Check the URL and make sure it's a public repository.` },
        { status: 404 }
      );
    }

    if (status === 403 || status === 429) {
      return Response.json(
        { error: "GitHub API rate limit reached. Add a GITHUB_TOKEN to .env.local to increase the limit." },
        { status: 429 }
      );
    }

    console.error("[analyze] unexpected error", err);
    return Response.json(
      { error: "Analysis failed. Please try again in a moment." },
      { status: 500 }
    );
  }
}
