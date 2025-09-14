/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        light: {
          background: 'white',          // Page background
          header: 'rgb(0,51,102)',      // Header / Buttons
          surface: 'rgb(136,207,229)',  // Cards / Sections
          text: 'black',                // Main text
        },
        dark: {
          background: 'rgb(9,9,9)',     // Page background
          header: 'green',              // Header / Buttons
          surface: 'rgb(33,33,33)',     // Cards / Sections
          text: 'white',                // Main text
        },
      },
    },
  },
  plugins: [],
}
