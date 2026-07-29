/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      colors: {
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        partial: '#FBBF24',
        'tokyo-night': {
          bg: '#1a1b26',
          surface: '#24283b',
          border: '#414868',
          text: '#c0caf5',
          'text-dim': '#565f89',
          accent: '#7aa2f7',
          green: '#9ece6a',
          red: '#f7768e',
          yellow: '#e0af68',
          orange: '#ff9e64',
        },
      },
    },
  },
  plugins: [],
}
