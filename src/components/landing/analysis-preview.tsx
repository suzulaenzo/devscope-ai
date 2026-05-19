"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  GitBranch,
  Shield,
  Zap,
  Code2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Star,
} from "lucide-react";
import { Container } from "@/components/shared/container";
import { SectionHeader } from "@/components/shared/section-header";
import { cn } from "@/lib/utils";

const DEMO_REPOS = [
  { name: "vercel/next.js", lang: "TypeScript", stars: "122k" },
  { name: "supabase/supabase", lang: "TypeScript", stars: "68k" },
  { name: "prisma/prisma", lang: "TypeScript", stars: "38k" },
];

const SCORES = [
  { label: "Code Health", value: 92, color: "#34d399" },
  { label: "Security", value: 88, color: "#60a5fa" },
  { label: "Performance", value: 95, color: "#a78bfa" },
  { label: "Maintainability", value: 84, color: "#fb923c" },
];

const INSIGHTS = [
  { icon: CheckCircle2, color: "#34d399", text: "Strong TypeScript coverage across 94.2% of files" },
  { icon: CheckCircle2, color: "#34d399", text: "11 GitHub Actions workflows detected — CI/CD mature" },
  { icon: AlertTriangle, color: "#fb923c", text: "3 dependencies with pending major version upgrades" },
  { icon: CheckCircle2, color: "#34d399", text: "Test coverage estimated at 78% — above threshold" },
  { icon: AlertTriangle, color: "#fbbf24", text: "2 circular dependencies detected in /packages/next" },
];

export function AnalysisPreview() {
  const [activeRepo, setActiveRepo] = useState(0);

  return (
    <section className="section-padding overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-dot opacity-40" />
      <Container>
        <SectionHeader
          eyebrow="Live Preview"
          title="See DevScope"
          titleAccent="in action."
          description="A real analysis output from our AI engine. Explore the depth of insight delivered for any repository in seconds."
          className="mb-16"
        />

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-hidden rounded-2xl border border-white/[0.08] bg-surface shadow-[0_32px_80px_rgba(0,0,0,0.45)]"
        >
          {/* App chrome bar */}
          <div className="flex items-center gap-3 border-b border-white/[0.06] bg-[#0a0a18] px-5 py-3.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f56]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#27c93f]" />
            <div className="mx-auto flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.03] px-4 py-1.5">
              <GitBranch className="h-3 w-3 text-foreground-muted" />
              <span className="font-mono text-xs text-foreground-muted">
                devscope.ai/analyze/{DEMO_REPOS[activeRepo].name}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr]">
            {/* Sidebar */}
            <div className="border-b border-white/[0.06] bg-[#09091a] p-4 lg:border-b-0 lg:border-r">
              <p className="mb-3 px-2 text-[10px] font-semibold uppercase tracking-widest text-foreground-muted">
                Recent analyses
              </p>
              <div className="flex flex-col gap-1">
                {DEMO_REPOS.map((repo, i) => (
                  <button
                    key={repo.name}
                    onClick={() => setActiveRepo(i)}
                    className={cn(
                      "flex w-full flex-col gap-0.5 rounded-lg px-3 py-2.5 text-left transition-all",
                      activeRepo === i
                        ? "bg-accent-soft border border-accent-border text-foreground"
                        : "text-foreground-sub hover:bg-white/[0.04]"
                    )}
                  >
                    <span className="font-mono text-xs font-medium">{repo.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-foreground-muted">{repo.lang}</span>
                      <span className="flex items-center gap-0.5 text-[10px] text-foreground-muted">
                        <Star className="h-2.5 w-2.5" />
                        {repo.stars}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Main content */}
            <div className="p-6 lg:p-8">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="font-display text-lg font-bold text-foreground">
                    {DEMO_REPOS[activeRepo].name}
                  </h3>
                  <p className="mt-0.5 font-mono text-xs text-foreground-muted">
                    TypeScript · Monorepo · App Router · Turborepo
                  </p>
                </div>
                <div className="flex items-center gap-2 rounded-full border border-status-green/25 bg-status-green/10 px-3 py-1.5">
                  <div className="h-1.5 w-1.5 animate-pulse-glow rounded-full bg-status-green" />
                  <span className="text-xs font-medium text-status-green">
                    Analysis complete
                  </span>
                  <span className="text-xs text-foreground-muted flex items-center gap-1">
                    <Clock className="h-3 w-3" /> 1.87s
                  </span>
                </div>
              </div>

              {/* Score bars */}
              <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {SCORES.map((score) => (
                  <div key={score.label}>
                    <div className="mb-1.5 flex items-center justify-between">
                      <span className="text-xs text-foreground-sub">{score.label}</span>
                      <span
                        className="font-mono text-xs font-semibold"
                        style={{ color: score.color }}
                      >
                        {score.value}/100
                      </span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${score.value}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                        className="h-full rounded-full"
                        style={{ background: score.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Overall score */}
              <div className="mb-6 flex items-center gap-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-accent-soft">
                  <Zap className="h-6 w-6 text-accent-mid" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-xs text-foreground-muted">Overall Quality Score</p>
                  <p className="font-display text-2xl font-bold gradient-text-accent">91/100</p>
                </div>
                <div className="ml-auto text-right">
                  <p className="text-xs text-foreground-muted">Percentile</p>
                  <p className="font-display text-lg font-semibold text-foreground">Top 8%</p>
                </div>
              </div>

              {/* AI Insights */}
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-foreground-muted">
                  AI Insights
                </p>
                <div className="flex flex-col gap-2">
                  {INSIGHTS.map((insight, i) => {
                    const Icon = insight.icon;
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.08, duration: 0.4 }}
                        className="flex items-start gap-2.5 rounded-lg border border-white/[0.05] bg-white/[0.02] px-3 py-2.5"
                      >
                        <Icon
                          className="mt-0.5 h-3.5 w-3.5 flex-shrink-0"
                          style={{ color: insight.color }}
                        />
                        <span className="text-xs leading-relaxed text-foreground-sub">
                          {insight.text}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
