/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'custom-blue': '#204453',
        'custom-slight-light-blue': '#1c4455',
      },
    },
  },
  plugins: [],
}


