"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Search, Sparkles, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { cn, isValidGithubUrl } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const DEMO_LINES = [
  { text: "$ devscope analyze github.com/vercel/next.js", color: "#9494b2", delay: 0 },
  { text: "", delay: 0.15 },
  { text: "  Fetching repository metadata...     ✓", color: "#34d399", delay: 0.3 },
  { text: "  Detecting language composition...   ✓", color: "#34d399", delay: 0.5 },
  { text: "  Running AI inference engine...      ✓", color: "#34d399", delay: 0.7 },
  { text: "", delay: 0.85 },
  { text: "  ──────────────────────────────────────────", color: "#2a2a45", delay: 0.9 },
  { text: "", delay: 0.95 },
  { text: "  STACK DETECTION", color: "#7c6df8", delay: 1.0, bold: true },
  { text: "  ├─ Language     TypeScript  94.2%", color: "#60a5fa", delay: 1.1 },
  { text: "  ├─ Framework    Next.js 15 (App Router)", color: "#f0f0f8", delay: 1.2 },
  { text: "  ├─ Runtime      Node.js · Edge Runtime", color: "#f0f0f8", delay: 1.3 },
  { text: "  └─ Styling      Tailwind CSS · CSS Modules", color: "#f0f0f8", delay: 1.4 },
  { text: "", delay: 1.45 },
  { text: "  ARCHITECTURE", color: "#7c6df8", delay: 1.5, bold: true },
  { text: "  ├─ Pattern      Monorepo (Turborepo)", color: "#f0f0f8", delay: 1.6 },
  { text: "  ├─ Structure    App Router + API Routes", color: "#f0f0f8", delay: 1.7 },
  { text: "  ├─ Testing      Jest · Playwright · Vitest", color: "#f0f0f8", delay: 1.8 },
  { text: "  └─ CI/CD        GitHub Actions (11 workflows)", color: "#f0f0f8", delay: 1.9 },
  { text: "", delay: 1.95 },
  { text: "  QUALITY SCORES", color: "#7c6df8", delay: 2.0, bold: true },
  { text: "  ├─ Code Health   ████████████░  92/100", color: "#34d399", delay: 2.1 },
  { text: "  ├─ Security      ████████████░  88/100", color: "#60a5fa", delay: 2.2 },
  { text: "  ├─ Performance   █████████████  95/100", color: "#a78bfa", delay: 2.3 },
  { text: "  └─ Overall Score               91/100 ★", color: "#fb923c", delay: 2.4, bold: true },
  { text: "", delay: 2.5 },
  { text: "  Analysis complete in 1.87s  ✓", color: "#34d399", delay: 2.6 },
];

const TRUSTED_REPOS = ["vercel/next.js", "supabase/supabase", "t3-oss/create-t3-app"];

export function Hero() {
  const [url, setUrl] = useState("");
  const [error, setError] = useState(false);

  const handleAnalyze = () => {
    if (!url.trim() || !isValidGithubUrl(url)) {
      setError(true);
      setTimeout(() => setError(false), 2000);
      return;
    }
    // Route to analysis page
    window.location.href = `/analyze?repo=${encodeURIComponent(url.trim())}`;
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleAnalyze();
  };

  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden pt-24 pb-16">
      {/* Background layers */}
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-100" />
      <div className="hero-gradient pointer-events-none absolute inset-0" />
      <div className="pointer-events-none absolute -top-1/4 left-1/2 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-accent/[0.06] blur-3xl" />

      <div className="relative z-10 mx-auto w-full max-w-5xl px-6 text-center">
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mb-6 flex justify-center"
        >
          <a
            href="#features"
            className="group inline-flex items-center gap-2 rounded-full border border-accent-border bg-accent-soft px-4 py-1.5 text-xs font-medium text-accent-mid transition-all hover:bg-accent/[0.15]"
          >
            <Sparkles className="h-3 w-3" />
            Introducing DevScope AI — v1.0 now in beta
            <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
          </a>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="font-display text-5xl font-bold tracking-tight text-balance md:text-6xl lg:text-7xl"
        >
          <span className="gradient-text">Understand any</span>
          <br />
          <span className="gradient-text-accent">codebase, instantly.</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-foreground-sub"
        >
          DevScope AI analyzes your GitHub repositories and delivers{" "}
          <span className="text-foreground">deep architectural insights</span>,
          stack detection, quality scores, and AI-powered recommendations—in under two seconds.
        </motion.p>

        {/* Search input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mt-10 max-w-xl"
        >
          <div
            className={cn(
              "flex items-center gap-2 rounded-xl border bg-surface p-1.5 shadow-card transition-all duration-300",
              error
                ? "border-status-red/50 shadow-[0_0_0_3px_rgba(248,113,113,0.1)]"
                : "border-white/[0.08] focus-within:border-accent-border focus-within:shadow-[0_0_0_3px_rgba(124,109,248,0.1)]"
            )}
          >
            <Search className="ml-2 h-4 w-4 flex-shrink-0 text-foreground-muted" />
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={handleKey}
              placeholder="github.com/your/repository"
              className="flex-1 bg-transparent py-1.5 text-sm text-foreground placeholder:text-foreground-muted focus:outline-none"
              aria-label="GitHub repository URL"
            />
            <button
              onClick={handleAnalyze}
              className="flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-all hover:bg-accent/90 hover:shadow-glow-sm active:scale-95"
            >
              Analyze
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Quick links */}
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs text-foreground-muted">Try:</span>
            {TRUSTED_REPOS.map((repo) => (
              <button
                key={repo}
                onClick={() => setUrl(`github.com/${repo}`)}
                className="rounded-md px-2 py-0.5 font-mono text-xs text-foreground-sub hover:text-accent-mid transition-colors hover:bg-accent-soft"
              >
                {repo}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Social proof */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="mt-8 flex items-center justify-center gap-6 text-xs text-foreground-muted"
        >
          {["No credit card required", "Free tier available", "Setup in 30 seconds"].map(
            (item) => (
              <span key={item} className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-status-green" />
                {item}
              </span>
            )
          )}
        </motion.div>
      </div>

      {/* Terminal preview */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 mx-auto mt-14 w-full max-w-3xl px-6"
      >
        <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0a0a16] shadow-[0_32px_80px_rgba(0,0,0,0.5)]">
          {/* Terminal bar */}
          <div className="flex items-center gap-2 border-b border-white/[0.06] bg-[#111120] px-4 py-3">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f56]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#27c93f]" />
            <span className="ml-3 font-mono text-xs text-foreground-muted">
              devscope — analysis — vercel/next.js
            </span>
          </div>

          {/* Terminal body */}
          <div className="p-6 font-mono text-xs leading-relaxed">
            {DEMO_LINES.map((line, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: line.delay + 0.5, duration: 0.2 }}
                style={{ color: line.color ?? "#6c6c90", fontWeight: line.bold ? 600 : 400 }}
                className="min-h-[1.5em]"
              >
                {line.text}
              </motion.div>
            ))}
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.8 }}
              className="inline-block h-3.5 w-1.5 bg-accent animate-blink"
            />
          </div>
        </div>

        {/* Glow beneath terminal */}
        <div className="pointer-events-none absolute -bottom-10 left-1/2 h-32 w-2/3 -translate-x-1/2 rounded-full bg-accent/[0.08] blur-3xl" />
      </motion.div>
    </section>
  );
}
