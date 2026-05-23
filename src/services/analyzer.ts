import type {
  GitHubRepo,
  GitHubContent,
  RepoType,
  AnalysisMetrics,
  AnalysisScores,
  AnalysisStack,
  AnalysisArchitecture,
  AnalysisInsight,
  AntiPattern,
} from "@/types/analysis";

/* ═══════════════════════════════════════════════
   UTILITIES
═══════════════════════════════════════════════ */
function nameSet(contents: GitHubContent[]): Set<string> {
  return new Set(contents.map((f) => f.name.toLowerCase()));
}
function has(ns: Set<string>, ...targets: string[]): boolean {
  return targets.some((t) => ns.has(t));
}
function hasPrefix(ns: Set<string>, prefix: string): boolean {
  for (const n of ns) if (n.startsWith(prefix)) return true;
  return false;
}
function topicHas(topics: string[], ...keys: string[]): boolean {
  return keys.some((k) => topics.map((t) => t.toLowerCase()).includes(k));
}
function descHas(desc: string | null, ...keywords: string[]): boolean {
  if (!desc) return false;
  const d = desc.toLowerCase();
  return keywords.some((k) => d.includes(k));
}
function depsHave(pkg: Record<string, unknown> | null, ...names: string[]): boolean {
  if (!pkg) return false;
  const all = {
    ...(pkg.dependencies as Record<string, string> | undefined),
    ...(pkg.devDependencies as Record<string, string> | undefined),
    ...(pkg.peerDependencies as Record<string, string> | undefined),
  };
  return names.some((n) => n in all);
}
function depsList(pkg: Record<string, unknown> | null): string[] {
  if (!pkg) return [];
  return [
    ...Object.keys((pkg.dependencies as Record<string, string>) ?? {}),
    ...Object.keys((pkg.devDependencies as Record<string, string>) ?? {}),
  ];
}

/* ═══════════════════════════════════════════════
   REPOSITORY TYPE
═══════════════════════════════════════════════ */
export function detectRepoType(
  ns: Set<string>,
  languages: Record<string, number>,
  topics: string[],
  repo: GitHubRepo,
  pkg: Record<string, unknown> | null
): RepoType {
  const top = Object.keys(languages)[0] ?? "";

  // Monorepo
  const isMonorepo =
    has(ns, "turbo.json", "lerna.json", "nx.json", "pnpm-workspace.yaml") ||
    (has(ns, "packages", "apps") && has(ns, "package.json"));
  if (isMonorepo) return "monorepo";

  // Mobile
  if (has(ns, "pubspec.yaml") || top === "Dart" || topicHas(topics, "flutter", "dart"))
    return "mobile";
  if (
    has(ns, "metro.config.js", "metro.config.ts", "app.json") ||
    topicHas(topics, "react-native", "expo") ||
    depsHave(pkg, "react-native", "expo")
  )
    return "mobile";

  // Desktop
  if (has(ns, "tauri.conf.json", "src-tauri") || topicHas(topics, "tauri") || depsHave(pkg, "@tauri-apps/cli"))
    return "desktop";
  if (depsHave(pkg, "electron") || topicHas(topics, "electron") || hasPrefix(ns, "electron"))
    return "desktop";

  // ML
  if (
    (top === "Python" || top === "Jupyter Notebook") &&
    (topicHas(topics, "machine-learning", "deep-learning", "ai", "nlp", "pytorch", "tensorflow", "keras") ||
      descHas(repo.description, "machine learning", "neural", "model", "training", "dataset", "llm"))
  )
    return "ml";

  // CLI
  if (
    has(ns, "bin") ||
    topicHas(topics, "cli", "command-line") ||
    (pkg && typeof pkg.bin === "object" && pkg.bin !== null) ||
    descHas(repo.description, " cli", "command line", "terminal tool")
  )
    return "cli";

  // Library
  const isLib =
    has(ns, "dist", "lib") &&
    !has(ns, "app", "pages") &&
    ((pkg && (typeof pkg.main === "string" || typeof pkg.exports !== "undefined")) ||
      topicHas(topics, "library", "package", "sdk", "npm-package"));
  if (isLib) return "library";

  // Fullstack (most specific first)
  if (
    has(ns, "next.config.js", "next.config.ts", "next.config.mjs", "next.config.cjs") ||
    has(ns, "nuxt.config.js", "nuxt.config.ts", "nuxt.config.mjs") ||
    has(ns, "svelte.config.js", "svelte.config.ts") ||
    has(ns, "remix.config.js", "remix.config.ts") ||
    depsHave(pkg, "next", "nuxt", "@sveltejs/kit", "@remix-run/node") ||
    topicHas(topics, "nextjs", "nuxtjs", "sveltekit", "remix")
  )
    return "fullstack";

  // API (pure backend services)
  if (top === "Go" || top === "Rust") {
    if (!topicHas(topics, "frontend", "cli")) return "api";
  }
  if (
    top === "Java" || top === "Kotlin" || top === "Elixir" || top === "C#"
  )
    return "backend";

  // Backend signals
  const hasBackend =
    topicHas(topics, "api", "rest", "graphql", "backend", "server", "microservice") ||
    depsHave(pkg, "express", "fastify", "koa", "hapi", "@nestjs/core", "strapi") ||
    has(ns, "manage.py") ||
    (top === "Ruby" && has(ns, "gemfile")) ||
    (top === "PHP" && has(ns, "artisan", "composer.json"));

  // Frontend signals
  const hasFrontend =
    has(ns, "index.html", "vite.config.js", "vite.config.ts", "angular.json") ||
    depsHave(pkg, "react", "vue", "@angular/core", "svelte", "solid-js", "astro") ||
    topicHas(topics, "frontend", "react", "vue", "angular", "svelte", "spa", "jamstack");

  if (hasFrontend && hasBackend) return "fullstack";
  if (hasBackend) return "backend";
  if (hasFrontend) return "frontend";

  if (top === "TypeScript" || top === "JavaScript") return "fullstack";
  if (top === "Python") return "backend";
  return "unknown";
}

