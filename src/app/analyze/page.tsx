"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Star, GitFork, AlertCircle, ExternalLink, CheckCircle2,
  AlertTriangle, Info, Zap, Clock, Code2, Shield, Activity,
  FileText, ArrowLeft, Layers, Package, Server, Cpu, RefreshCw,
  GitBranch, Globe, Lock, Check, XCircle, CircleDot,
  TriangleAlert, Boxes, ChevronRight, Sparkles,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { AnalysisResult, RepoType, AnalysisInsight, AntiPattern } from "@/types/analysis";
import { cn } from "@/lib/utils";

/* ═══════════════════════════════════════════════
   COLOR SYSTEM — GitHub-inspired
═══════════════════════════════════════════════ */
const GH = {
  canvas:       "#0d1117",
  surface:      "#161b22",
  surfaceAlt:   "#1c2128",
  surfaceDeep:  "#21262d",
  border:       "#30363d",
  borderMuted:  "#21262d",
  borderStrong: "#484f58",
  text:         "#e6edf3",
  textMuted:    "#8b949e",
  textSubtle:   "#6e7681",
  blue:         "#58a6ff",
  blueI:        "#1f6feb",
  purple:       "#a371f7",
  purpleHi:     "#d2a8ff",
  green:        "#3fb950",
  orange:       "#d29922",
  red:          "#f85149",
} as const;

/* GitHub official language colors */
const LANG_COLORS: Record<string, string> = {
  TypeScript:"#3178c6", JavaScript:"#f7df1e", Python:"#3572A5", Rust:"#dea584",
  Go:"#00ADD8", Java:"#b07219", Kotlin:"#A97BFF", "C++":"#f34b7d", C:"#555555",
  Ruby:"#701516", PHP:"#4F5D95", Swift:"#F05138", Dart:"#00B4AB", Elixir:"#6e4a7e",
  Shell:"#89e051", HTML:"#e34c26", CSS:"#563d7c", Vue:"#41b883", Svelte:"#ff3e00",
  "C#":"#178600", Scala:"#c22d40", Haskell:"#5e5086", Clojure:"#db5855",
  "Jupyter Notebook":"#DA5B0B", R:"#198CE7", Julia:"#a270ba", SCSS:"#c6538c",
  Zig:"#ec915c", Nim:"#ffc200", Lua:"#000080", Perl:"#0298c3", Groovy:"#e69f56",
};
const langColor = (l: string) => LANG_COLORS[l] ?? GH.purple;

/* Repository type visual config */
type TypeCfg = { label: string; color: string; bg: string; border: string };
const TYPE_CFG: Record<RepoType, TypeCfg> = {
  frontend:  { label:"Frontend",    color:GH.blue,   bg:"rgba(88,166,255,0.1)",   border:"rgba(88,166,255,0.28)"   },
  backend:   { label:"Backend",     color:GH.green,  bg:"rgba(63,185,80,0.1)",    border:"rgba(63,185,80,0.28)"    },
  fullstack: { label:"Full-stack",  color:GH.purple, bg:"rgba(163,113,247,0.1)",  border:"rgba(163,113,247,0.28)"  },
  library:   { label:"Library",     color:GH.orange, bg:"rgba(210,153,34,0.1)",   border:"rgba(210,153,34,0.28)"   },
  mobile:    { label:"Mobile App",  color:"#fb8f44", bg:"rgba(251,143,68,0.1)",   border:"rgba(251,143,68,0.28)"   },
  desktop:   { label:"Desktop App", color:GH.blue,   bg:"rgba(88,166,255,0.1)",   border:"rgba(88,166,255,0.28)"   },
  cli:       { label:"CLI Tool",    color:GH.textMuted, bg:"rgba(139,148,158,0.1)", border:"rgba(139,148,158,0.25)" },
  api:       { label:"API Service", color:GH.green,  bg:"rgba(63,185,80,0.1)",    border:"rgba(63,185,80,0.28)"    },
  monorepo:  { label:"Monorepo",    color:GH.purple, bg:"rgba(163,113,247,0.1)",  border:"rgba(163,113,247,0.28)"  },
  ml:        { label:"ML / AI",     color:GH.blue,   bg:"rgba(88,166,255,0.1)",   border:"rgba(88,166,255,0.28)"   },
  devtools:  { label:"Dev Tools",   color:GH.orange, bg:"rgba(210,153,34,0.1)",   border:"rgba(210,153,34,0.28)"   },
  unknown:   { label:"Repository",  color:GH.textMuted, bg:"rgba(139,148,158,0.1)", border:"rgba(139,148,158,0.25)" },
};

