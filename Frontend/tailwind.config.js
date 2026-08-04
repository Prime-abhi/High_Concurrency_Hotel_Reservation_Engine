/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1C2321",
        brass: "#B08A4E",
        stone: "#EFEAE1",
        slate: "#3F4B4A",
        moss: "#4F6F5D",
        rust: "#A6493B"
      },
      fontFamily: {
        display: ["'Fraunces'", "serif"],
        body: ["'Inter'", "sans-serif"]
      }
    },
  },
  plugins: [],
}
