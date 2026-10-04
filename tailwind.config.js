/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          900: '#0a1128',
          800: '#001f54',
          700: '#034078',
        },
        ocean: {
          DEFAULT: '#1282a2',
          light: '#00a8cc',
        },
        readiness: {
          low: '#0284c7', // Sky blue
          moderate: '#f59e0b', // Amber/Orange
          heavy: '#ea580c', // Deep Orange
          critical: '#ef4444', // Red
          resolved: '#10b981', // Green
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
