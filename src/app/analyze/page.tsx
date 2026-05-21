"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  GitBranch, Star, GitFork, AlertCircle, ExternalLink,
  CheckCircle2, AlertTriangle, Info, Zap, Clock,
  Code2, Shield, BarChart3, FileText, ArrowLeft,
  Layers, Package, Activity, Hexagon, Cpu, RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import type { AnalysisResult, AnalysisInsight } from "@/types/analysis";
import { cn } from "@/lib/utils";

/* ─── Design tokens ──────────────────────────── */
const LANG_COLORS: Record<string, string> = {
  TypeScript: "#3178c6", JavaScript: "#f7df1e", Python: "#3572A5",
  Rust: "#dea584", Go: "#00ADD8", Java: "#b07219", Kotlin: "#A97BFF",
  "C++": "#f34b7d", C: "#555555", Ruby: "#701516", PHP: "#4F5D95",
  Swift: "#F05138", Dart: "#00B4AB", Elixir: "#6e4a7e", Shell: "#89e051",
  HTML: "#e34c26", CSS: "#563d7c", Vue: "#41b883", Svelte: "#ff3e00",
};

function langColor(lang: string): string {
  return LANG_COLORS[lang] ?? "#7c6df8";
}

/* ─── Sub-components ─────────────────────────── */

function Navbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 flex h-16 items-center justify-between border-b border-white/[0.07] bg-bg/90 px-6 backdrop-blur-xl md:px-10">
      <Link href="/" className="flex items-center gap-2.5 group">
        <div className="relative flex h-8 w-8 items-center justify-center">
          <Hexagon className="absolute h-8 w-8 text-accent opacity-20 group-hover:opacity-30 transition-opacity" strokeWidth={1} />
          <Hexagon className="h-5 w-5 text-accent-mid" strokeWidth={2} fill="rgba(124,109,248,0.1)" />
        </div>
        <span className="font-display text-sm font-semibold text-foreground tracking-tight">
          DevScope<span className="text-accent-mid"> AI</span>
        </span>
      </Link>
      <Link href="/" className="flex items-center gap-1.5 text-sm text-foreground-sub hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Back
      </Link>
    </header>
  );
}

/* Loading skeleton */
const LOAD_STEPS = [
  "Connecting to GitHub",
  "Fetching repository metadata",
  "Analyzing language composition",
  "Mapping file structure",
  "Computing quality scores",
  "Generating insights",
];

function LoadingView({ step }: { step: number }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center pt-16">
      <div className="w-full max-w-md px-6">
        <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0a0a16] shadow-card">
          <div className="flex items-center gap-2 border-b border-white/[0.06] bg-[#101020] px-4 py-3">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f56]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#27c93f]" />
            <span className="ml-3 font-mono text-xs text-foreground-muted">devscope — analyzing</span>
          </div>
          <div className="p-6 font-mono text-xs">
            {LOAD_STEPS.map((s, i) => (
              <div key={s} className="mb-3 flex items-center gap-3">
                {i < step ? (
                  <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0 text-status-green" />
                ) : i === step ? (
                  <RefreshCw className="h-3.5 w-3.5 flex-shrink-0 animate-spin text-accent-mid" />
                ) : (
                  <span className="h-3.5 w-3.5 flex-shrink-0 rounded-full border border-white/[0.15]" />
                )}
                <span className={cn(
                  i < step ? "text-status-green" :
                  i === step ? "text-foreground" :
                  "text-foreground-muted"
                )}>
                  {s}{i <= step ? "..." : ""}
                </span>
              </div>
            ))}
          </div>
        </div>
        <p className="mt-4 text-center text-xs text-foreground-muted">
          This usually takes 2–5 seconds
        </p>
      </div>
    </div>
  );
}

/* Error view */
function ErrorView({ message, repo }: { message: string; repo: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center pt-16 px-6">
      <div className="w-full max-w-md text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-status-red/20 bg-status-red/10 mx-auto">
          <AlertCircle className="h-6 w-6 text-status-red" />
        </div>
        <h1 className="font-display text-xl font-bold text-foreground">Analysis failed</h1>
        <p className="mt-2 text-sm text-foreground-sub leading-relaxed">{message}</p>
        <div className="mt-6 flex flex-col gap-2">
          <Link
            href={`/?repo=${encodeURIComponent(repo)}`}
            className="btn-ghost w-full justify-center"
          >
            Try another repository
          </Link>
          <Link href="/" className="text-sm text-foreground-muted hover:text-foreground transition-colors">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}

/* Score bar */
function ScoreBar({ label, value, color, icon: Icon }: { label: string; value: number; color: string; icon: React.ElementType }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-xs text-foreground-sub">
          <Icon className="h-3.5 w-3.5" />
          {label}
        </span>
        <span className="font-mono text-xs font-semibold" style={{ color }}>
          {value}/100
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1.2, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="h-full rounded-full"
          style={{ background: color }}
        />
      </div>
    </div>
  );
}