/* ═══════════════════════════════════════════════
   FRAMEWORK DETECTION
═══════════════════════════════════════════════ */
export function detectFramework(
  ns: Set<string>,
  languages: Record<string, number>,
  topics: string[],
  desc: string | null,
  pkg: Record<string, unknown> | null
): string {
  const top = Object.keys(languages)[0] ?? "";

  // Next.js
  if (has(ns, "next.config.js","next.config.ts","next.config.mjs","next.config.cjs") || depsHave(pkg,"next") || topicHas(topics,"nextjs","next-js")) return "Next.js";
  // Nuxt
  if (has(ns,"nuxt.config.js","nuxt.config.ts","nuxt.config.mjs") || depsHave(pkg,"nuxt") || topicHas(topics,"nuxtjs","nuxt")) return "Nuxt.js";
  // SvelteKit
  if (has(ns,"svelte.config.js","svelte.config.ts") || depsHave(pkg,"@sveltejs/kit") || topicHas(topics,"sveltekit")) return "SvelteKit";
  // Remix
  if (has(ns,"remix.config.js","remix.config.ts") || depsHave(pkg,"@remix-run/node","@remix-run/react") || topicHas(topics,"remix")) return "Remix";
  // Astro
  if (has(ns,"astro.config.mjs","astro.config.ts","astro.config.js") || depsHave(pkg,"astro") || topicHas(topics,"astro")) return "Astro";
  // Gatsby
  if (has(ns,"gatsby-config.js","gatsby-config.ts","gatsby-config.mjs") || depsHave(pkg,"gatsby") || topicHas(topics,"gatsby")) return "Gatsby";
  // Angular
  if (has(ns,"angular.json") || depsHave(pkg,"@angular/core") || topicHas(topics,"angular")) return "Angular";
  // NestJS
  if (depsHave(pkg,"@nestjs/core","@nestjs/common") || topicHas(topics,"nestjs")) return "NestJS";
  // Express
  if (depsHave(pkg,"express") || topicHas(topics,"expressjs","express")) return "Express";
  // Fastify
  if (depsHave(pkg,"fastify") || topicHas(topics,"fastify")) return "Fastify";
  // Hono
  if (depsHave(pkg,"hono") || topicHas(topics,"hono")) return "Hono";
  // tRPC
  if (depsHave(pkg,"@trpc/server") || topicHas(topics,"trpc")) return "tRPC";
  // Strapi
  if (depsHave(pkg,"@strapi/strapi","strapi") || topicHas(topics,"strapi")) return "Strapi";
  // Electron
  if (depsHave(pkg,"electron") || topicHas(topics,"electron")) return "Electron";
  // Tauri
  if (has(ns,"tauri.conf.json","src-tauri") || depsHave(pkg,"@tauri-apps/cli")) return "Tauri";
  // Expo
  if (depsHave(pkg,"expo") || topicHas(topics,"expo")) return "Expo";
  // React Native
  if (depsHave(pkg,"react-native") || has(ns,"metro.config.js") || topicHas(topics,"react-native")) return "React Native";
  // Flutter
  if (has(ns,"pubspec.yaml") || top === "Dart") return "Flutter";
  // Vite (standalone)
  if (has(ns,"vite.config.js","vite.config.ts","vite.config.mjs") || depsHave(pkg,"vite")) return "Vite";
  // SolidJS
  if (depsHave(pkg,"solid-js") || topicHas(topics,"solidjs")) return "SolidJS";
  // Qwik
  if (depsHave(pkg,"@builder.io/qwik") || topicHas(topics,"qwik")) return "Qwik";
  // React
  if (depsHave(pkg,"react") || topicHas(topics,"react","reactjs")) return "React";
  // Vue
  if (depsHave(pkg,"vue") || topicHas(topics,"vue","vuejs")) return "Vue.js";
  // Svelte (standalone)
  if (depsHave(pkg,"svelte") || topicHas(topics,"svelte")) return "Svelte";
  // Django
  if (has(ns,"manage.py") || topicHas(topics,"django") || descHas(desc,"django")) return "Django";
  // Flask
  if ((top==="Python" && has(ns,"app.py","wsgi.py","asgi.py")) || topicHas(topics,"flask") || descHas(desc,"flask")) return "Flask";
  // FastAPI
  if (topicHas(topics,"fastapi") || descHas(desc,"fastapi")) return "FastAPI";
  // Spring Boot
  if ((top==="Java"||top==="Kotlin") && (has(ns,"pom.xml","build.gradle","build.gradle.kts") || topicHas(topics,"spring-boot","spring"))) return "Spring Boot";
  // Laravel
  if ((top==="PHP" && has(ns,"artisan")) || topicHas(topics,"laravel")) return "Laravel";
  // Rails
  if ((top==="Ruby" && (has(ns,"config","gemfile") || topicHas(topics,"rails","ruby-on-rails"))) || descHas(desc,"ruby on rails")) return "Ruby on Rails";
  // Phoenix
  if ((top==="Elixir" && has(ns,"mix.exs")) || topicHas(topics,"phoenix","elixir")) return "Phoenix";
  // ASP.NET
  if (top==="C#" || has(ns,"program.cs","startup.cs") || topicHas(topics,"aspnet","dotnet","aspnetcore")) return "ASP.NET Core";
  // Serverless Framework
  if (has(ns,"serverless.yml","serverless.yaml")) return "Serverless Framework";
  // Cloudflare Workers
  if (has(ns,"wrangler.toml","wrangler.json")) return "Cloudflare Workers";
  // Language fallbacks
  if (top==="Go") return "Go";
  if (top==="Rust") return "Rust";
  if (top==="Swift") return "Swift";
  if (top==="Kotlin") return "Kotlin";
  if (top==="Elixir") return "Elixir";
  if (top==="Ruby") return "Ruby";
  if (top==="PHP") return "PHP";
  if (top==="Python") return "Python";
  if (top==="Java") return "Java";
  if (top==="C#") return ".NET";
  if (top==="C++"||top==="C") return top;
  if (top==="TypeScript"||top==="JavaScript") return "Node.js";
  return "Not detected";
}

