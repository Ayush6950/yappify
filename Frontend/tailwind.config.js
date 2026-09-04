import daisyui from "daisyui";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      colors: {
        brand: {
          primary: "rgb(99 102 241)", // Indigo
          accent: "rgb(34 211 238)", // Cyan
          "surface-deep": "#070a13",
          "surface-sidebar": "#0d1220",
          "surface-card": "#141b2d",
          "surface-hover": "#1c2540",
        },
        // Intermediate shades referenced across the app that Tailwind
        // does not ship by default. Declared here so they actually render.
        slate: {
          350: "#b6c2d2",
          450: "#7d8ca3",
          650: "#556074",
          850: "#172033",
          950: "#0a0f1c",
          955: "#070b15",
        },
        violet: { 350: "#b79cfa" },
        indigo: { 550: "#5457e8" },
      },
      borderRadius: {
        "4xl": "2rem",
      },
      boxShadow: {
        soft: "0 1px 2px rgba(0,0,0,.3), 0 8px 24px -12px rgba(0,0,0,.6)",
        raised: "0 2px 4px rgba(0,0,0,.35), 0 18px 40px -18px rgba(0,0,0,.8)",
        glow: "0 0 0 1px rgba(99,102,241,.25), 0 12px 32px -12px rgba(99,102,241,.55)",
        shell: "0 40px 120px -40px rgba(0,0,0,.95), 0 0 0 1px rgba(255,255,255,.04)",
      },
      animation: {
        border: "border 4s linear infinite",
        shimmer: "shimmer 1.6s ease-in-out infinite",
      },
      keyframes: {
        border: {
          to: { "--border-angle": "360deg" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [daisyui],
};
