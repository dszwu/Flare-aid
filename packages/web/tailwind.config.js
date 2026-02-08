/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        flare: {
          50:  "#fff1f0",
          100: "#ffe0de",
          200: "#ffc7c2",
          300: "#ffa198",
          400: "#ff6b5e",
          500: "#ff3b2f",
          600: "#e8200f",
          700: "#c41509",
          800: "#a1160d",
          900: "#851912",
          950: "#480804",
        },
        ocean: {
          50:  "#f0f9ff",
          100: "#e0f2fe",
          200: "#b9e5fe",
          300: "#7cd3fd",
          400: "#36bffa",
          500: "#0ca6eb",
          600: "#0084c9",
          700: "#0169a3",
          800: "#065986",
          900: "#0b4a6f",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
};