/* ═══════════════════════════════════════════════
   RUNTIME
═══════════════════════════════════════════════ */
export function detectRuntime(
  languages: Record<string, number>,
  ns: Set<string>,
  pkg: Record<string, unknown> | null
): string {
  const top = Object.keys(languages)[0] ?? "";
  if (top==="TypeScript"||top==="JavaScript") {
    if (has(ns,"deno.json","deno.jsonc")) return "Deno";
    if (has(ns,"bun.lockb","bunfig.toml")) return "Bun";
    const pm = pkg?.packageManager as string|undefined;
    if (pm?.startsWith("bun")) return "Bun";
    return "Node.js";
  }
  const m: Record<string,string> = {
    Python:"Python",Go:"Go",Rust:"Rust",Java:"JVM (Java)",Kotlin:"JVM (Kotlin)",
    Scala:"JVM (Scala)",Ruby:"Ruby MRI",PHP:"PHP-FPM","C#":".NET CLR","F#":".NET CLR",
    Swift:"Swift Runtime",Dart:"Dart VM",Elixir:"BEAM VM",Erlang:"BEAM VM",
    Haskell:"GHC",Clojure:"JVM (Clojure)","C++":"Native (C++)",C:"Native (C)",
    Zig:"Zig",Nim:"Nim","Jupyter Notebook":"Python (Jupyter)",R:"R",Julia:"Julia",
  };
  return m[top] ?? (top || "Not detected");
}

/* ═══════════════════════════════════════════════
   PACKAGE MANAGER
═══════════════════════════════════════════════ */
export function detectPackageManager(
  ns: Set<string>,
  languages: Record<string, number>,
  pkg: Record<string, unknown> | null
): string {
  const top = Object.keys(languages)[0] ?? "";
  if (top==="TypeScript"||top==="JavaScript"||has(ns,"package.json")) {
    if (has(ns,"bun.lockb")) return "Bun";
    if (has(ns,"pnpm-lock.yaml")) return "pnpm";
    if (has(ns,"yarn.lock")) return "Yarn";
    if (has(ns,"package-lock.json")) return "npm";
    const pm = pkg?.packageManager as string|undefined;
    if (pm?.startsWith("bun")) return "Bun";
    if (pm?.startsWith("pnpm")) return "pnpm";
    if (pm?.startsWith("yarn")) return "Yarn";
    if (has(ns,"package.json")) return "npm";
  }
  if (has(ns,"cargo.toml","cargo.lock")) return "Cargo";
  if (has(ns,"poetry.lock")) return "Poetry";
  if (has(ns,"pipfile","pipfile.lock")) return "Pipenv";
  if (has(ns,"pyproject.toml")) return "pip / pyproject";
  if (has(ns,"requirements.txt")) return "pip";
  if (has(ns,"go.mod","go.sum")) return "Go modules";
  if (has(ns,"pom.xml")) return "Maven";
  if (has(ns,"build.gradle","build.gradle.kts")) return "Gradle";
  if (has(ns,"gemfile","gemfile.lock")) return "Bundler";
  if (has(ns,"composer.json","composer.lock")) return "Composer";
  if (has(ns,"pubspec.yaml")) return "pub";
  if (has(ns,"mix.exs","mix.lock")) return "Mix";
  if (has(ns,"package.swift")) return "Swift Package Manager";
  if (has(ns,"conda.yml","conda.yaml","environment.yml")) return "Conda";
  return "Not detected";
}

