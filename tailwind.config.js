/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './registry/**/*.{ts,tsx}',
  ],
  plugins: [
    require("tailwindcss-animate"),
    require("tailwind-scrollbar"),
  ],
}

