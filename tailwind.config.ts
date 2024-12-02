/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        darkergray: "#6b7280",
        darkgray: "#ccc",
        mediumgray: "#e5e5e5",
        lightgray: "#f5f5f5",
        lightergray: "#f9fafb",
      },
      fontFamily: {
        sans: ["Lato", "sans-serif"], // Override the default Tailwind sans font stack
      lato: ["Lato", "sans-serif"], // Explicit declaration for Lato
      abchanel: ['ABC Corporate Extra Light'],
      arial: ["Arial", "Helvetica", "sans-serif"],
      },
    },
  },
  plugins: [],
};