/* ═══════════════════════════════════════════════
   TESTING
═══════════════════════════════════════════════ */
export function detectTesting(
  ns: Set<string>,
  languages: Record<string, number>,
  pkg: Record<string, unknown> | null
): string {
  const found: string[] = [];
  const top = Object.keys(languages)[0] ?? "";

  if (has(ns,"jest.config.js","jest.config.ts","jest.config.cjs","jest.config.mjs") || depsHave(pkg,"jest","@types/jest","ts-jest","babel-jest")) found.push("Jest");
  if (has(ns,"vitest.config.ts","vitest.config.js","vitest.config.mjs") || depsHave(pkg,"vitest")) found.push("Vitest");
  if (has(ns,"cypress.config.js","cypress.config.ts","cypress.json","cypress") || depsHave(pkg,"cypress")) found.push("Cypress");
  if (has(ns,"playwright.config.ts","playwright.config.js") || depsHave(pkg,"@playwright/test","playwright")) found.push("Playwright");
  if (depsHave(pkg,"@testing-library/react","@testing-library/vue","@testing-library/svelte")) found.push("Testing Library");
  if (depsHave(pkg,"mocha") || has(ns,".mocharc.js",".mocharc.cjs",".mocharc.yml")) found.push("Mocha");
  if (depsHave(pkg,"ava")) found.push("AVA");
  if (depsHave(pkg,"@storybook/react","@storybook/vue","storybook")) found.push("Storybook");

  if (top==="Python" && (has(ns,"pytest.ini","conftest.py","pyproject.toml") || has(ns,"tests","test","spec"))) found.push("Pytest");
  if (top==="Ruby" && has(ns,"spec")) found.push("RSpec");
  if (top==="PHP" && (has(ns,"phpunit.xml","phpunit.xml.dist") || depsHave(pkg,"phpunit/phpunit"))) found.push("PHPUnit");
  if ((top==="Java"||top==="Kotlin") && has(ns,"src/test")) found.push("JUnit");
  if (top==="Go" && has(ns,"testify")) found.push("Testify");
  if (top==="Rust" && has(ns,"tests")) found.push("Rust test");

  return found.length ? found.join(", ") : "Not detected";
}

/* ═══════════════════════════════════════════════
   CI/CD
═══════════════════════════════════════════════ */
export function detectCiCd(ns: Set<string>, topics: string[]): string {
  const found: string[] = [];
  if (has(ns,".github")) found.push("GitHub Actions");
  if (has(ns,".gitlab-ci.yml",".gitlab-ci.yaml")) found.push("GitLab CI");
  if (has(ns,".travis.yml",".travis.yaml")) found.push("Travis CI");
  if (has(ns,".circleci")) found.push("CircleCI");
  if (has(ns,"jenkinsfile","jenkins")) found.push("Jenkins");
  if (has(ns,".drone.yml",".drone.yaml")) found.push("Drone CI");
  if (has(ns,"azure-pipelines.yml","azure-pipelines.yaml")) found.push("Azure Pipelines");
  if (has(ns,"bitbucket-pipelines.yml")) found.push("Bitbucket Pipelines");
  if (has(ns,"buildkite.yml",".buildkite")) found.push("Buildkite");
  if (topicHas(topics,"github-actions") && !found.includes("GitHub Actions")) found.push("GitHub Actions");
  return found.length ? found.join(", ") : "Not detected";
}

/* ═══════════════════════════════════════════════
   STYLING
═══════════════════════════════════════════════ */
export function detectStyling(
  ns: Set<string>,
  languages: Record<string, number>,
  topics: string[],
  pkg: Record<string, unknown> | null
): string {
  const found: string[] = [];
  if (has(ns,"tailwind.config.js","tailwind.config.ts","tailwind.config.cjs","tailwind.config.mjs") || depsHave(pkg,"tailwindcss") || topicHas(topics,"tailwindcss","tailwind")) found.push("Tailwind CSS");
  if (depsHave(pkg,"@mui/material","@material-ui/core","@mui/joy")) found.push("Material UI");
  if (depsHave(pkg,"antd","@ant-design/icons")) found.push("Ant Design");
  if (depsHave(pkg,"@chakra-ui/react")) found.push("Chakra UI");
  if (has(ns,"components.json") || depsHave(pkg,"@shadcn/ui","shadcn")) found.push("shadcn/ui");
  if (depsHave(pkg,"styled-components")) found.push("styled-components");
  if (depsHave(pkg,"@emotion/styled","@emotion/react")) found.push("Emotion");
  if (depsHave(pkg,"stitches","@stitches/react")) found.push("Stitches");
  if (depsHave(pkg,"sass","node-sass","sass-loader")) found.push("Sass");
  if (depsHave(pkg,"less","less-loader")) found.push("Less");
  if (depsHave(pkg,"bootstrap","react-bootstrap")) found.push("Bootstrap");
  if (depsHave(pkg,"@radix-ui/react-dialog") && found.length === 0) found.push("Radix UI");
  const top = Object.keys(languages)[0] ?? "";
  if (found.length === 0 && (top==="TypeScript"||top==="JavaScript")) {
    if ("SCSS" in languages || "Sass" in languages) return "Sass / SCSS";
    return "CSS Modules";
  }
  return found.length ? found.join(", ") : "Not detected";
}

