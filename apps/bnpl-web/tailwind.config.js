/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        sensei: {
          ink:    "#0A1B2E",
          blue:   "#123A6B",
          bright: "#1E63C4",
          trust:  "#1E8E5A",
          warn:   "#C9852A",
          danger: "#B3271E",
          paper:  "#F7F9FC",
          line:   "#D9E1EC",
          text:   "#1B2733",
          muted:  "#5B6B7B",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
      },
    },
  },
  plugins: [],
};
