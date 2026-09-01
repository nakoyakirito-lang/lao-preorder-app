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
        background: "#080c14",
        surface: "#0f172a",
        "surface-light": "#1e293b",
        neon: {
          DEFAULT: "#00FF00",
          50: "#e6ffe6",
          100: "#b3ffb3",
          200: "#80ff80",
          300: "#4dff4d",
          400: "#1aff1a",
          500: "#00FF00",
          600: "#00cc00",
          700: "#009900",
          800: "#006600",
          900: "#003300",
        },
        laoRed: {
          DEFAULT: "#dc2626",
          dark: "#991b1b",
        },
        laoGold: "#f59e0b",
      },
      fontFamily: {
        lao: ["var(--font-noto-sans-lao)", "Noto Sans Lao", "sans-serif"],
      },
      boxShadow: {
        neon: "0 0 15px rgba(0, 255, 0, 0.45)",
        "neon-sm": "0 0 8px rgba(0, 255, 0, 0.35)",
        "neon-lg": "0 0 25px rgba(0, 255, 0, 0.6)",
      },
    },
  },
  plugins: [],
};
export default config;