/* ═══════════════════════════════════════════════
   INFRASTRUCTURE
═══════════════════════════════════════════════ */
export function detectInfra(
  ns: Set<string>,
  topics: string[],
  desc: string | null
): string[] {
  const infra: string[] = [];
  if (has(ns,"dockerfile","dockerfile.dev","dockerfile.prod")) infra.push("Docker");
  if (has(ns,"docker-compose.yml","docker-compose.yaml","docker-compose.dev.yml")) infra.push("Docker Compose");
  if (has(ns,"k8s","kubernetes","helm") || topicHas(topics,"kubernetes","k8s")) infra.push("Kubernetes");
  if (has(ns,"chart.yaml","chart.yml")) infra.push("Helm");
  if (has(ns,"main.tf","terraform",".terraform") || topicHas(topics,"terraform") || descHas(desc,"terraform")) infra.push("Terraform");
  if (has(ns,"pulumi.yaml","pulumi.yml")) infra.push("Pulumi");
  if (has(ns,"cdk.json","infrastructure")) infra.push("AWS CDK");
  if (has(ns,"ansible","ansible.cfg","playbook.yml")) infra.push("Ansible");
  if (has(ns,"vercel.json",".vercel") || topicHas(topics,"vercel")) infra.push("Vercel");
  if (has(ns,"netlify.toml","_redirects","_headers") || topicHas(topics,"netlify")) infra.push("Netlify");
  if (has(ns,"fly.toml") || topicHas(topics,"fly-io","flyio")) infra.push("Fly.io");
  if (has(ns,"railway.toml","railway.json")) infra.push("Railway");
  if (has(ns,"render.yaml","render.yml")) infra.push("Render");
  if (has(ns,".platform.app.yaml")) infra.push("Platform.sh");
  if (has(ns,"serverless.yml","serverless.yaml")) infra.push("Serverless Framework");
  if (has(ns,"wrangler.toml","wrangler.json")) infra.push("Cloudflare Workers");
  if (has(ns,"firebase.json",".firebaserc")) infra.push("Firebase");
  if (has(ns,"amplify.yml")) infra.push("AWS Amplify");
  if (has(ns,"supabase") || topicHas(topics,"supabase")) infra.push("Supabase");
  return infra;
}

/* ═══════════════════════════════════════════════
   ARCHITECTURE
═══════════════════════════════════════════════ */
export function detectArchitecture(
  ns: Set<string>,
  repoType: RepoType,
  framework: string,
  languages: Record<string, number>
): AnalysisArchitecture {
  const indicators: string[] = [];
  let pattern = "Standard";
  let type = "General-purpose";

  const isMonorepo = has(ns,"turbo.json","lerna.json","nx.json","pnpm-workspace.yaml") || (has(ns,"packages","apps") && has(ns,"package.json"));
  const hasContainers = has(ns,"dockerfile","docker-compose.yml","docker-compose.yaml");
  const hasServerless = has(ns,"serverless.yml","wrangler.toml","vercel.json","netlify.toml","firebase.json");
  const hasIaC = has(ns,"main.tf","terraform","pulumi.yaml","cdk.json","ansible.cfg");

  if (isMonorepo) {
    pattern = "Monorepo";
    type = "Multi-package workspace";
    if (has(ns,"turbo.json")) indicators.push("Turborepo config");
    if (has(ns,"nx.json")) indicators.push("Nx workspace");
    if (has(ns,"lerna.json")) indicators.push("Lerna config");
    if (has(ns,"pnpm-workspace.yaml")) indicators.push("pnpm workspaces");
    if (has(ns,"packages")) indicators.push("packages/ directory");
    if (has(ns,"apps")) indicators.push("apps/ directory");
  } else if (framework === "Next.js") {
    if (has(ns,"app") && !has(ns,"pages")) {
      pattern = "Next.js App Router"; type = "Full-stack SSR / RSC";
      indicators.push("app/ directory (App Router)","next.config detected");
    } else if (has(ns,"pages")) {
      pattern = "Next.js Pages Router"; type = "Full-stack SSR";
      indicators.push("pages/ directory","next.config detected");
      if (has(ns,"app")) indicators.push("Partial App Router migration");
    } else {
      pattern = "Next.js"; type = "Full-stack SSR";
      indicators.push("next.config detected");
    }
  } else if (framework === "Astro") {
    pattern = "Astro SSG / SSR"; type = "Content-driven website";
    indicators.push("astro.config detected");
    if (has(ns,"src/content","content")) indicators.push("Content Collections");
  } else if (framework === "SvelteKit") {
    pattern = "SvelteKit"; type = "Full-stack SSR";
    indicators.push("svelte.config detected");
    if (has(ns,"src/routes")) indicators.push("File-based routing");
  } else if (framework === "NestJS") {
    pattern = "NestJS Modular"; type = "Backend REST / GraphQL API";
    indicators.push("NestJS DI container");
    if (has(ns,"src/modules","src/module")) indicators.push("Module-based architecture");
    if (has(ns,"src/common")) indicators.push("Common module");
  } else if (has(ns,"domain","application","infrastructure","presentation")) {
    pattern = "Clean / DDD Architecture"; type = "Domain-driven design";
    if (has(ns,"domain")) indicators.push("Domain layer");
    if (has(ns,"application")) indicators.push("Application layer");
    if (has(ns,"infrastructure")) indicators.push("Infrastructure layer");
    if (has(ns,"presentation")) indicators.push("Presentation layer");
  } else if (has(ns,"features","src/features")) {
    pattern = "Feature-based"; type = "Modular feature structure";
    indicators.push("features/ directory");
    if (has(ns,"shared","src/shared")) indicators.push("shared/ cross-cutting concerns");
  } else if (has(ns,"routes","controllers","src/routes","src/controllers") || has(ns,"api","src/api")) {
    pattern = "MVC / API-First"; type = "REST API backend";
    if (has(ns,"routes","src/routes")) indicators.push("routes/ directory");
    if (has(ns,"controllers","src/controllers")) indicators.push("controllers/ directory");
    if (has(ns,"middleware","src/middleware")) indicators.push("middleware/ directory");
    if (has(ns,"models","src/models")) indicators.push("models/ directory");
  } else if (hasServerless && !isMonorepo) {
    pattern = "Serverless"; type = "Function-as-a-Service";
    if (has(ns,"functions","netlify/functions","api")) indicators.push("functions/ directory");
    if (has(ns,"serverless.yml")) indicators.push("Serverless Framework config");
    if (has(ns,"wrangler.toml")) indicators.push("Cloudflare Workers config");
  } else if (repoType === "mobile") {
    pattern = framework.includes("Flutter") ? "Flutter Layered" : "React Native";
    type = "Mobile application";
    if (has(ns,"lib")) indicators.push("lib/ directory");
    if (has(ns,"src")) indicators.push("src/ source directory");
  } else if (repoType === "library") {
    pattern = "Library / Package"; type = "Reusable module";
    if (has(ns,"src")) indicators.push("src/ source directory");
    if (has(ns,"dist","build")) indicators.push("Built artifacts present");
    if (has(ns,"examples","example")) indicators.push("examples/ directory");
    if (has(ns,"docs")) indicators.push("docs/ directory");
  } else {
    if (has(ns,"src")) {
      indicators.push("src/ directory structure");
      if (repoType === "frontend") { pattern = "SPA"; type = "Single Page Application"; }
      else { pattern = "Standard"; type = repoType === "backend" || repoType === "api" ? "Server application" : "Web application"; }
    }
  }

  // Microservices override
  if (has(ns,"services","microservices") && !isMonorepo && hasContainers) {
    pattern = "Microservices"; type = "Distributed system";
    indicators.push("Multiple service directories","Docker Compose orchestration");
  }

  return { pattern, type, indicators: indicators.slice(0, 6), isMonorepo, hasServerless, hasContainers, hasIaC };
}

