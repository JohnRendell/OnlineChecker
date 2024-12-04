/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "Public/*.{html,js}",
    "Views/*.{html,js}",
    "Page404/*.html",
    "Checker/*.html"
  ],
  theme: {
    extend: {
      fontFamily: {
        'Pixelify': ['Pixelify Sans', 'Sans-serif']
      },
      screens: {
        'xsm': { 'max' : '320px' }
      }
    },
  },
  plugins: [],
}