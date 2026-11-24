/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: '#F8F7F2',
        surface: '#FFFFFF',
        'surface-subtle': '#F4F2E9',
        primary: {
          DEFAULT: '#D5E5B5',
          dark: '#B8CE90',
          light: '#E5F0D0'
        },
        secondary: {
          DEFAULT: '#778C59',
          dark: '#586A41',
          light: '#94A876'
        },
        text: {
          DEFAULT: '#292D27',
          muted: '#686E63',
          subtle: '#9A9F93'
        },
        accent: {
          DEFAULT: '#F0AA95',
          dark: '#DB8E78',
          light: '#F8C8B9'
        },
        border: '#E3DFD4'
      },
      fontFamily: {
        sans: ['Pretendard', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 10px rgba(41, 45, 39, 0.05)',
        'lifted': '0 6px 20px rgba(41, 45, 39, 0.08)',
        'phone': '0 20px 50px rgba(41, 45, 39, 0.15)',
      },
      animation: {
        'bounce-gentle': 'bounceGentle 2.5s infinite ease-in-out',
        'wiggle': 'wiggle 0.8s ease-in-out infinite',
        'pulse-subtle': 'pulseSubtle 2s infinite ease-in-out',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.85' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-4px)' },
        }
      }
    },
  },
  plugins: [],
}