/* ═══════════════════════════════════════════════
   METRICS
═══════════════════════════════════════════════ */
export function extractMetrics(contents: GitHubContent[], repo: GitHubRepo): AnalysisMetrics {
  const ns = nameSet(contents);
  const daysSinceLastPush = Math.floor((Date.now() - new Date(repo.pushed_at).getTime()) / 86_400_000);
  return {
    hasReadme: hasPrefix(ns,"readme"),
    hasLicense: has(ns,"license","licence","copying"),
    hasCicd: has(ns,".github",".gitlab-ci.yml",".travis.yml",".circleci","jenkinsfile","azure-pipelines.yml",".drone.yml"),
    hasTests: has(ns,"test","tests","__tests__","spec","specs","e2e","cypress","playwright","jest.config.js","jest.config.ts","vitest.config.ts"),
    hasSecurity: ns.has("security.md") || (has(ns,".github") && ns.has("security.md")),
    hasChangelog: hasPrefix(ns,"changelog") || hasPrefix(ns,"history") || has(ns,"releases.md"),
    hasContributing: hasPrefix(ns,"contributing"),
    hasDockerfile: hasPrefix(ns,"dockerfile") || has(ns,"docker-compose.yml","docker-compose.yaml"),
    hasEditorconfig: has(ns,".editorconfig"),
    hasDependabot: has(ns,".github"),
    hasLinting: has(ns,".eslintrc",".eslintrc.js",".eslintrc.ts",".eslintrc.json",".eslintrc.cjs","eslint.config.js","eslint.config.mjs","eslint.config.ts","biome.json",".biome.json","ruff.toml",".flake8",".pylintrc","golangci.yml","golangci.yaml",".rubocop.yml"),
    hasEnvExample: has(ns,".env.example",".env.sample",".env.template",".env.local.example"),
    hasGitignore: has(ns,".gitignore"),
    isArchived: repo.archived,
    isFork: repo.fork,
    daysSinceLastPush,
    repoAgeYears: (Date.now() - new Date(repo.created_at).getTime()) / (365 * 86_400_000),
    isActive: daysSinceLastPush <= 90,
  };
}

/* ═══════════════════════════════════════════════
   SCORING (TYPE-AWARE)
═══════════════════════════════════════════════ */
type Weights = { codeHealth:number; security:number; maintainability:number; documentation:number };
const TYPE_WEIGHTS: Record<RepoType, Weights> = {
  frontend:     { codeHealth:0.28, security:0.15, maintainability:0.25, documentation:0.32 },
  backend:      { codeHealth:0.30, security:0.35, maintainability:0.25, documentation:0.10 },
  fullstack:    { codeHealth:0.28, security:0.25, maintainability:0.25, documentation:0.22 },
  library:      { codeHealth:0.25, security:0.15, maintainability:0.25, documentation:0.35 },
  mobile:       { codeHealth:0.30, security:0.25, maintainability:0.25, documentation:0.20 },
  desktop:      { codeHealth:0.30, security:0.20, maintainability:0.28, documentation:0.22 },
  cli:          { codeHealth:0.28, security:0.10, maintainability:0.27, documentation:0.35 },
  api:          { codeHealth:0.27, security:0.38, maintainability:0.25, documentation:0.10 },
  monorepo:     { codeHealth:0.30, security:0.20, maintainability:0.32, documentation:0.18 },
  ml:           { codeHealth:0.22, security:0.08, maintainability:0.25, documentation:0.45 },
  devtools:     { codeHealth:0.32, security:0.10, maintainability:0.25, documentation:0.33 },
  unknown:      { codeHealth:0.27, security:0.23, maintainability:0.25, documentation:0.25 },
};