const scoreColor = (v: number) => v >= 80 ? GH.green : v >= 60 ? GH.blue : v >= 40 ? GH.orange : GH.red;
const scoreGrade = (v: number) => v >= 90 ? "A+" : v >= 80 ? "A" : v >= 70 ? "B" : v >= 60 ? "C" : v >= 50 ? "D" : "F";

/* ═══════════════════════════════════════════════
   SHARED PRIMITIVES
═══════════════════════════════════════════════ */
const card: React.CSSProperties = { background: GH.surface, border: `1px solid ${GH.border}`, borderRadius: 12 };
const cardInner: React.CSSProperties = { background: GH.surfaceAlt, border: `1px solid ${GH.borderMuted}`, borderRadius: 8 };

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: GH.textSubtle, marginBottom: 14 }}>
      {children}
    </p>
  );
}

/* ═══════════════════════════════════════════════
   NAVBAR
═══════════════════════════════════════════════ */
function Navbar({ owner, repo }: { owner?: string; repo?: string }) {
  return (
    <header style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      height: 56, display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 24px",
      background: "rgba(13,17,23,0.92)",
      backdropFilter: "blur(20px)",
      borderBottom: `1px solid ${GH.border}`,
    }}>
      <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
        <div style={{ width: 24, height: 24, borderRadius: 6, background: "linear-gradient(135deg,#a371f7,#58a6ff)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Zap size={13} color="white" strokeWidth={2.5} />
        </div>
        <span style={{ fontFamily: "var(--font-bricolage),sans-serif", fontSize: 14, fontWeight: 700, color: GH.text }}>
          DevScope <span style={{ color: GH.purple }}>AI</span>
        </span>
      </Link>
      {owner && repo && (
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: GH.textMuted }}>
          <span>{owner}</span>
          <span style={{ color: GH.borderStrong }}>/</span>
          <span style={{ color: GH.text, fontWeight: 500 }}>{repo}</span>
        </div>
      )}
      <Link href="/" style={{
        display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 500,
        color: GH.textMuted, textDecoration: "none", padding: "5px 12px", borderRadius: 8,
        border: `1px solid ${GH.border}`, background: "rgba(240,246,252,0.04)",
        transition: "all 0.15s",
      }}
        onMouseEnter={e => { e.currentTarget.style.color = GH.text; e.currentTarget.style.borderColor = GH.borderStrong; }}
        onMouseLeave={e => { e.currentTarget.style.color = GH.textMuted; e.currentTarget.style.borderColor = GH.border; }}
      >
        <ArrowLeft size={14} />
        New analysis
      </Link>
    </header>
  );
}

/* ═══════════════════════════════════════════════
   LOADING STATE
═══════════════════════════════════════════════ */
const STEPS = [
  "Connecting to GitHub",
  "Fetching repository metadata",
  "Parsing package.json & dependencies",
  "Analyzing language composition",
  "Detecting stack & architecture",
  "Computing quality scores",
  "Generating insights",
];

