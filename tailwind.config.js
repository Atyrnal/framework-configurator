/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: '#171614',
        paper: '#fffcf9',
        stage: '#f3f1ee',
        line: '#e6e3de',
        muted: '#8b8680',
        accent: '#171614',
      },
      fontFamily: {
        sans: ['Instrument Sans', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        dock: '0 8px 28px rgba(23, 22, 20, 0.08)',
      },
    },
  },
  plugins: [],
}
