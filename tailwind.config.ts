import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          50: "#f7f7f8",
          100: "#eeeef0",
          200: "#d6d6db",
          300: "#b3b3bc",
          400: "#888893",
          500: "#5f5f6a",
          600: "#3f3f48",
          700: "#27272d",
          800: "#18181c",
          900: "#0c0c10",
          950: "#050507",
        },
        flame: {
          400: "#fb923c",
          500: "#f97316",
          600: "#ea580c",
          700: "#c2410c",
        },
        forge: {
          400: "#ff5470",
          500: "#ff2d55",
          600: "#e0103a",
        },
      },
      fontFamily: {
        sans: ["system-ui", "Segoe UI", "Roboto", "sans-serif"],
        display: ["Impact", "Bebas Neue", "system-ui", "sans-serif"],
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-in": "fadeIn 0.4s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
