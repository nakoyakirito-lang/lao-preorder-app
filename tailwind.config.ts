import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#f8fafc",
        surface: "#ffffff",
        "surface-light": "#f1f5f9",
        neon: {
          DEFAULT: "#0f172a",
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          400: "#94a3b8",
          500: "#0f172a",
          600: "#1e293b",
          700: "#334155",
          800: "#475569",
          900: "#020617",
        },
        laoRed: {
          DEFAULT: "#ef4444",
          dark: "#991b1b",
        },
        laoGold: "#f59e0b",
      },
      fontFamily: {
        lao: ["var(--font-noto-sans-lao)", "Noto Sans Lao", "sans-serif"],
      },
      boxShadow: {
        neon: "0 2px 10px rgba(0, 0, 0, 0.08)",
        "neon-sm": "0 1px 4px rgba(0, 0, 0, 0.05)",
        "neon-lg": "0 10px 25px rgba(0, 0, 0, 0.1)",
      },
    },
  },
  plugins: [],
};
export default config;
