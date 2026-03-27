/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}", // <--- CRITICAL: Scans all Angular files
  ],
  darkMode: 'selector',
  theme: {
    extend: {
      colors: {
        // Define your custom colors here to match 'text-primary'
        primary: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          950: '#022c22',
        }
      }
    },
  },
  plugins: [
    require('tailwindcss-primeui') // <--- Make sure this is here!
  ],
};