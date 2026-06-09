/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'sidebar': 'linear-gradient(160deg, #4f46e5 0%, #7c3aed 50%, #a855f7 100%)',
      },
      boxShadow: {
        'card': '0 2px 16px 0 rgba(99,102,241,0.07)',
      }
    },
  },
  plugins: [],
}
