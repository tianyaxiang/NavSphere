/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
    './src/app/**/*.{ts,tsx}',
    './src/registry/**/*.{ts,tsx}',
  ],
  plugins: [
    require("tailwindcss-animate"),
    require("tailwind-scrollbar"),
  ],
}

