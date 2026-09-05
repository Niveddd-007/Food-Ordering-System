/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          950: '#09090b',
          900: '#121215',
          850: '#17171c',
          800: '#1e1e24',
          700: '#2a2a34',
          600: '#3f3f4e',
        },
        brand: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#ff5722', // High contrast neon orange from reference design
          600: '#f44336',
          700: '#d83528',
          800: '#b22b20',
          900: '#8c221a',
        }
      },
      boxShadow: {
        'glow-orange': '0 0 25px -5px rgba(255, 87, 34, 0.4)',
        'glow-orange-lg': '0 0 40px -5px rgba(255, 87, 34, 0.6)',
        'glow-emerald': '0 0 20px -5px rgba(16, 185, 129, 0.4)',
        'glow-purple': '0 0 25px -5px rgba(168, 85, 247, 0.4)',
      },
      animation: {
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
        'float': 'float 4s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 15px -3px rgba(255, 87, 34, 0.3)' },
          '50%': { boxShadow: '0 0 35px 5px rgba(255, 87, 34, 0.7)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        }
      }
    },
  },
  plugins: [],
}
