/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        surface: {
          950: '#0d1117',
          900: '#12161c',
          800: '#181d26',
          700: '#212733',
          600: '#2b3241',
          500: '#3a4254',
        },
        muted: {
          100: '#c7cdd9',
          200: '#a9b1c2',
          300: '#8b93a7',
          400: '#6b7280',
        },
        accent: {
          teal: '#4fa89b',
          amber: '#c99a4a',
          rose: '#b3654f',
        },
        signal: {
          buy: '#4f9c74',
          hold: '#c9a24a',
          sell: '#b35450',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
}
