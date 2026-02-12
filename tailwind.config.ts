import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Valentine's Day Palette
        'bg-outer': '#F8DAE9',
        'app-container': '#FFE5F0',
        'decorative-blob': '#FFD6E8',
        'action-pink': '#FF6B9D',
        'action-cyan': '#07B9D5',
        'accent-purple': '#7C3BED',
        'border': '#FFD6E8',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      fontSize: {
        'data-label': ['10px', { lineHeight: '1', letterSpacing: '0.1em' }],
      },
      borderRadius: {
        'glass': '24px',
        'glass-lg': '32px',
      },
      backdropBlur: {
        'glass': '12px',
      },
      animation: {
        'match': 'match 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'select': 'select 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'shake': 'shake 0.4s cubic-bezier(.36,.07,.19,.97)',
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-in-out',
      },
      keyframes: {
        match: {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(0)', opacity: '0' },
        },
        select: {
          '0%': { transform: 'scale(1)' },
          '100%': { transform: 'scale(0.9)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-4px)' },
          '75%': { transform: 'translateX(4px)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config
