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
        bg: "#07070f",
        surface: {
          DEFAULT: "#0c0c18",
          muted: "#0f0f1e",
        },
        border: {
          DEFAULT: "rgba(255,255,255,0.07)",
          muted: "rgba(255,255,255,0.04)",
          strong: "rgba(255,255,255,0.12)",
        },
        accent: {
          DEFAULT: "#7c6df8",
          mid: "#a78bfa",
          soft: "rgba(124,109,248,0.1)",
          border: "rgba(124,109,248,0.25)",
          glow: "rgba(124,109,248,0.15)",
        },
        foreground: {
          DEFAULT: "#f0f0f8",
          muted: "#6c6c90",
          sub: "#9494b2",
        },
        status: {
          green: "#34d399",
          blue: "#60a5fa",
          orange: "#fb923c",
          red: "#f87171",
        },
      },
      backgroundImage: {
        "hero-radial":
          "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(124,109,248,0.14) 0%, transparent 65%)",
        "grid-pattern":
          "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
        "gradient-text":
          "linear-gradient(135deg, #fff 0%, #a5a4c4 100%)",
        "gradient-accent":
          "linear-gradient(135deg, #7c6df8 0%, #a78bfa 50%, #60a5fa 100%)",
      },
      backgroundSize: {
        grid: "60px 60px",
      },
      animation: {
        "fade-up": "fadeUp 0.6s ease forwards",
        "fade-in": "fadeIn 0.5s ease forwards",
        "float": "float 6s ease-in-out infinite",
        "pulse-glow": "pulseGlow 3s ease-in-out infinite",
        "shimmer": "shimmer 2.5s linear infinite",
        "blink": "blink 1s step-end infinite",
      },
      keyframes: {
        fadeUp: {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center" },
        },
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
      },
      boxShadow: {
        "glow-sm": "0 0 20px rgba(124,109,248,0.2)",
        "glow-md": "0 0 40px rgba(124,109,248,0.25)",
        "glow-lg": "0 0 80px rgba(124,109,248,0.2)",
        "card": "0 1px 40px rgba(0,0,0,0.4)",
      },
      transitionTimingFunction: {
        spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
    },
  },
  plugins: [],
};

export default config;