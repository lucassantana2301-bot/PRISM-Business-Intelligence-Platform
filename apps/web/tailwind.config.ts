import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        prism: {
          bg: {
            canvas: "#F4F6FA",
            card: "#FFFFFF",
            elevated: "#F8FAFC",
            hover: "#F1F5F9",
            dark: "#0D1322",
            darkCard: "#131B2E",
            darkElevated: "#1A243D",
          },
          border: {
            subtle: "#EEF2F6",
            hover: "#E2E8F0",
            active: "#CBD5E1",
            darkSubtle: "#1E293B",
          },
          text: {
            primary: "#0F172A",
            secondary: "#475569",
            muted: "#94A3B8",
            darkPrimary: "#F8FAFC",
            darkSecondary: "#94A3B8",
          },
          accent: {
            blue: "#2563EB",
            blueDark: "#1D4ED8",
            emerald: "#10B981",
            rose: "#EF4444",
            amber: "#F59E0B",
            purple: "#8B5CF6",
            cyan: "#06B6D4",
            indigo: "#6366F1",
          },
        },
      },
      boxShadow: {
        'prism-card': '0 1px 3px 0 rgba(15, 23, 42, 0.04), 0 1px 2px -1px rgba(15, 23, 42, 0.02)',
        'prism-elevated': '0 4px 12px -2px rgba(15, 23, 42, 0.06), 0 2px 4px -2px rgba(15, 23, 42, 0.04)',
        'prism-glow': '0 0 20px -5px rgba(37, 99, 235, 0.2)',
        'prism-active': '0 4px 12px 0 rgba(37, 99, 235, 0.25)',
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
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
