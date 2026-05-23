/* ─── Repository Classification ─────────────── */
export type RepoType =
  | "frontend"
  | "backend"
  | "fullstack"
  | "library"
  | "mobile"
  | "desktop"
  | "cli"
  | "monorepo"
  | "api"
  | "ml"
  | "devtools"
  | "unknown";

/* ─── Raw GitHub API shapes ──────────────────── */
export interface GitHubRepo {
  full_name: string;
  name: string;
  owner: { login: string; avatar_url: string };
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  watchers_count: number;
  default_branch: string;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  topics: string[];
  homepage: string | null;
  license: { name: string; spdx_id: string } | null;
  size: number;
  language: string | null;
  visibility: string;
  archived: boolean;
  fork: boolean;
  has_wiki: boolean;
  has_discussions: boolean;
  network_count?: number;
  subscribers_count?: number;
}

export interface GitHubContent {
  name: string;
  type: "file" | "dir" | "symlink" | "submodule";
  path: string;
  size?: number;
}

/* ─── Analysis domain types ──────────────────── */
export interface AnalysisMetrics {
  hasReadme: boolean;
  hasLicense: boolean;
  hasCicd: boolean;
  hasTests: boolean;
  hasSecurity: boolean;
  hasChangelog: boolean;
  hasContributing: boolean;
  hasDockerfile: boolean;
  hasEditorconfig: boolean;
  hasDependabot: boolean;
  hasLinting: boolean;
  hasEnvExample: boolean;
  hasGitignore: boolean;
  isArchived: boolean;
  isFork: boolean;
  daysSinceLastPush: number;
  repoAgeYears: number;
  isActive: boolean;
}

export interface AnalysisScores {
  codeHealth: number;
  security: number;
  maintainability: number;
  documentation: number;
  overall: number;
}

export interface AnalysisStack {
  framework: string;
  frameworkVersion?: string;
  runtime: string;
  packageManager: string;
  cicd: string;
  styling: string;
  testing: string;
  language: string;
  databases: string[];
  infra: string[];
}

export interface AnalysisArchitecture {
  pattern: string;
  type: string;
  indicators: string[];
  isMonorepo: boolean;
  hasServerless: boolean;
  hasContainers: boolean;
  hasIaC: boolean;
}

export interface AnalysisInsight {
  type: "success" | "warning" | "info" | "critical";
  text: string;
  category?: string;
}

export interface AntiPattern {
  severity: "critical" | "high" | "medium";
  label: string;
  description: string;
}

/* ─── Final result ───────────────────────────── */
export interface RepoSummary {
  fullName: string;
  description: string | null;
  avatarUrl: string;
  stars: number;
  forks: number;
  openIssues: number;
  watchers: number;
  defaultBranch: string;
  createdAt: string;
  pushedAt: string;
  topics: string[];
  homepage: string | null;
  license: string | null;
  licenseSpdx: string | null;
  sizeKb: number;
  visibility: string;
  hasWiki: boolean;
  hasDiscussions: boolean;
  isArchived: boolean;
  isFork: boolean;
}

export interface AnalysisResult {
  owner: string;
  name: string;
  repoType: RepoType;
  repo: RepoSummary;
  languages: Record<string, number>;
  stack: AnalysisStack;
  architecture: AnalysisArchitecture;
  scores: AnalysisScores;
  metrics: AnalysisMetrics;
  antiPatterns: AntiPattern[];
  insights: AnalysisInsight[];
  analysisTime: number;
  aiPowered: boolean;
}
