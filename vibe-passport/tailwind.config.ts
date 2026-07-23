import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Vibe Passport token system — deep aubergine, not pure black
        ink: {
          DEFAULT: "#150C20", // page background
          raised: "#1F1330", // cards
          surface: "#2A1C40", // inputs / raised surfaces
          border: "#3A2856",
        },
        lavender: {
          DEFAULT: "#B185F5", // stamp-ink primary accent
          soft: "#D7C2FF",
          dim: "#7C5AC2",
        },
        coral: {
          DEFAULT: "#FF9B6A", // wax-seal secondary accent
          soft: "#FFC5A3",
        },
        parchment: {
          DEFAULT: "#F4EEFB", // primary text
          muted: "#A996C2", // secondary text
        },
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "serif"],
        body: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      borderRadius: {
        stamp: "1.25rem",
      },
      boxShadow: {
        stamp: "0 8px 30px -10px rgba(177, 133, 245, 0.45)",
      },
      backgroundImage: {
        "grain": "radial-gradient(circle at 1px 1px, rgba(244,238,251,0.06) 1px, transparent 0)",
      },
      keyframes: {
        "stamp-in": {
          "0%": { transform: "scale(1.4) rotate(-8deg)", opacity: "0" },
          "60%": { transform: "scale(0.95) rotate(2deg)", opacity: "1" },
          "100%": { transform: "scale(1) rotate(-3deg)", opacity: "1" },
        },
      },
      animation: {
        "stamp-in": "stamp-in 0.4s cubic-bezier(.2,.8,.3,1.2) forwards",
      },
    },
  },
  plugins: [],
};

export default config;
