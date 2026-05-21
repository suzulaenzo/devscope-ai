import type {
  GitHubRepo,
  GitHubContent,
  AnalysisMetrics,
  AnalysisScores,
  AnalysisStack,
  AnalysisInsight,
} from "@/types/analysis";

/* ─── Helpers ─────────────────────────────────── */
function names(contents: GitHubContent[]): string[] {
  return contents.map((f) => f.name.toLowerCase());
}

function hasAny(list: string[], ...targets: string[]): boolean {
  return targets.some((t) => list.some((n) => n === t || n.startsWith(t)));
}

/* ─── Metrics ─────────────────────────────────── */
export function extractMetrics(
  contents: GitHubContent[],
  repo: GitHubRepo
): AnalysisMetrics {
  const ns = names(contents);

  return {
    hasReadme: hasAny(ns, "readme"),
    hasLicense: hasAny(ns, "license", "licence"),
    hasCicd:
      ns.includes(".github") ||
      hasAny(ns, ".travis.yml", ".circleci", "jenkinsfile", ".gitlab-ci.yml"),
    hasTests: ns.some((n) =>
      ["test", "tests", "__tests__", "spec", "specs", "e2e"].includes(n)
    ),
    hasSecurity: hasAny(ns, "security"),
    hasChangelog: hasAny(ns, "changelog", "history", "releases"),
    hasContributing: hasAny(ns, "contributing"),
    hasDockerfile: hasAny(ns, "dockerfile", "docker-compose"),
    hasEditorconfig: ns.includes(".editorconfig"),
    daysSinceLastPush: Math.floor(
      (Date.now() - new Date(repo.pushed_at).getTime()) / 86_400_000
    ),
    repoAgeYears:
      (Date.now() - new Date(repo.created_at).getTime()) /
      (365 * 86_400_000),
  };
}

/* ─── Scoring ─────────────────────────────────── */
export function computeScores(
  repo: GitHubRepo,
  m: AnalysisMetrics
): AnalysisScores {
  // Code Health
  let codeHealth = 50;
  if (m.hasTests) codeHealth += 20;
  if (m.hasCicd) codeHealth += 15;
  if (m.hasEditorconfig) codeHealth += 5;
  if (m.hasChangelog) codeHealth += 5;
  if (m.daysSinceLastPush < 30) codeHealth += 5;

  // Security
  let security = 55;
  if (m.hasSecurity) security += 20;
  if (m.hasCicd) security += 10; // cicd implies automated checks
  if (m.hasLicense) security += 8;
  if (m.daysSinceLastPush < 90) security += 7;

  // Maintainability
  let maintainability = 45;
  if (m.hasReadme) maintainability += 15;
  if (m.hasLicense) maintainability += 10;
  if (m.hasContributing) maintainability += 10;
  if (m.hasChangelog) maintainability += 10;
  if (m.daysSinceLastPush < 60) maintainability += 10;

  // Documentation
  let documentation = 40;
  if (m.hasReadme) documentation += 30;
  if (m.hasChangelog) documentation += 10;
  if (m.hasContributing) documentation += 8;
  if (repo.description) documentation += 7;
  if (repo.homepage) documentation += 5;

  const clamp = (v: number) => Math.min(100, Math.round(v));

  const ch = clamp(codeHealth);
  const sc = clamp(security);
  const mn = clamp(maintainability);
  const dc = clamp(documentation);
  const overall = Math.round(ch * 0.3 + sc * 0.25 + mn * 0.25 + dc * 0.2);

  return { codeHealth: ch, security: sc, maintainability: mn, documentation: dc, overall };
}