/* Metric pill */
function MetricPill({ label, value }: { label: string; value: boolean | string }) {
  const ok = value === true || (typeof value === "string" && value !== "None detected" && value !== "Unknown");
  return (
    <div className={cn(
      "flex items-center gap-2 rounded-lg border px-3 py-2 text-xs",
      ok
        ? "border-status-green/20 bg-status-green/[0.07] text-status-green"
        : "border-white/[0.07] bg-white/[0.02] text-foreground-muted"
    )}>
      {ok
        ? <CheckCircle2 className="h-3 w-3 flex-shrink-0" />
        : <AlertCircle className="h-3 w-3 flex-shrink-0" />}
      <span className="truncate">{label}: {typeof value === "boolean" ? (value ? "Yes" : "No") : value}</span>
    </div>
  );
}

/* Insight item */
function InsightItem({ insight }: { insight: AnalysisInsight }) {
  const map = {
    success: { icon: CheckCircle2, color: "#34d399", border: "rgba(52,211,153,.15)", bg: "rgba(52,211,153,.06)" },
    warning: { icon: AlertTriangle, color: "#fb923c", border: "rgba(251,146,60,.15)", bg: "rgba(251,146,60,.06)" },
    info: { icon: Info, color: "#60a5fa", border: "rgba(96,165,250,.15)", bg: "rgba(96,165,250,.06)" },
  } as const;
  const conf = map[insight.type];
  const Icon = conf.icon;
  return (
    <div
      className="flex items-start gap-3 rounded-xl border px-4 py-3"
      style={{ borderColor: conf.border, backgroundColor: conf.bg }}
    >
      <Icon className="mt-0.5 h-4 w-4 flex-shrink-0" style={{ color: conf.color }} />
      <p className="text-sm leading-relaxed text-foreground-sub">{insight.text}</p>
    </div>
  );
}

