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
        background: "#000000",
        surface: "#0e0e11",
        "surface-light": "#18181b",
        neon: {
          DEFAULT: "#ffffff",
          50: "#fafafa",
          100: "#f4f4f5",
          200: "#e4e4e7",
          300: "#d4d4d8",
          400: "#a1a1aa",
          500: "#ffffff",
          600: "#e4e4e7",
          700: "#d4d4d8",
          800: "#27272a",
          900: "#18181b",
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
        neon: "0 0 15px rgba(255, 255, 255, 0.2)",
        "neon-sm": "0 0 8px rgba(255, 255, 255, 0.12)",
        "neon-lg": "0 0 25px rgba(255, 255, 255, 0.3)",
      },
    },
  },
  plugins: [],
};
export default config;
