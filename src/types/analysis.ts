/* ─── Raw GitHub API shapes ──────────────────── */
export interface GitHubRepo {
  full_name: string;
  name: string;
  owner: { login: string };
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
  license: { name: string } | null;
  size: number;
  language: string | null;
  visibility: string;
}

export interface GitHubContent {
  name: string;
  type: "file" | "dir" | "symlink" | "submodule";
  path: string;
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
  daysSinceLastPush: number;
  repoAgeYears: number;
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
  runtime: string;
  packageManager: string;
  cicd: string;
  styling: string;
  testing: string;
}

export interface AnalysisInsight {
  type: "success" | "warning" | "info";
  text: string;
}

/* ─── Final result returned by the API ──────── */
export interface RepoSummary {
  fullName: string;
  description: string | null;
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
  sizeKb: number;
  visibility: string;
}

export interface AnalysisResult {
  owner: string;
  name: string;
  repo: RepoSummary;
  languages: Record<string, number>;
  stack: AnalysisStack;
  scores: AnalysisScores;
  metrics: AnalysisMetrics;
  insights: AnalysisInsight[];
  analysisTime: number;
}
