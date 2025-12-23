/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        christmas: {
          red: '#D42426',
          darkRed: '#8B0000',
          green: '#165B33',
          gold: '#F8B229',
          snow: '#F0F0F0'
        }
      },
      fontFamily: {
        christmas: ['Georgia', 'serif']
      }
    },
  },
  plugins: [],
}
