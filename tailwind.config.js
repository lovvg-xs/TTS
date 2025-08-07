/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'gray-900': '#121212',
        'gray-800': '#1E1E1E',
        'gray-700': '#2D2D2D',
        'gray-600': '#3C3C3C',
        'gray-400': '#B3B3B3',
        'brand': {
          '500': '#1DB954',
          '600': '#1ED760'
        },
      },
      keyframes: {
        'toast-in': {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'toast-out': {
          '0%': { transform: 'translateX(0)', opacity: '1' },
          '100%': { transform: 'translateX(100%)', opacity: '0' },
        },
      },
      animation: {
        'toast-in': 'toast-in 0.5s ease-out forwards',
        'toast-out': 'toast-out 0.5s ease-in forwards',
      },
    }
  },
  plugins: [],
}