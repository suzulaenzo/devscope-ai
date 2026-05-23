import type { NextRequest } from "next/server";
import { parseGithubUrl } from "@/lib/utils";
import {
  fetchRepo,
  fetchLanguages,
  fetchContents,
  fetchPackageJson,
} from "@/services/github";
import {
  detectRepoType,
  detectFramework,
  detectRuntime,
  detectPackageManager,
  detectTesting,
  detectCiCd,
  detectStyling,
  detectInfra,
  detectArchitecture,
  extractMetrics,
  computeScores,
  detectAntiPatterns,
  generateInsights,
} from "@/services/analyzer";
import type {
  GitHubRepo,
  GitHubContent,
  AnalysisStack,
  AnalysisResult,
  AnalysisInsight,
} from "@/types/analysis";

export const runtime = "nodejs";
export const maxDuration = 30;

/* ─── helpers ──────────────────────────────── */
function normalizeRepo(raw: string): string {
  const s = raw.trim();
  return s.includes("github.com") ? s : `github.com/${s}`;
}

/* ─── optional Claude enrichment ─────────────── */
async function enrichWithClaude(
  repo: GitHubRepo,
  languages: Record<string, number>,
  stack: AnalysisStack,
  scores: ReturnType<typeof computeScores>,
  arch: ReturnType<typeof detectArchitecture>
): Promise<AnalysisInsight[] | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  const topLangs = Object.keys(languages).slice(0, 5).join(", ");

  const prompt = `You are a senior software engineer performing a technical repository review.

Repository: ${repo.full_name}
Description: ${repo.description ?? "None"}
Stars: ${repo.stargazers_count} | Forks: ${repo.forks_count} | Open issues: ${repo.open_issues_count}
Languages: ${topLangs}
Framework: ${stack.framework}
Runtime: ${stack.runtime}
Package manager: ${stack.packageManager}
Testing: ${stack.testing}
CI/CD: ${stack.cicd}
Architecture: ${arch.pattern} — ${arch.type}
Scores: Code Health ${scores.codeHealth}/100 · Security ${scores.security}/100 · Maintainability ${scores.maintainability}/100 · Docs ${scores.documentation}/100

Generate exactly 6 precise, technical insights about this specific repository.
Rules:
- Reference actual data above — never be generic
- Mix positive observations and constructive improvements
- Sound like a senior engineer, not an automated linter
- 1–2 sentences per insight, maximum
- Do not repeat the same theme twice

Respond ONLY with a valid JSON array. No preamble, no markdown fences.
Schema: [{"type":"success"|"warning"|"info","text":"...","category":"Architecture"|"Quality"|"Security"|"DevOps"|"Stack"|"Documentation"|"Community"}]`;

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
        max_tokens: 900,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const raw: string = data.content?.[0]?.text ?? "";
    const clean = raw.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
    const parsed = JSON.parse(clean);
    return Array.isArray(parsed) ? (parsed as AnalysisInsight[]) : null;
  } catch {
    return null;
  }
}

/* ─── route ─────────────────────────────────── */
export async function GET(request: NextRequest) {
  const start = Date.now();
  const raw = request.nextUrl.searchParams.get("repo");

  if (!raw?.trim()) {
    return Response.json(
      { error: "Query param `repo` is required." },
      { status: 400 }
    );
  }

  const parsed = parseGithubUrl(normalizeRepo(raw));
  if (!parsed) {
    return Response.json(
      { error: "Could not parse URL. Use: github.com/owner/repo or owner/repo" },
      { status: 400 }
    );
  }

  const { owner, repo: repoName } = parsed;

  try {
    /* Fetch all data sources in parallel — single round-trip */
    const [repoData, languages, rawContents, pkg] = await Promise.all([
      fetchRepo(owner, repoName) as Promise<GitHubRepo>,
      fetchLanguages(owner, repoName),
      fetchContents(owner, repoName) as Promise<GitHubContent[]>,
      fetchPackageJson(owner, repoName),
    ]);

    const contents = Array.isArray(rawContents) ? rawContents : [];
    const topics = (repoData.topics ?? []).map((t) => t.toLowerCase());
    /* Build a single Set used by every detector — avoid repeated map/filter */
    const ns = new Set(contents.map((f) => f.name.toLowerCase()));

    /* 1 — Classify the repository first; all scoring adapts to this */
    const repoType = detectRepoType(ns, languages, topics, repoData, pkg);

    /* 2 — Run all detectors (pure synchronous functions) */
    const framework     = detectFramework(ns, languages, topics, repoData.description, pkg);
    const runtime       = detectRuntime(languages, ns, pkg);
    const packageManager = detectPackageManager(ns, languages, pkg);
    const testing       = detectTesting(ns, languages, pkg);
    const cicd          = detectCiCd(ns, topics);
    const styling       = detectStyling(ns, languages, topics, pkg);
    const infra         = detectInfra(ns, topics, repoData.description);

    const stack: AnalysisStack = {
      framework,
      runtime,
      packageManager,
      cicd,
      styling,
      testing,
      language: Object.keys(languages)[0] ?? "Not detected",
      databases: [],
      infra,
    };

    const architecture = detectArchitecture(ns, repoType, framework, languages);
    const metrics      = extractMetrics(contents, repoData);
    const scores       = computeScores(repoData, metrics, repoType, languages);
    const antiPatterns = detectAntiPatterns(ns, metrics, repoData);

    /* 3 — Insights: try Claude first, fall back to rule engine */
    const aiInsights = await enrichWithClaude(repoData, languages, stack, scores, architecture);
    const insights   = aiInsights ?? generateInsights(repoData, metrics, scores, stack, architecture, repoType);

    const result: AnalysisResult & { aiPowered: boolean } = {
      owner,
      name: repoName,
      repoType,
      repo: {
        fullName:        repoData.full_name,
        description:     repoData.description,
        avatarUrl:       repoData.owner.avatar_url,
        stars:           repoData.stargazers_count,
        forks:           repoData.forks_count,
        openIssues:      repoData.open_issues_count,
        watchers:        repoData.watchers_count,
        defaultBranch:   repoData.default_branch,
        createdAt:       repoData.created_at,
        pushedAt:        repoData.pushed_at,
        topics,
        homepage:        repoData.homepage,
        license:         repoData.license?.name ?? null,
        licenseSpdx:     repoData.license?.spdx_id ?? null,
        sizeKb:          repoData.size,
        visibility:      repoData.visibility ?? "public",
        hasWiki:         repoData.has_wiki,
        hasDiscussions:  repoData.has_discussions,
        isArchived:      repoData.archived,
        isFork:          repoData.fork,
      },
      languages,
      stack,
      architecture,
      scores,
      metrics,
      antiPatterns,
      insights,
      analysisTime: Date.now() - start,
      aiPowered: aiInsights !== null,
    };

    return Response.json(result);
  } catch (err: unknown) {
    const status = (err as { status?: number }).status;

    if (status === 404)
      return Response.json(
        { error: `"${owner}/${repoName}" not found. Verify it exists and is public.` },
        { status: 404 }
      );

    if (status === 403 || status === 429)
      return Response.json(
        { error: "GitHub API rate limit reached. Add GITHUB_TOKEN to .env.local to raise the limit to 5,000 req/hr." },
        { status: 429 }
      );

    console.error("[analyze]", err);
    return Response.json(
      { error: "Unexpected error. Please try again." },
      { status: 500 }
    );
  }
}
