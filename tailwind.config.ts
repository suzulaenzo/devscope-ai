import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-bricolage)", "sans-serif"],
        sans: ["var(--font-dm-sans)", "sans-serif"],
        mono: ["var(--font-jetbrains)", "monospace"],
      },
      colors: {
        /* ── Canvas / Background ─────────────────── */
        bg: "#0d1117",
        canvas: "#010409",

        /* ── Surface layers ──────────────────────── */
        surface: {
          DEFAULT: "#161b22",
          muted:   "#1c2128",
          overlay: "#21262d",
        },

        /* ── Borders ─────────────────────────────── */
        border: {
          DEFAULT: "#30363d",
          muted:   "#21262d",
          strong:  "#484f58",
        },

        /* ── Primary accent — GitHub blue ────────── */
        accent: {
          DEFAULT: "#1f6feb",
          mid:     "#58a6ff",
          soft:    "rgba(31,111,235,0.1)",
          border:  "rgba(31,111,235,0.3)",
          glow:    "rgba(31,111,235,0.2)",
        },

        /* ── Brand — purple kept for hero/landing ── */
        brand: {
          DEFAULT: "#a371f7",
          mid:     "#d2a8ff",
          soft:    "rgba(163,113,247,0.1)",
          border:  "rgba(163,113,247,0.25)",
          glow:    "rgba(163,113,247,0.15)",
        },

        /* ── Text ────────────────────────────────── */
        foreground: {
          DEFAULT: "#e6edf3",
          muted:   "#8b949e",
          sub:     "#6e7681",
        },

        /* ── Semantic status ─────────────────────── */
        status: {
          green:          "#3fb950",
          "green-subtle": "rgba(63,185,80,0.12)",
          "green-border": "rgba(63,185,80,0.3)",
          blue:           "#58a6ff",
          "blue-subtle":  "rgba(88,166,255,0.12)",
          "blue-border":  "rgba(88,166,255,0.3)",
          orange:         "#d29922",
          "orange-subtle":"rgba(210,153,34,0.12)",
          "orange-border":"rgba(210,153,34,0.3)",
          red:            "#f85149",
          "red-subtle":   "rgba(248,81,73,0.12)",
          "red-border":   "rgba(248,81,73,0.3)",
          purple:         "#a371f7",
        },
      },

      backgroundImage: {
        "hero-radial":
          "radial-gradient(ellipse 80% 55% at 50% -5%, rgba(163,113,247,0.15) 0%, transparent 65%)",
        "grid-pattern":
          "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
        "gradient-text":
          "linear-gradient(135deg, #e6edf3 0%, #8b949e 100%)",
        "gradient-brand":
          "linear-gradient(135deg, #a371f7 0%, #d2a8ff 50%, #58a6ff 100%)",
        "gradient-blue":
          "linear-gradient(135deg, #1f6feb 0%, #58a6ff 100%)",
      },

      backgroundSize: {
        grid: "60px 60px",
      },

      boxShadow: {
        card:       "0 1px 3px rgba(1,4,9,0.6), 0 0 0 1px #30363d",
        "card-hover":"0 4px 16px rgba(1,4,9,0.6), 0 0 0 1px #484f58",
        "glow-blue": "0 0 20px rgba(31,111,235,0.25)",
        "glow-brand":"0 0 30px rgba(163,113,247,0.2)",
        "glow-green":"0 0 20px rgba(63,185,80,0.2)",
      },

      animation: {
        "fade-up":    "fadeUp 0.6s cubic-bezier(0.22,1,0.36,1) forwards",
        "fade-in":    "fadeIn 0.5s ease forwards",
        "float":      "float 6s ease-in-out infinite",
        "pulse-slow": "pulse 3s ease-in-out infinite",
        "shimmer":    "shimmer 2.5s linear infinite",
        "blink":      "blink 1s step-end infinite",
        "spin-slow":  "spin 3s linear infinite",
      },

      keyframes: {
        fadeUp:   { from:{ opacity:"0", transform:"translateY(18px)"}, to:{opacity:"1", transform:"translateY(0)"} },
        fadeIn:   { from:{ opacity:"0"}, to:{ opacity:"1"} },
        float:    { "0%,100%":{ transform:"translateY(0)"}, "50%":{ transform:"translateY(-8px)"} },
        shimmer:  { "0%":{ backgroundPosition:"-200% center"}, "100%":{ backgroundPosition:"200% center"} },
        blink:    { "0%,100%":{ opacity:"1"}, "50%":{ opacity:"0"} },
      },

      transitionTimingFunction: {
        spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
        out:    "cubic-bezier(0.22, 1, 0.36, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