function LoadingView({ step }: { step: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: "0 24px", paddingTop: 56 }}>
      <div style={{ width: "100%", maxWidth: 440 }}>
        <div style={{ borderRadius: 14, border: `1px solid ${GH.border}`, overflow: "hidden", boxShadow: "0 16px 48px rgba(1,4,9,0.7)" }}>
          {/* Chrome */}
          <div style={{ background: GH.surfaceAlt, borderBottom: `1px solid ${GH.border}`, padding: "10px 16px", display: "flex", alignItems: "center", gap: 7 }}>
            {["#ff5f56","#ffbd2e","#27c93f"].map(c => <div key={c} style={{ width: 11, height: 11, borderRadius: "50%", background: c }} />)}
            <span style={{ marginLeft: 10, fontFamily: "var(--font-jetbrains),monospace", fontSize: 11, color: GH.textSubtle }}>devscope — analyzing</span>
          </div>
          {/* Body */}
          <div style={{ background: GH.surface, padding: "24px 24px 28px", fontFamily: "var(--font-jetbrains),monospace" }}>
            {STEPS.map((s, i) => (
              <div key={s} className="terminal-line" style={{ animationDelay: `${i * 120}ms`, display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                {i < step
                  ? <CheckCircle2 size={14} style={{ color: GH.green, flexShrink: 0 }} />
                  : i === step
                  ? <RefreshCw size={14} style={{ color: GH.blue, flexShrink: 0, animation: "spin 1s linear infinite" }} />
                  : <CircleDot size={14} style={{ color: GH.borderStrong, flexShrink: 0 }} />}
                <span style={{ fontSize: 12, color: i < step ? GH.green : i === step ? GH.text : GH.textSubtle }}>
                  {s}{i <= step ? "..." : ""}
                </span>
              </div>
            ))}
            <span style={{ display: "inline-block", width: 7, height: 14, background: GH.blue, marginTop: 8, animation: "blink 1s step-end infinite", borderRadius: 1 }} />
          </div>
        </div>
        <p style={{ textAlign: "center", fontSize: 12, color: GH.textSubtle, marginTop: 16 }}>
          Usually takes 2–5 seconds
        </p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   ERROR STATE
═══════════════════════════════════════════════ */
function ErrorView({ message, repo }: { message: string; repo: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: "0 24px" }}>
      <div style={{ maxWidth: 420, textAlign: "center" }}>
        <div style={{ width: 56, height: 56, borderRadius: 14, background: "rgba(248,81,73,0.1)", border: "1px solid rgba(248,81,73,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
          <AlertCircle size={24} style={{ color: GH.red }} />
        </div>
        <h1 style={{ fontFamily: "var(--font-bricolage),sans-serif", fontSize: 20, fontWeight: 700, color: GH.text, marginBottom: 10 }}>Analysis failed</h1>
        <p style={{ fontSize: 14, color: GH.textMuted, lineHeight: 1.7, marginBottom: 24 }}>{message}</p>
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 20px", borderRadius: 8, background: "rgba(240,246,252,0.05)", border: `1px solid ${GH.border}`, color: GH.textMuted, fontSize: 13, fontWeight: 500, textDecoration: "none" }}>
          <ArrowLeft size={14} /> Try another repository
        </Link>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   SCORE RING — SVG Arc Visualization
═══════════════════════════════════════════════ */
function ScoreRing({ score }: { score: number }) {
  const r = 48, circ = 2 * Math.PI * r;
  const color = scoreColor(score);
  const grade = scoreGrade(score);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <svg width="128" height="128" viewBox="0 0 128 128">
        {/* Track */}
        <circle cx="64" cy="64" r={r} fill="none" stroke={GH.surfaceDeep} strokeWidth="7" />
        {/* Arc */}
        <motion.circle
          cx="64" cy="64" r={r}
          fill="none" stroke={color} strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ * (1 - score / 100) }}
          transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          transform="rotate(-90 64 64)"
        />
        {/* Score */}
        <text x="64" y="60" textAnchor="middle" fill={GH.text} fontSize="26" fontWeight="700" fontFamily="var(--font-bricolage),sans-serif">{score}</text>
        <text x="64" y="76" textAnchor="middle" fill={GH.textSubtle} fontSize="11" fontFamily="var(--font-dm-sans),sans-serif">/100</text>
      </svg>
      <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 12px", borderRadius: 100, background: `${color}18`, border: `1px solid ${color}40`, marginTop: 4 }}>
        <span style={{ fontFamily: "var(--font-bricolage),sans-serif", fontSize: 13, fontWeight: 700, color }}>{grade}</span>
        <span style={{ fontSize: 12, color: GH.textMuted }}>{score >= 80 ? "Excellent" : score >= 65 ? "Good" : score >= 50 ? "Fair" : "Needs work"}</span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   SCORE BAR
═══════════════════════════════════════════════ */
function ScoreBar({ label, value, icon: Icon }: { label: string; value: number; icon: React.ElementType }) {
  const color = scoreColor(value);
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
        <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: GH.textMuted }}>
          <Icon size={13} style={{ color: GH.textSubtle }} />{label}
        </span>
        <span style={{ fontFamily: "var(--font-jetbrains),monospace", fontSize: 12, fontWeight: 600, color }}>{value}/100</span>
      </div>
      <div style={{ height: 5, borderRadius: 3, background: GH.surfaceDeep, overflow: "hidden" }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1.2, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          style={{ height: "100%", borderRadius: 3, background: color }}
        />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   LANGUAGE BAR
═══════════════════════════════════════════════ */
function LanguageChart({ languages }: { languages: Record<string, number> }) {
  const total = Object.values(languages).reduce((a, b) => a + b, 0);
  const sorted = Object.entries(languages).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const pcts = sorted.map(([l, b]) => ({ lang: l, pct: Math.round(b / total * 1000) / 10 }));
  return (
    <div>
      {/* Stacked bar */}
      <div style={{ display: "flex", height: 8, borderRadius: 4, overflow: "hidden", marginBottom: 16, gap: 1 }}>
        {pcts.map(({ lang, pct }) => (
          <motion.div key={lang}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            style={{ background: langColor(lang), minWidth: pct > 0.5 ? 2 : 0 }}
          />
        ))}
      </div>
      {/* Legend */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {pcts.map(({ lang, pct }) => (
          <div key={lang} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: langColor(lang), flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: GH.textMuted }}>{lang}</span>
            </div>
            <span style={{ fontFamily: "var(--font-jetbrains),monospace", fontSize: 12, color: GH.textSubtle }}>{pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   STACK ROW
═══════════════════════════════════════════════ */
function StackRow({ label, value, icon: Icon }: { label: string; value: string; icon: React.ElementType }) {
  const isKnown = value !== "Not detected" && value !== "";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: `1px solid ${GH.borderMuted}` }}>
      <div style={{ width: 28, height: 28, borderRadius: 7, background: GH.surfaceDeep, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon size={13} style={{ color: isKnown ? GH.blue : GH.textSubtle }} />
      </div>
      <div style={{ flex: 1, display: "flex", justifyContent: "space-between", alignItems: "center", minWidth: 0 }}>
        <span style={{ fontSize: 12, color: GH.textSubtle, flexShrink: 0, marginRight: 8 }}>{label}</span>
        <span style={{ fontFamily: "var(--font-jetbrains),monospace", fontSize: 12, color: isKnown ? GH.text : GH.textSubtle, textAlign: "right", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "200px" }}>
          {value || "—"}
        </span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   HEALTH CHECK GRID
═══════════════════════════════════════════════ */
function HealthCheck({ label, value }: { label: string; value: boolean }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8, padding: "9px 12px",
      borderRadius: 8, background: value ? "rgba(63,185,80,0.06)" : GH.surfaceAlt,
      border: `1px solid ${value ? "rgba(63,185,80,0.2)" : GH.borderMuted}`,
      fontSize: 12,
    }}>
      {value
        ? <CheckCircle2 size={13} style={{ color: GH.green, flexShrink: 0 }} />
        : <XCircle size={13} style={{ color: GH.borderStrong, flexShrink: 0 }} />}
      <span style={{ color: value ? GH.text : GH.textSubtle, lineHeight: 1.3 }}>{label}</span>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   INSIGHT ITEM
═══════════════════════════════════════════════ */
function InsightCard({ insight }: { insight: AnalysisInsight }) {
  const cfg = {
    success: { icon: CheckCircle2, color: GH.green,  bg: "rgba(63,185,80,0.07)",    border: "rgba(63,185,80,0.2)"    },
    warning: { icon: AlertTriangle, color: GH.orange, bg: "rgba(210,153,34,0.07)",   border: "rgba(210,153,34,0.2)"   },
    info:    { icon: Info,          color: GH.blue,   bg: "rgba(88,166,255,0.07)",   border: "rgba(88,166,255,0.2)"   },
    critical:{ icon: XCircle,       color: GH.red,    bg: "rgba(248,81,73,0.07)",    border: "rgba(248,81,73,0.2)"    },
  }[insight.type] ?? { icon: Info, color: GH.textMuted, bg: GH.surfaceAlt, border: GH.borderMuted };
  const Icon = cfg.icon;
  return (
    <div style={{ display: "flex", gap: 12, padding: "14px 16px", borderRadius: 10, background: cfg.bg, border: `1px solid ${cfg.border}` }}>
      <Icon size={15} style={{ color: cfg.color, flexShrink: 0, marginTop: 1 }} />
      <div>
        {insight.category && (
          <span style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: cfg.color, marginBottom: 4, display: "block" }}>
            {insight.category}
          </span>
        )}
        <p style={{ fontSize: 13, color: GH.textMuted, lineHeight: 1.65 }}>{insight.text}</p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   ANTI-PATTERN ITEM
═══════════════════════════════════════════════ */
function AntiPatternCard({ pattern }: { pattern: AntiPattern }) {
  const sev = pattern.severity;
  const cfg = {
    critical: { color: GH.red,    bg: "rgba(248,81,73,0.08)",  border: "rgba(248,81,73,0.3)",  label:"Critical" },
    high:     { color: GH.orange, bg: "rgba(210,153,34,0.08)", border: "rgba(210,153,34,0.3)", label:"High" },
    medium:   { color: GH.blue,   bg: "rgba(88,166,255,0.08)", border: "rgba(88,166,255,0.3)", label:"Medium" },
  }[sev];
  return (
    <div style={{ padding: "14px 16px", borderRadius: 10, background: cfg.bg, border: `1px solid ${cfg.border}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <TriangleAlert size={14} style={{ color: cfg.color }} />
        <span style={{ fontFamily: "var(--font-jetbrains),monospace", fontSize: 12, fontWeight: 600, color: cfg.color }}>{pattern.label}</span>
        <span style={{ marginLeft: "auto", fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", padding: "2px 7px", borderRadius: 4, background: `${cfg.color}22`, color: cfg.color }}>{cfg.label}</span>
      </div>
      <p style={{ fontSize: 12, color: GH.textMuted, lineHeight: 1.65 }}>{pattern.description}</p>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   ARCHITECTURE INDICATOR PILL
═══════════════════════════════════════════════ */
function ArchPill({ text }: { text: string }) {
  return (
    <span style={{ fontSize: 11, padding: "3px 9px", borderRadius: 6, background: GH.surfaceDeep, border: `1px solid ${GH.borderMuted}`, color: GH.textMuted, fontFamily: "var(--font-jetbrains),monospace" }}>
      {text}
    </span>
  );
}

/* ═══════════════════════════════════════════════
   MAIN RESULT VIEW
═══════════════════════════════════════════════ */
function ResultView({ data }: { data: AnalysisResult & { aiPowered: boolean } }) {
  const { repo, languages, stack, architecture, scores, metrics, antiPatterns, insights, repoType } = data;
  const typeCfg = TYPE_CFG[repoType];
  const sColor = scoreColor(scores.overall);

  const daysSince = metrics.daysSinceLastPush;
  const lastPush = daysSince === 0 ? "today" : daysSince === 1 ? "yesterday" : `${daysSince}d ago`;
  const repoAgeYrs = Math.floor(metrics.repoAgeYears * 10) / 10;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{ maxWidth: 1280, margin: "0 auto", padding: "72px 24px 80px", fontFamily: "var(--font-dm-sans),sans-serif" }}
    >
      {/* ── Repo Header ─────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{ marginBottom: 28 }}
      >
        {/* Avatar + name row */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 16, flexWrap: "wrap", marginBottom: 14 }}>
          {repo.avatarUrl && (
            <Image
              src={repo.avatarUrl}
              alt={data.owner}
              width={44} height={44}
              style={{ borderRadius: 10, border: `1px solid ${GH.border}`, flexShrink: 0 }}
            />
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
              <h1 style={{ fontFamily: "var(--font-bricolage),sans-serif", fontSize: "clamp(20px,3vw,28px)", fontWeight: 800, color: GH.text, letterSpacing: "-0.02em" }}>
                <span style={{ color: GH.textMuted }}>{data.owner}/</span>{data.name}
              </h1>
              {/* Repo type badge */}
              <span style={{ fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 100, background: typeCfg.bg, border: `1px solid ${typeCfg.border}`, color: typeCfg.color, flexShrink: 0 }}>
                {typeCfg.label}
              </span>
              {repo.isArchived && (
                <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 100, background: "rgba(210,153,34,0.1)", border: "1px solid rgba(210,153,34,0.3)", color: GH.orange }}>Archived</span>
              )}
              {repo.isFork && (
                <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 100, background: GH.surfaceAlt, border: `1px solid ${GH.border}`, color: GH.textMuted }}>Fork</span>
              )}
              {data.aiPowered && (
                <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 100, background: "rgba(163,113,247,0.1)", border: "1px solid rgba(163,113,247,0.3)", color: GH.purple, display: "flex", alignItems: "center", gap: 4 }}>
                  <Sparkles size={10} />AI-powered
                </span>
              )}
            </div>
            {repo.description && (
              <p style={{ fontSize: 14, color: GH.textMuted, lineHeight: 1.6, maxWidth: 700, marginBottom: 12 }}>{repo.description}</p>
            )}
            {/* Stats row */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 20px", fontSize: 13, color: GH.textSubtle }}>
              {[
                { icon: Star, val: repo.stars.toLocaleString(), label: "stars" },
                { icon: GitFork, val: repo.forks.toLocaleString(), label: "forks" },
                { icon: AlertCircle, val: repo.openIssues.toLocaleString(), label: "open issues" },
                { icon: GitBranch, val: repo.defaultBranch, label: "" },
                { icon: Clock, val: `Pushed ${lastPush}`, label: "" },
              ].map(({ icon: Icon, val, label }) => (
                <span key={label + val} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <Icon size={13} />{val}{label ? ` ${label}` : ""}
                </span>
              ))}
              {repo.license && <span style={{ display: "flex", alignItems: "center", gap: 5 }}><FileText size={13} />{repo.license}</span>}
              {repo.homepage && (
                <a href={repo.homepage} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 5, color: GH.blue, textDecoration: "none" }}>
                  <Globe size={13} />{new URL(repo.homepage.startsWith("http") ? repo.homepage : `https://${repo.homepage}`).hostname}
                </a>
              )}
              <a href={`https://github.com/${repo.fullName}`} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 5, color: GH.blue, textDecoration: "none" }}>
                <ExternalLink size={13} />View on GitHub
              </a>
            </div>
          </div>
        </div>

        {/* Topics */}
        {repo.topics.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
            {repo.topics.map(t => (
              <span key={t} style={{ fontSize: 12, padding: "3px 10px", borderRadius: 100, background: "rgba(31,111,235,0.1)", border: "1px solid rgba(31,111,235,0.2)", color: GH.blue }}>
                {t}
              </span>
            ))}
          </div>
        )}

        {/* Analysis meta */}
        <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, padding: "4px 12px", borderRadius: 100, background: "rgba(63,185,80,0.08)", border: "1px solid rgba(63,185,80,0.25)", color: GH.green }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: GH.green, display: "inline-block" }} />
            Analysis complete in {data.analysisTime}ms
          </span>
          <span style={{ fontSize: 12, color: GH.textSubtle }}>
            {repoAgeYrs > 0 ? `${repoAgeYrs}y old · ` : ""}{(repo.sizeKb / 1024).toFixed(1)} MB
          </span>
        </div>
      </motion.div>

      <div style={{ height: 1, background: GH.border, marginBottom: 24 }} />

      {/* ── Anti-patterns (above fold if critical) ── */}
      {antiPatterns.filter(p => p.severity === "critical").length > 0 && (
        <div style={{ marginBottom: 20 }}>
          {antiPatterns.filter(p => p.severity === "critical").map((p, i) => (
            <AntiPatternCard key={i} pattern={p} />
          ))}
        </div>
      )}

      {/* ── Main Grid ───────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 18, alignItems: "start" }}>

        {/* ── LEFT COLUMN ─────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

          {/* Languages */}
          {Object.keys(languages).length > 0 && (
            <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1, duration:0.5, ease:[0.22,1,0.36,1] }}
              style={{ ...card, padding: "20px 22px" }}>
              <SectionLabel>Language Composition</SectionLabel>
              <LanguageChart languages={languages} />
            </motion.div>
          )}

          {/* Stack */}
          <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.15, duration:0.5, ease:[0.22,1,0.36,1] }}
            style={{ ...card, padding: "20px 22px" }}>
            <SectionLabel>Technology Stack</SectionLabel>
            <div>
              {[
                { label:"Framework",      value:stack.framework,      icon:Layers   },
                { label:"Runtime",        value:stack.runtime,        icon:Cpu      },
                { label:"Package Manager",value:stack.packageManager, icon:Package  },
                { label:"Testing",        value:stack.testing,        icon:CheckCircle2 },
                { label:"CI / CD",        value:stack.cicd,           icon:Activity },
                { label:"Styling",        value:stack.styling,        icon:Code2    },
              ].map(row => <StackRow key={row.label} {...row} />)}
            </div>
            {/* Infrastructure pills */}
            {stack.infra.length > 0 && (
              <div style={{ marginTop: 14 }}>
                <p style={{ fontSize: 11, color: GH.textSubtle, marginBottom: 8 }}>Infrastructure & Deployment</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {stack.infra.map(tool => (
                    <span key={tool} style={{ fontSize: 11, padding: "3px 9px", borderRadius: 6, background: GH.surfaceDeep, border: `1px solid ${GH.borderMuted}`, color: GH.textMuted, fontFamily: "var(--font-jetbrains),monospace" }}>
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          {/* Architecture */}
          <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2, duration:0.5, ease:[0.22,1,0.36,1] }}
            style={{ ...card, padding: "20px 22px" }}>
            <SectionLabel>Architecture</SectionLabel>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 14 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(163,113,247,0.1)", border: "1px solid rgba(163,113,247,0.25)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Boxes size={18} style={{ color: GH.purple }} />
              </div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: GH.text, marginBottom: 3 }}>{architecture.pattern}</p>
                <p style={{ fontSize: 12, color: GH.textSubtle }}>{architecture.type}</p>
              </div>
            </div>
            {/* Signals */}
            {architecture.indicators.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {architecture.indicators.map(s => <ArchPill key={s} text={s} />)}
              </div>
            )}
            {/* Architecture flags */}
            <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
              {[
                { label:"Monorepo",    active:architecture.isMonorepo    },
                { label:"Containers",  active:architecture.hasContainers  },
                { label:"Serverless",  active:architecture.hasServerless  },
                { label:"IaC",         active:architecture.hasIaC         },
              ].map(({ label, active }) => (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 6, background: active ? "rgba(63,185,80,0.08)" : GH.surfaceDeep, border: `1px solid ${active ? "rgba(63,185,80,0.25)" : GH.borderMuted}` }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: active ? GH.green : GH.borderStrong }} />
                  <span style={{ fontSize: 11, color: active ? GH.green : GH.textSubtle }}>{label}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Health Checks */}
          <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.25, duration:0.5, ease:[0.22,1,0.36,1] }}
            style={{ ...card, padding: "20px 22px" }}>
            <SectionLabel>Repository Health</SectionLabel>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}>
              {[
                { label:"README",           value:metrics.hasReadme       },
                { label:"License",          value:metrics.hasLicense      },
                { label:"CI / CD",          value:metrics.hasCicd         },
                { label:"Tests",            value:metrics.hasTests        },
                { label:"Security Policy",  value:metrics.hasSecurity     },
                { label:"Changelog",        value:metrics.hasChangelog    },
                { label:"Contributing",     value:metrics.hasContributing },
                { label:"Dockerfile",       value:metrics.hasDockerfile   },
                { label:"Linting Config",   value:metrics.hasLinting      },
                { label:".env.example",     value:metrics.hasEnvExample   },
                { label:".editorconfig",    value:metrics.hasEditorconfig },
                { label:".gitignore",       value:metrics.hasGitignore    },
              ].map(c => <HealthCheck key={c.label} {...c} />)}
            </div>
          </motion.div>
        </div>

        {/* ── RIGHT COLUMN ─────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

          {/* Overall Score */}
          <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1, duration:0.5, ease:[0.22,1,0.36,1] }}
            style={{ ...card, padding: "24px 22px", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <SectionLabel>Overall Quality</SectionLabel>
            <ScoreRing score={scores.overall} />
            <div style={{ width: "100%", marginTop: 18, padding: "12px 14px", borderRadius: 9, background: GH.surfaceAlt, border: `1px solid ${GH.borderMuted}` }}>
              <p style={{ fontSize: 11, color: GH.textSubtle, marginBottom: 4 }}>Weighted by repo type</p>
              <p style={{ fontSize: 12, color: GH.textMuted }}>
                Scored as a <span style={{ color: typeCfg.color }}>{typeCfg.label}</span> project.
                Weights adapted to expected standards for this category.
              </p>
            </div>
          </motion.div>

          {/* Quality Breakdown */}
          <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.15, duration:0.5, ease:[0.22,1,0.36,1] }}
            style={{ ...card, padding: "20px 22px" }}>
            <SectionLabel>Quality Breakdown</SectionLabel>
            <ScoreBar label="Code Health"    value={scores.codeHealth}    icon={Code2}    />
            <ScoreBar label="Security"       value={scores.security}       icon={Shield}   />
            <ScoreBar label="Maintainability"value={scores.maintainability}icon={Activity} />
            <ScoreBar label="Documentation"  value={scores.documentation}  icon={FileText} />
          </motion.div>

          {/* Quick Stats */}
          <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2, duration:0.5, ease:[0.22,1,0.36,1] }}
            style={{ ...card, overflow: "hidden" }}>
            {[
              { label:"Stars",         val:repo.stars.toLocaleString()       },
              { label:"Forks",         val:repo.forks.toLocaleString()       },
              { label:"Open Issues",   val:repo.openIssues.toLocaleString()  },
              { label:"Watchers",      val:repo.watchers.toLocaleString()    },
              { label:"Size",          val:`${(repo.sizeKb/1024).toFixed(1)} MB` },
              { label:"Age",           val:`${repoAgeYrs > 0 ? repoAgeYrs + "y" : "< 1y"}` },
              { label:"Default Branch",val:repo.defaultBranch               },
              { label:"Visibility",    val:repo.visibility.charAt(0).toUpperCase() + repo.visibility.slice(1) },
            ].map(({ label, val }, i) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 18px", borderBottom: i < 7 ? `1px solid ${GH.borderMuted}` : "none" }}>
                <span style={{ fontSize: 12, color: GH.textSubtle }}>{label}</span>
                <span style={{ fontFamily: "var(--font-jetbrains),monospace", fontSize: 12, color: GH.text }}>{val}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ── Insights ────────────────────────── */}
      {insights.length > 0 && (
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3, duration:0.5, ease:[0.22,1,0.36,1] }}
          style={{ ...card, padding: "22px 24px", marginTop: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
            <SectionLabel style={{ marginBottom: 0 }}>
              {data.aiPowered ? "AI-Powered Insights" : "Analysis Insights"}
            </SectionLabel>
            {data.aiPowered && (
              <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 4, background: "rgba(163,113,247,0.1)", border: "1px solid rgba(163,113,247,0.3)", color: GH.purple }}>
                Claude AI
              </span>
            )}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 10 }}>
            {insights.map((ins, i) => <InsightCard key={i} insight={ins} />)}
          </div>
        </motion.div>
      )}

      {/* ── Non-critical Anti-patterns ─────── */}
      {antiPatterns.filter(p => p.severity !== "critical").length > 0 && (
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.35, duration:0.5, ease:[0.22,1,0.36,1] }}
          style={{ ...card, padding: "22px 24px", marginTop: 18 }}>
          <SectionLabel>Potential Issues</SectionLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {antiPatterns.filter(p => p.severity !== "critical").map((p, i) => <AntiPatternCard key={i} pattern={p} />)}
          </div>
        </motion.div>
      )}

      {/* ── Analyze another ─────────────────── */}
      <div style={{ display: "flex", justifyContent: "center", marginTop: 36 }}>
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 22px", borderRadius: 10, background: GH.surfaceAlt, border: `1px solid ${GH.border}`, color: GH.textMuted, fontSize: 13, fontWeight: 500, textDecoration: "none" }}>
          <ArrowLeft size={14} />Analyze another repository
        </Link>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════
   PAGE ROOT
