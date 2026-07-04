import type { Config } from "tailwindcss";

const config: Omit<Config, "content"> = {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: {
          primary: "#0D0D0D",
          secondary: "#141414",
          card: "#1A1A1A",
        },
        border: "rgba(255, 255, 255, 0.07)",
        gold: {
          DEFAULT: "#D4A017",
          hover: "#B38612",
        },
        text: {
          primary: "#F0EDE6",
          muted: "#999890",
        },
        red: {
          DEFAULT: "#E24B4A",
          hover: "#C93F3E",
        },
        green: {
          DEFAULT: "#5A9E3A",
          hover: "#4D8731",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "sans-serif"],
        mono: ["var(--font-mono)", "Space Mono", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
