import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        prism: {
          bg: {
            canvas: "#090A0F",
            card: "#11131A",
            elevated: "#181B24",
            hover: "#1E222D",
          },
          border: {
            subtle: "#232733",
            hover: "#363D4F",
            active: "#4F5973",
          },
          text: {
            primary: "#F8FAFC",
            secondary: "#94A3B8",
            muted: "#8A99AD",
          },
          accent: {
            blue: "#3B82F6",
            emerald: "#10B981",
            rose: "#EF4444",
            amber: "#F59E0B",
            purple: "#8B5CF6",
            cyan: "#06B6D4",
          },
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