export function computeScores(
  repo: GitHubRepo,
  m: AnalysisMetrics,
  repoType: RepoType,
  languages: Record<string, number>
): AnalysisScores {
  const top = Object.keys(languages)[0] ?? "";

  let codeHealth = 45;
  if (m.hasTests)        codeHealth += 22;
  if (m.hasCicd)         codeHealth += 14;
  if (m.hasLinting)      codeHealth += 9;
  if (m.hasEditorconfig) codeHealth += 4;
  if (m.hasGitignore)    codeHealth += 4;
  if (m.daysSinceLastPush < 14) codeHealth += 4;
  else if (m.daysSinceLastPush > 365) codeHealth -= 8;
  if (top === "TypeScript" || top === "Rust" || top === "Go") codeHealth += 4;
  if (m.isArchived) codeHealth -= 12;
  codeHealth = Math.max(0, Math.min(100, codeHealth));

  let security = 50;
  if (m.hasSecurity)     security += 18;
  if (m.hasDependabot)   security += 12;
  if (m.hasCicd)         security += 10;
  if (m.hasLicense)      security += 6;
  if (m.hasEnvExample)   security += 9;
  if (m.hasGitignore)    security += 5;
  if (m.daysSinceLastPush > 365) security -= 10;
  if (m.isArchived) security -= 18;
  security = Math.max(0, Math.min(100, security));

  let maintainability = 42;
  if (m.hasReadme)        maintainability += 12;
  if (m.hasLicense)       maintainability += 8;
  if (m.hasContributing)  maintainability += 8;
  if (m.hasChangelog)     maintainability += 8;
  if (m.hasCicd)          maintainability += 6;
  if (m.hasEditorconfig)  maintainability += 4;
  if (m.hasLinting)       maintainability += 7;
  if (m.isActive)         maintainability += 8;
  else if (m.daysSinceLastPush > 365) maintainability -= 12;
  if (m.repoAgeYears >= 1 && m.isActive) maintainability += 4;
  if (m.isArchived) maintainability -= 15;
  if (m.isFork)     maintainability -= 4;
  maintainability = Math.max(0, Math.min(100, maintainability));

  let documentation = 35;
  if (m.hasReadme)              documentation += 28;
  if (m.hasChangelog)           documentation += 12;
  if (m.hasContributing)        documentation += 8;
  if (repo.description)         documentation += 8;
  if (repo.homepage)            documentation += 5;
  if (repo.has_wiki)            documentation += 4;
  if (repo.has_discussions)     documentation += 3;
  if (repo.topics.length >= 3)  documentation += 3;
  documentation = Math.max(0, Math.min(100, documentation));

  const w = TYPE_WEIGHTS[repoType];
  const overall = Math.round(
    codeHealth * w.codeHealth +
    security * w.security +
    maintainability * w.maintainability +
    documentation * w.documentation
  );

  return {
    codeHealth: Math.round(codeHealth),
    security: Math.round(security),
    maintainability: Math.round(maintainability),
    documentation: Math.round(documentation),
    overall: Math.max(0, Math.min(100, overall)),
  };
}

/* ═══════════════════════════════════════════════
   ANTI-PATTERNS
═══════════════════════════════════════════════ */
export function detectAntiPatterns(
  ns: Set<string>,
  metrics: AnalysisMetrics,
  repo: GitHubRepo
): AntiPattern[] {
  const p: AntiPattern[] = [];
  if (ns.has(".env") && !metrics.hasEnvExample)
    p.push({ severity:"critical", label:".env committed", description:"A .env file appears in the root. Secrets may be exposed — audit git history immediately and rotate credentials." });
  if (!metrics.hasGitignore)
    p.push({ severity:"high", label:"No .gitignore", description:"Without a .gitignore, build artifacts, node_modules, and sensitive files may have been committed unintentionally." });
  if (metrics.isArchived)
    p.push({ severity:"medium", label:"Archived repository", description:"This repository is archived and no longer actively maintained. Dependencies may carry unpatched CVEs." });
  if (metrics.daysSinceLastPush > 365 && !metrics.isArchived)
    p.push({ severity:"medium", label:`${Math.floor(metrics.daysSinceLastPush/30)}+ months stale`, description:`No commits in over ${Math.floor(metrics.daysSinceLastPush/30)} months. Dependency vulnerabilities are likely unaddressed.` });
  if (repo.open_issues_count > 200 && repo.stargazers_count < 500)
    p.push({ severity:"medium", label:"High issue backlog", description:`${repo.open_issues_count} open issues vs. ${repo.stargazers_count} stars indicates significant unresolved technical debt.` });
  return p;
}

