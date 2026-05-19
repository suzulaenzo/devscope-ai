import {
    Layers,
    Zap,
    Shield,
    GitBranch,
    BarChart3,
    Code2,
    Package,
    Activity,
    Eye,
    Cpu,
  } from "lucide-react";
  import type { NavItem, Feature, Stat, PricingTier } from "@/types";
  
  /* ─── Navigation ─────────────────────────────── */
  export const NAV_LINKS: NavItem[] = [
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#pricing" },
    { label: "Docs", href: "/docs" },
    { label: "Changelog", href: "/changelog" },
  ];
  
  /* ─── Features ───────────────────────────────── */
  export const FEATURES: Feature[] = [
    {
      id: "stack-detection",
      icon: Layers,
      title: "Stack Detection",
      description:
        "Automatically identifies languages, frameworks, runtimes, and tooling across your entire codebase with 98% accuracy.",
      tag: "Core",
    },
    {
      id: "architecture",
      icon: GitBranch,
      title: "Architecture Analysis",
      description:
        "Understands monorepos, microservices, MVC, event-driven patterns and maps out your system's structural design.",
      tag: "Core",
    },
    {
      id: "quality-score",
      icon: BarChart3,
      title: "Quality Scoring",
      description:
        "Comprehensive scoring across code health, security posture, test coverage, and maintainability indices.",
      tag: "Intelligence",
    },
    {
      id: "security",
      icon: Shield,
      title: "Security Audit",
      description:
        "Scans for exposed secrets, outdated dependencies with CVEs, insecure patterns, and OWASP Top 10 vulnerabilities.",
      tag: "Security",
    },
    {
      id: "dependencies",
      icon: Package,
      title: "Dependency Graph",
      description:
        "Visualizes package relationships, detects circular dependencies, and highlights risky or unmaintained libraries.",
      tag: "Intelligence",
    },
    {
      id: "ai-insights",
      icon: Cpu,
      title: "AI Recommendations",
      description:
        "Context-aware suggestions for refactoring, performance improvements, and architectural decisions from our models.",
      tag: "AI",
    },
    {
      id: "ci-integration",
      icon: Activity,
      title: "CI/CD Detection",
      description:
        "Identifies pipeline configuration, test automation coverage, deployment targets, and release cadence signals.",
      tag: "DevOps",
    },
    {
      id: "code-review",
      icon: Eye,
      title: "Code Review Assist",
      description:
        "Generates PR-ready summaries, surfaces complexity hotspots, and flags areas requiring immediate attention.",
      tag: "Workflow",
    },
    {
      id: "api-access",
      icon: Code2,
      title: "REST & GraphQL API",
      description:
        "Integrate DevScope into your own tools, dashboards, or workflows via a clean, versioned API with webhooks.",
      tag: "Platform",
    },
  ];
  
  /* ─── Stats ──────────────────────────────────── */
  export const STATS: Stat[] = [
    { value: "52k+", label: "Repositories Analyzed", description: "Across 80+ countries" },
    { value: "2.4M", label: "Insights Generated", description: "And counting" },
    { value: "98%", label: "Stack Accuracy", description: "Industry-leading detection" },
    { value: "<2s", label: "Analysis Time", description: "Average per repository" },
  ];
  
  /* ─── Pricing ────────────────────────────────── */
  export const PRICING_TIERS: PricingTier[] = [
    {
      id: "starter",
      name: "Starter",
      price: { monthly: 0, annually: 0 },
      description: "For developers exploring AI-driven repository insights.",
      features: [
        "10 repository analyses / month",
        "Stack & dependency detection",
        "Basic quality score",
        "Public repositories only",
        "Community support",
      ],
      cta: "Get started free",
    },
    {
      id: "pro",
      name: "Pro",
      price: { monthly: 29, annually: 22 },
      description: "For engineers who want deep, actionable intelligence.",
      features: [
        "Unlimited repository analyses",
        "Full quality & security audit",
        "AI-powered recommendations",
        "Private repositories",
        "Dependency graph visualization",
        "Priority processing",
        "Email support",
      ],
      cta: "Start 14-day trial",
      highlighted: true,
      badge: "Most popular",
    },
    {
      id: "team",
      name: "Team",
      price: { monthly: 99, annually: 79 },
      description: "For engineering teams that move fast and need full context.",
      features: [
        "Everything in Pro",
        "Up to 15 team members",
        "CI/CD integration",
        "REST & GraphQL API",
        "Custom webhooks",
        "Audit logs & SSO",
        "Dedicated Slack support",
      ],
      cta: "Talk to us",
    },
  ];
  
  /* ─── Trust Bar Logos (text-based) ───────────────── */
  export const TRUSTED_COMPANIES = [
    "Vercel",
    "Stripe",
    "Linear",
    "Planetscale",
    "Resend",
    "Turso",
    "Cal.com",
    "Liveblocks",
  ];