/* ─── Stack Detection ─────────────────────────── */
export function detectStack(
  languages: Record<string, number>,
  contents: GitHubContent[]
): AnalysisStack {
  const ns = names(contents);
  const top = Object.keys(languages)[0] ?? "Unknown";

  // Framework
  let framework = "Unknown";
  if (ns.includes("next.config.js") || ns.includes("next.config.ts") || ns.includes("next.config.mjs"))
    framework = "Next.js";
  else if (ns.includes("nuxt.config.js") || ns.includes("nuxt.config.ts"))
    framework = "Nuxt.js";
  else if (ns.includes("vite.config.js") || ns.includes("vite.config.ts"))
    framework = "Vite";
  else if (ns.includes("angular.json")) framework = "Angular";
  else if (ns.includes("gatsby-config.js") || ns.includes("gatsby-config.ts"))
    framework = "Gatsby";
  else if (ns.includes("svelte.config.js")) framework = "SvelteKit";
  else if (ns.includes("remix.config.js")) framework = "Remix";
  else if (ns.includes("astro.config.mjs") || ns.includes("astro.config.ts"))
    framework = "Astro";
  else if (ns.includes("manage.py")) framework = "Django";
  else if (ns.includes("cargo.toml")) framework = "Rust / Cargo";
  else if (ns.includes("go.mod")) framework = "Go Modules";
  else if (ns.includes("pom.xml")) framework = "Maven";
  else if (ns.includes("build.gradle") || ns.includes("build.gradle.kts"))
    framework = "Gradle";
  else if (ns.includes("mix.exs")) framework = "Elixir / Mix";
  else if (ns.includes("composer.json")) framework = "PHP / Composer";

  // Runtime
  const runtimeMap: Record<string, string> = {
    TypeScript: "Node.js",
    JavaScript: "Node.js",
    Python: "Python",
    Go: "Go",
    Rust: "Rust",
    Java: "JVM",
    Kotlin: "JVM",
    Ruby: "Ruby",
    PHP: "PHP",
    "C#": ".NET",
    Swift: "Swift",
    Dart: "Dart / Flutter",
    Elixir: "Erlang VM",
  };
  const runtime = runtimeMap[top] ?? top;

  // Package manager
  let packageManager = "Unknown";
  if (ns.includes("pnpm-lock.yaml")) packageManager = "pnpm";
  else if (ns.includes("yarn.lock")) packageManager = "Yarn";
  else if (ns.includes("bun.lockb")) packageManager = "Bun";
  else if (ns.includes("package-lock.json")) packageManager = "npm";
  else if (ns.includes("cargo.lock")) packageManager = "Cargo";
  else if (ns.includes("go.sum")) packageManager = "Go modules";
  else if (ns.includes("poetry.lock")) packageManager = "Poetry";
  else if (ns.includes("pipfile.lock")) packageManager = "Pipenv";
  else if (ns.includes("requirements.txt")) packageManager = "pip";
  else if (ns.includes("gemfile.lock")) packageManager = "Bundler";
  else if (ns.includes("composer.lock")) packageManager = "Composer";

  // CI/CD
  let cicd = "None detected";
  if (ns.includes(".github")) cicd = "GitHub Actions";
  else if (ns.includes(".travis.yml")) cicd = "Travis CI";
  else if (ns.includes(".circleci")) cicd = "CircleCI";
  else if (ns.includes("jenkinsfile")) cicd = "Jenkins";
  else if (ns.includes(".gitlab-ci.yml")) cicd = "GitLab CI";

  // Styling
  let styling = "Unknown";
  if (ns.includes("tailwind.config.js") || ns.includes("tailwind.config.ts") || ns.includes("tailwind.config.cjs"))
    styling = "Tailwind CSS";
  else if (ns.some((n) => n.endsWith(".scss") || n.endsWith(".sass")))
    styling = "Sass / SCSS";
  else if (ns.some((n) => n.endsWith(".less"))) styling = "Less";
  else if (top === "TypeScript" || top === "JavaScript")
    styling = "CSS Modules";

  // Testing
  let testing = "None detected";
  if (ns.includes("jest.config.js") || ns.includes("jest.config.ts"))
    testing = "Jest";
  else if (ns.includes("vitest.config.ts") || ns.includes("vitest.config.js"))
    testing = "Vitest";
  else if (ns.includes("pytest.ini") || ns.includes("pyproject.toml"))
    testing = "Pytest";
  else if (ns.includes("cypress.config.js") || ns.includes("cypress.config.ts"))
    testing = "Cypress";

  return { framework, runtime, packageManager, cicd, styling, testing };
}

/* ─── Insights ────────────────────────────────── */
export function generateInsights(
  repo: GitHubRepo,
  m: AnalysisMetrics,
  scores: AnalysisScores,
  stack: AnalysisStack
): AnalysisInsight[] {
  const insights: AnalysisInsight[] = [];

  // Positives
  if (m.hasTests)
    insights.push({ type: "success", text: "Test suite detected — good coverage culture in place." });
  if (m.hasCicd)
    insights.push({ type: "success", text: `${stack.cicd} pipeline detected — automated quality gates active.` });
  if (m.hasReadme)
    insights.push({ type: "success", text: "README present — project is well documented at the entry point." });
  if (m.hasLicense)
    insights.push({ type: "success", text: "Open-source license found — clear usage rights defined." });
  if (m.hasChangelog)
    insights.push({ type: "success", text: "CHANGELOG maintained — strong release communication practices." });
  if (m.daysSinceLastPush < 7)
    insights.push({ type: "success", text: `Actively maintained — last push ${m.daysSinceLastPush}d ago.` });
  if (scores.overall >= 80)
    insights.push({ type: "success", text: `Overall quality score of ${scores.overall}/100 puts this repo in the top tier.` });

  // Warnings
  if (!m.hasTests)
    insights.push({ type: "warning", text: "No test directory detected — consider adding unit/integration tests." });
  if (!m.hasCicd)
    insights.push({ type: "warning", text: "No CI/CD configuration found — automated pipelines would improve reliability." });
  if (!m.hasLicense)
    insights.push({ type: "warning", text: "License file missing — usage rights are undefined for contributors." });
  if (!m.hasSecurity)
    insights.push({ type: "warning", text: "No SECURITY.md found — add a vulnerability disclosure policy." });
  if (m.daysSinceLastPush > 180)
    insights.push({ type: "warning", text: `Last push was ${m.daysSinceLastPush} days ago — project may be inactive.` });
  if (repo.open_issues_count > 100)
    insights.push({ type: "warning", text: `${repo.open_issues_count} open issues — consider a triage session.` });
  if (!m.hasContributing)
    insights.push({ type: "warning", text: "No CONTRIBUTING guide — add one to lower the barrier for contributors." });
  if (!m.hasDockerfile)
    insights.push({ type: "info", text: "No Dockerfile detected — containerization would improve portability." });

  return insights.slice(0, 8);
}
