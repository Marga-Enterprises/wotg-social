/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'custom-blue': '#c0392b',
        'custom-slight-light-blue': '#c0392b',
      },
    },
  },
  plugins: [],
}


