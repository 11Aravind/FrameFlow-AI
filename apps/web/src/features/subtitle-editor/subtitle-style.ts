export interface SubtitleStyleConfig {
  preset: "viral-yellow" | "clean-white" | "neon-cyan" | "box-pill" | "minimal-dark";
  fontFamily: "sans" | "mono" | "impact" | "display";
  fontSize: number; // in px
  textColor: string;
  strokeColor: string;
  strokeWidth: number; // 0, 1, 2, 3
  bgColor: string; // background pill color or transparent
  hasBackground: boolean;
  positionY: "bottom" | "center" | "top";
  yOffset: number; // in percentage from the edge
}

export const CAPCUT_STYLE_PRESETS: Record<string, { name: string; description: string; config: Partial<SubtitleStyleConfig> }> = {
  "viral-yellow": {
    name: "Viral Yellow",
    description: "Bold yellow text with black stroke (Trending TikTok / Reels style)",
    config: {
      preset: "viral-yellow",
      textColor: "#facc15",
      strokeColor: "#000000",
      strokeWidth: 2,
      hasBackground: false,
      bgColor: "transparent",
      fontFamily: "display",
      fontSize: 22,
    },
  },
  "clean-white": {
    name: "Clean White",
    description: "Crisp white typography with soft drop shadow",
    config: {
      preset: "clean-white",
      textColor: "#ffffff",
      strokeColor: "#000000",
      strokeWidth: 1,
      hasBackground: false,
      bgColor: "transparent",
      fontFamily: "sans",
      fontSize: 20,
    },
  },
  "neon-cyan": {
    name: "Neon Cyber",
    description: "Electric cyan glow with high contrast",
    config: {
      preset: "neon-cyan",
      textColor: "#00f2fe",
      strokeColor: "#000000",
      strokeWidth: 2,
      hasBackground: false,
      bgColor: "transparent",
      fontFamily: "display",
      fontSize: 22,
    },
  },
  "box-pill": {
    name: "Black Pill",
    description: "Dark rounded badge with white bold text",
    config: {
      preset: "box-pill",
      textColor: "#ffffff",
      strokeColor: "transparent",
      strokeWidth: 0,
      hasBackground: true,
      bgColor: "rgba(11, 12, 15, 0.85)",
      fontFamily: "sans",
      fontSize: 18,
    },
  },
  "minimal-dark": {
    name: "Minimalist",
    description: "Clean muted subtitle banner",
    config: {
      preset: "minimal-dark",
      textColor: "#e2e8f0",
      strokeColor: "transparent",
      strokeWidth: 0,
      hasBackground: true,
      bgColor: "rgba(0, 0, 0, 0.6)",
      fontFamily: "sans",
      fontSize: 18,
    },
  },
};

export const DEFAULT_SUBTITLE_STYLE: SubtitleStyleConfig = {
  preset: "viral-yellow",
  fontFamily: "display",
  fontSize: 22,
  textColor: "#facc15",
  strokeColor: "#000000",
  strokeWidth: 2,
  bgColor: "transparent",
  hasBackground: false,
  positionY: "bottom",
  yOffset: 12,
};
