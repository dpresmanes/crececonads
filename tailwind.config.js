/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        dark: '#121212',
        primary: '#00FFA3',
        light: '#FFFFFF',
      },
      fontFamily: {
        'space-grotesk': ['"Space Grotesk"', 'sans-serif'],
        'inter': ['Inter', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      boxShadow: {
        'neon': '0 0 10px rgba(0, 255, 163, 0.5), 0 0 20px rgba(0, 255, 163, 0.3)',
        'neon-lg': '0 0 15px rgba(0, 255, 163, 0.5), 0 0 30px rgba(0, 255, 163, 0.3)',
      },
    },
  },
  plugins: [],
};