═══════════════════════════════════════════════ */
function AnalyzeContent() {
  const searchParams = useSearchParams();
  const rawRepo = searchParams.get("repo") ?? "";

  const [step, setStep]   = useState(0);
  const [state, setState] = useState<"loading"|"success"|"error">("loading");
  const [data, setData]   = useState<(AnalysisResult & { aiPowered: boolean }) | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!rawRepo) {
      setErrorMsg("No repository specified. Go back and enter a GitHub URL.");
      setState("error");
      return;
    }

    const timers: ReturnType<typeof setTimeout>[] = [];
    STEPS.forEach((_, i) => timers.push(setTimeout(() => setStep(i), i * 550)));

    fetch(`/api/analyze?repo=${encodeURIComponent(rawRepo)}`)
      .then(async res => {
        const json = await res.json();
        if (!res.ok || json.error) throw new Error(json.error ?? "Unknown error");
        return json as AnalysisResult & { aiPowered: boolean };
      })
      .then(result => {
        timers.forEach(clearTimeout);
        setStep(STEPS.length);
        setTimeout(() => { setData(result); setState("success"); }, 350);
      })
      .catch((err: Error) => {
        timers.forEach(clearTimeout);
        setErrorMsg(err.message);
        setState("error");
      });

    return () => timers.forEach(clearTimeout);
  }, [rawRepo]);

  // Extract owner/repo for navbar breadcrumb
  const parts = rawRepo.replace(/https?:\/\/github\.com\//,"").split("/");
  const owner = parts[0], repoName = parts[1];

  return (
    <div style={{ background: GH.canvas, minHeight: "100vh", color: GH.text }}>
      <Navbar owner={owner} repo={repoName} />
      {state === "loading" && <LoadingView step={step} />}
      {state === "error"   && <ErrorView message={errorMsg} repo={rawRepo} />}
      {state === "success" && data && <ResultView data={data} />}
    </div>
  );
}

export default function AnalyzePage() {
  return (
    <Suspense fallback={
      <div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:"100vh", background:GH.canvas }}>
        <RefreshCw size={18} style={{ color:GH.blue, animation:"spin 1s linear infinite" }} />
      </div>
    }>
      <AnalyzeContent />
    </Suspense>
  );
}