/* Language bars */
function LanguageChart({ languages }: { languages: Record<string, number> }) {
  const total = Object.values(languages).reduce((a, b) => a + b, 0);
  const sorted = Object.entries(languages).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const percents = sorted.map(([lang, bytes]) => ({
    lang, pct: Math.round((bytes / total) * 1000) / 10,
  }));

  return (
    <div>
      {/* Stacked bar */}
      <div className="mb-4 flex h-2.5 w-full overflow-hidden rounded-full">
        {percents.map(({ lang, pct }) => (
          <motion.div
            key={lang}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            style={{ backgroundColor: langColor(lang) }}
          />
        ))}
      </div>
      {/* Legend */}
      <div className="flex flex-col gap-2">
        {percents.map(({ lang, pct }) => (
          <div key={lang} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: langColor(lang) }} />
              <span className="text-sm text-foreground-sub">{lang}</span>
            </div>
            <span className="font-mono text-xs text-foreground-muted">{pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* Main result view */
function ResultView({ data }: { data: AnalysisResult }) {
  const { repo, languages, stack, scores, metrics, insights } = data;

  const scoreItems = [
    { label: "Code Health", value: scores.codeHealth, color: "#34d399", icon: Code2 },
    { label: "Security", value: scores.security, color: "#60a5fa", icon: Shield },
    { label: "Maintainability", value: scores.maintainability, color: "#a78bfa", icon: Activity },
    { label: "Documentation", value: scores.documentation, color: "#fb923c", icon: FileText },
  ] as const;

  const overallColor =
    scores.overall >= 85 ? "#34d399"
    : scores.overall >= 65 ? "#60a5fa"
    : "#fb923c";

  const daysSince = metrics.daysSinceLastPush;
  const lastPush = daysSince === 0 ? "today"
    : daysSince === 1 ? "yesterday"
    : `${daysSince}d ago`;

  const stackItems = [
    { label: "Framework", value: stack.framework, icon: Layers },
    { label: "Runtime", value: stack.runtime, icon: Cpu },
    { label: "Package Mgr", value: stack.packageManager, icon: Package },
    { label: "CI/CD", value: stack.cicd, icon: Activity },
    { label: "Styling", value: stack.styling, icon: Code2 },
    { label: "Testing", value: stack.testing, icon: BarChart3 },
  ] as const;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto max-w-6xl px-6 pb-24 pt-28 md:px-8"
    >
      {/* ── Repo header ───────────────────────── */}
      <div className="mb-8">
        <div className="mb-3 flex flex-wrap items-start gap-3">
          <h1 className="font-display text-2xl font-bold text-foreground md:text-3xl">
            {data.owner}/<span className="text-accent-mid">{data.name}</span>
          </h1>
          {data.aiPowered && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-accent-border bg-accent-soft px-2.5 py-1 text-[11px] font-medium text-accent-mid">
              <Cpu className="h-3 w-3" /> AI-powered
            </span>
          )}
        </div>

        {repo.description && (
          <p className="mb-4 max-w-2xl text-foreground-sub leading-relaxed">
            {repo.description}
          </p>
        )}

        {/* Stats row */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-foreground-muted">
          <span className="flex items-center gap-1.5">
            <Star className="h-4 w-4" />
            {repo.stars.toLocaleString()} stars
          </span>
          <span className="flex items-center gap-1.5">
            <GitFork className="h-4 w-4" />
            {repo.forks.toLocaleString()} forks
          </span>
          <span className="flex items-center gap-1.5">
            <GitBranch className="h-4 w-4" />
            {repo.defaultBranch}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            Pushed {lastPush}
          </span>
          {repo.license && (
            <span className="flex items-center gap-1.5">
              <FileText className="h-4 w-4" />
              {repo.license}
            </span>
          )}
          <a
            href={`https://github.com/${repo.fullName}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-accent-mid hover:text-accent-mid/80 transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            View on GitHub
          </a>
        </div>

        {/* Topics */}
        {repo.topics.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {repo.topics.map((t) => (
              <span
                key={t}
                className="rounded-full border border-white/[0.08] bg-white/[0.04] px-2.5 py-0.5 text-xs text-foreground-sub"
              >
                {t}
              </span>
            ))}
          </div>
        )}

        {/* Analysis meta */}
        <div className="mt-4 flex items-center gap-2 text-xs text-foreground-muted">
          <span className="flex items-center gap-1.5 rounded-full border border-status-green/20 bg-status-green/[0.08] px-3 py-1 text-status-green">
            <span className="h-1.5 w-1.5 animate-pulse-glow rounded-full bg-status-green" />
            Analysis complete in {data.analysisTime}ms
          </span>
        </div>
      </div>

      {/* ── Main grid ─────────────────────────── */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_360px]">
        {/* Left column */}
        <div className="flex flex-col gap-5">
          {/* Languages */}
          {Object.keys(languages).length > 0 && (
            <div className="card p-6">
              <h2 className="mb-5 font-display text-sm font-semibold uppercase tracking-wider text-foreground-muted">
                Language Composition
              </h2>
              <LanguageChart languages={languages} />
            </div>
          )}

          {/* Stack detection */}
          <div className="card p-6">
            <h2 className="mb-5 font-display text-sm font-semibold uppercase tracking-wider text-foreground-muted">
              Stack Detection
            </h2>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {stackItems.map(({ label, value, icon: Icon }) => (
                <div key={label} className="rounded-lg border border-white/[0.07] bg-white/[0.02] p-3">
                  <div className="mb-1.5 flex items-center gap-1.5">
                    <Icon className="h-3.5 w-3.5 text-accent-mid" />
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-foreground-muted">
                      {label}
                    </span>
                  </div>
                  <span className={cn(
                    "font-mono text-xs font-medium",
                    value === "Unknown" || value === "None detected"
                      ? "text-foreground-muted"
                      : "text-foreground"
                  )}>
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Metrics */}
          <div className="card p-6">
            <h2 className="mb-5 font-display text-sm font-semibold uppercase tracking-wider text-foreground-muted">
              Repository Health Checks
            </h2>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <MetricPill label="README" value={metrics.hasReadme} />
              <MetricPill label="License" value={metrics.hasLicense} />
              <MetricPill label="Tests" value={metrics.hasTests} />
              <MetricPill label="CI/CD" value={metrics.hasCicd} />
              <MetricPill label="Security Policy" value={metrics.hasSecurity} />
              <MetricPill label="Changelog" value={metrics.hasChangelog} />
              <MetricPill label="Contributing Guide" value={metrics.hasContributing} />
              <MetricPill label="Dockerfile" value={metrics.hasDockerfile} />
              <MetricPill label="EditorConfig" value={metrics.hasEditorconfig} />
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-5">
          {/* Overall score */}
          <div className="card p-6 text-center">
            <div className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-2xl border border-white/[0.08] bg-accent-soft mx-auto">
              <Zap className="h-9 w-9 text-accent-mid" strokeWidth={1.5} />
            </div>
            <p className="text-xs uppercase tracking-wider text-foreground-muted mb-1">
              Overall Quality Score
            </p>
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2, type: "spring", stiffness: 200 }}
              className="font-display text-6xl font-bold"
              style={{ color: overallColor }}
            >
              {scores.overall}
            </motion.div>
            <p className="text-sm text-foreground-muted">out of 100</p>
            {scores.overall >= 80 && (
              <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-status-green/20 bg-status-green/[0.08] px-3 py-1 text-xs font-medium text-status-green">
                <Star className="h-3 w-3" /> Top quality
              </div>
            )}
          </div>

          {/* Score bars */}
          <div className="card p-6">
            <h2 className="mb-5 font-display text-sm font-semibold uppercase tracking-wider text-foreground-muted">
              Quality Scores
            </h2>
            <div className="flex flex-col gap-5">
              {scoreItems.map((s) => (
                <ScoreBar key={s.label} {...s} />
              ))}
            </div>
          </div>

          {/* Quick stats */}
          <div className="card divide-y divide-white/[0.06] overflow-hidden">
            {[
              { label: "Open Issues", value: repo.openIssues.toLocaleString() },
              { label: "Watchers", value: repo.watchers.toLocaleString() },
              { label: "Repo Size", value: `${(repo.sizeKb / 1024).toFixed(1)} MB` },
              { label: "Default Branch", value: repo.defaultBranch },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between px-5 py-3">
                <span className="text-sm text-foreground-muted">{label}</span>
                <span className="font-mono text-sm text-foreground">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── AI Insights ────────────────────────── */}
      {insights.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-5 card p-6"
        >
          <h2 className="mb-5 font-display text-sm font-semibold uppercase tracking-wider text-foreground-muted">
            {data.aiPowered ? "AI-Powered Insights" : "Insights"}
          </h2>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {insights.map((ins, i) => (
              <InsightItem key={i} insight={ins} />
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Analyze another ───────────────────── */}
      <div className="mt-10 flex justify-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] px-6 py-3 text-sm text-foreground-sub transition-all hover:bg-white/[0.04] hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Analyze another repository
        </Link>
      </div>
    </motion.div>
  );
}

/* ─── Main page ──────────────────────────────── */
function AnalyzeContent() {
  const searchParams = useSearchParams();
  const rawRepo = searchParams.get("repo") ?? "";

  const [step, setStep] = useState(0);
  const [state, setState] = useState<"loading" | "success" | "error">("loading");
  const [data, setData] = useState<AnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!rawRepo) {
      setErrorMsg("No repository specified. Go back and enter a GitHub URL.");
      setState("error");
      return;
    }

    // Animate loading steps
    const timers: ReturnType<typeof setTimeout>[] = [];
    LOAD_STEPS.forEach((_, i) => {
      timers.push(setTimeout(() => setStep(i), i * 700));
    });

    // Actual fetch
    fetch(`/api/analyze?repo=${encodeURIComponent(rawRepo)}`)
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok || json.error) {
          throw new Error(json.error ?? "Unknown error");
        }
        return json as AnalysisResult;
      })
      .then((result) => {
        timers.forEach(clearTimeout);
        setStep(LOAD_STEPS.length);
        setTimeout(() => {
          setData(result);
          setState("success");
        }, 400);
      })
      .catch((err: Error) => {
        timers.forEach(clearTimeout);
        setErrorMsg(err.message);
        setState("error");
      });

    return () => timers.forEach(clearTimeout);
  }, [rawRepo]);

  return (
    <>
      <Navbar />
      {state === "loading" && <LoadingView step={step} />}
      {state === "error" && <ErrorView message={errorMsg} repo={rawRepo} />}
      {state === "success" && data && <ResultView data={data} />}
    </>
  );
}

export default function AnalyzePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <RefreshCw className="h-5 w-5 animate-spin text-accent-mid" />
        </div>
      }
    >
      <AnalyzeContent />
    </Suspense>
  );
}
