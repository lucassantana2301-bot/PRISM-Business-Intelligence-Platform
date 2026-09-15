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
          midnight: "#090E1A",
          ink: "#111827",
          porcelain: "#F8F9FC",
          pureSurface: "#FFFFFF",
          hairline: "#E6E9F2",
          hairlineHover: "#D5DAE6",
          muted: "#6B7280",
          mutedLight: "#9CA3AF",
          text: "#111827",
          textSecondary: "#4B5563",

          // Flagship Spectral Tokens
          indigo: "#5361FF",
          violet: "#7967FF",
          cyan: "#38BDF8",
          cyanDark: "#087EA4",
          positive: "#10B981",
          negative: "#F05D6F",

          // Backwards-compatible aliases
          bg: {
            canvas: "#F8F9FC",
            card: "#FFFFFF",
            elevated: "#F8F9FC",
            hover: "#F3F4F8",
            dark: "#090E1A",
            darkCard: "#111827",
            darkElevated: "#182035",
          },
          border: {
            subtle: "#E6E9F2",
            hover: "#D5DAE6",
            active: "#5361FF",
          },
          accent: {
            blue: "#5361FF",
            blueDark: "#3E4CD6",
            emerald: "#10B981",
            rose: "#F05D6F",
            amber: "#F59E0B",
            purple: "#7967FF",
            cyan: "#38BDF8",
            indigo: "#5361FF",
          },
        },
      },
      boxShadow: {
        'prism-card': '0 1px 3px 0 rgba(9, 14, 26, 0.03), 0 1px 2px -1px rgba(9, 14, 26, 0.02)',
        'prism-elevated': '0 8px 24px -4px rgba(9, 14, 26, 0.06), 0 2px 6px -1px rgba(9, 14, 26, 0.03)',
        'prism-hero': '0 12px 32px -6px rgba(83, 97, 255, 0.08), 0 4px 12px -2px rgba(9, 14, 26, 0.04)',
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
      },
      animation: {
        'fade-in': 'fadeIn 180ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
