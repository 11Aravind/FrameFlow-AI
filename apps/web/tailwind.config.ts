import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#090d16",
        surface: "#111726",
        surfaceSubtle: "#182032",
        surfaceBorder: "#232f4a",
        accent: {
          DEFAULT: "#10b981", // Emerald accent
          hover: "#059669",
          subtle: "#064e3b",
          light: "#34d399",
        },
        capcut: {
          bg: "#0b0c0f",
          panel: "#121318",
          subpanel: "#171821",
          card: "#1d1f2b",
          cardHover: "#252737",
          border: "#252836",
          borderSubtle: "#1c1e29",
          cyan: "#00f2fe",
          cyanHover: "#00d2de",
          cyanMuted: "rgba(0, 242, 254, 0.15)",
          yellow: "#facc15",
          red: "#f43f5e",
        },
        textPrimary: "#f8fafc",
        textSecondary: "#94a3b8",
        textMuted: "#64748b",
      },
      boxShadow: {
        "glow-cyan": "0 0 20px -2px rgba(0, 242, 254, 0.35)",
        "glow-cyan-sm": "0 0 10px -1px rgba(0, 242, 254, 0.25)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
