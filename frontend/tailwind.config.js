/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#ff4d8d",
        secondary: "#ffffff",
        ink: "#1a1523",
        dusk: "#4a4358",
      },
      fontFamily: {
        sans: ["'Inter'", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 15px 45px rgba(255, 77, 141, 0.25)",
      },
    },
  },
  plugins: [],
};