/* ═══════════════════════════════════════════════
   INSIGHTS ENGINE
═══════════════════════════════════════════════ */
export function generateInsights(
  repo: GitHubRepo,
  metrics: AnalysisMetrics,
  scores: AnalysisScores,
  stack: AnalysisStack,
  arch: AnalysisArchitecture,
  repoType: RepoType
): AnalysisInsight[] {
  const insights: AnalysisInsight[] = [];
  const typeLabel: Record<RepoType,string> = {
    frontend:"frontend",backend:"backend",fullstack:"full-stack",library:"library",
    mobile:"mobile app",desktop:"desktop app",cli:"CLI tool",api:"API service",
    monorepo:"monorepo",ml:"ML project",devtools:"developer tool",unknown:"repository",
  };
  const tl = typeLabel[repoType];

  // Architecture
  if (arch.pattern === "Next.js App Router")
    insights.push({ type:"success", text:"Next.js App Router architecture — RSC-ready with streaming and nested layout support. Well-positioned for React 19.", category:"Architecture" });
  else if (arch.pattern === "Next.js Pages Router")
    insights.push({ type:"info", text:"Next.js Pages Router detected. The stable App Router introduces React Server Components, layout nesting, and better data fetching patterns.", category:"Architecture" });
  if (arch.isMonorepo)
    insights.push({ type:"success", text:"Monorepo structure with shared tooling detected — enables atomic cross-package releases and consistent developer experience.", category:"Architecture" });
  if (arch.hasContainers)
    insights.push({ type:"success", text:`Docker containerization detected — dev/prod environment parity is enforced, eliminating "works on my machine" issues.`, category:"Infrastructure" });
  if (arch.hasIaC)
    insights.push({ type:"success", text:"Infrastructure-as-Code detected — infrastructure changes are auditable, version-controlled, and reproducible across environments.", category:"Infrastructure" });

  // Stack
  if (stack.packageManager==="pnpm")
    insights.push({ type:"success", text:"pnpm detected — content-addressable storage means up to 60% less disk usage and significantly faster installs than npm.", category:"Stack" });
  else if (stack.packageManager==="Bun")
    insights.push({ type:"success", text:"Bun runtime and package manager selected — orders of magnitude faster installs and test runs compared to Node.js equivalents.", category:"Stack" });

  if (stack.testing !== "Not detected" && stack.testing) {
    const tools = stack.testing.split(", ");
    const hasE2E = tools.some(t=>["Cypress","Playwright"].includes(t));
    const hasUnit = tools.some(t=>["Jest","Vitest","Mocha","AVA","Pytest","RSpec","JUnit","Rust test"].includes(t));
    if (hasE2E && hasUnit)
      insights.push({ type:"success", text:`Multi-layer test strategy with ${stack.testing} — unit and end-to-end coverage reflects mature QA discipline.`, category:"Quality" });
    else
      insights.push({ type:"success", text:`${stack.testing} detected. ${hasE2E ? "Adding unit tests with Vitest would complete the quality pyramid." : "Adding Playwright for end-to-end coverage would complete the quality pyramid."}`, category:"Quality" });
  }

  // Maintenance signals
  if (metrics.hasChangelog)
    insights.push({ type:"success", text:"CHANGELOG maintained — signals professional release governance and respect for downstream consumers.", category:"Documentation" });
  if (metrics.hasContributing)
    insights.push({ type:"success", text:"CONTRIBUTING guide present — reduces onboarding friction and attracts quality contributors.", category:"Community" });
  if (metrics.daysSinceLastPush <= 3)
    insights.push({ type:"success", text:"Pushed within the last 3 days — high development velocity and responsive ownership.", category:"Activity" });
  else if (metrics.daysSinceLastPush > 180)
    insights.push({ type:"warning", text:`${metrics.daysSinceLastPush} days since last push. Prolonged inactivity in a ${tl} raises the risk of unpatched dependency CVEs.`, category:"Activity" });

  // Warnings
  if (!metrics.hasTests)
    insights.push({ type:"warning", text:`No test suite detected. ${repoType==="library" ? "Libraries without tests expose consumers to silent breaking changes." : `For a ${tl}, add ${repoType==="frontend"||repoType==="fullstack" ? "Vitest + Testing Library" : "the appropriate test framework"} to catch regressions automatically.`}`, category:"Quality" });
  if (!metrics.hasCicd)
    insights.push({ type:"warning", text:"No CI/CD pipeline found. GitHub Actions is free for public repos — automating test runs and lint checks prevents regressions from reaching production.", category:"DevOps" });
  if (!metrics.hasLicense && repoType !== "unknown")
    insights.push({ type:"warning", text:`No license file found. Without an explicit license, this ${tl} is legally "all rights reserved" — contributors and users have no granted usage rights.`, category:"Legal" });
  if (!metrics.hasSecurity && (repoType==="backend"||repoType==="api"||repoType==="fullstack"))
    insights.push({ type:"info", text:"No SECURITY.md found. A vulnerability disclosure policy tells security researchers how to responsibly report issues.", category:"Security" });
  if (!metrics.hasEnvExample && (repoType==="fullstack"||repoType==="backend"||repoType==="api"))
    insights.push({ type:"warning", text:`No .env.example detected. For a ${tl}, documenting required environment variables prevents misconfigured deployments and onboarding friction.`, category:"Developer Experience" });

  // Summary
  if (scores.overall >= 85)
    insights.push({ type:"success", text:`Score of ${scores.overall}/100 places this ${tl} among the top-quality GitHub repositories. Excellent engineering discipline.`, category:"Summary" });
  else if (scores.overall < 55)
    insights.push({ type:"info", text:`Score of ${scores.overall}/100 — the highest-leverage improvements for a ${tl} are automated testing and a CI pipeline.`, category:"Summary" });

  return insights.slice(0, 9);
}
