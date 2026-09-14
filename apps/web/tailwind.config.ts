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
      boxShadow: {
        'prism-card': '0 1px 3px 0 rgba(0, 0, 0, 0.4), 0 1px 2px -1px rgba(0, 0, 0, 0.4)',
        'prism-elevated': '0 4px 12px 0 rgba(0, 0, 0, 0.6), 0 2px 4px -2px rgba(0, 0, 0, 0.6)',
        'prism-glow': '0 0 20px -5px rgba(59, 130, 246, 0.15)',
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      animation: {
        'fade-in': 'fadeIn 180ms ease-out forwards',
        'pulse-subtle': 'pulseSubtle 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
