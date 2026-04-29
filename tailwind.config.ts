import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#0A0E18',
          surface: '#14181F',
          overlay: 'rgba(0,0,0,0.55)',
        },
        text: {
          DEFAULT: '#F5EBD7',
        },
        amber: {
          DEFAULT: '#FFD89A',
          soft: '#FFE9C0',
          deep: '#FFB661',
          glow: 'rgba(232,160,74,0.2)',
        },
        cyan: {
          DEFAULT: '#A8E9F4',
          deep: '#5DD3E8',
          glow: 'rgba(63,190,212,0.18)',
        },
        destructive: '#E24B4A',
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'SF Pro', 'Helvetica Neue', 'sans-serif'],
      },
      boxShadow: {
        sheet: '0 -8px 32px rgba(0,0,0,0.6)',
        'cta-amber': '0 10px 28px rgba(255,216,154,0.22)',
        'cta-pro': '0 12px 32px rgba(255,216,154,0.3)',
      },
      keyframes: {
        soundBar: {
          '0%, 100%': { height: '3px' },
          '50%': { height: '11px' },
        },
      },
      animation: {
        soundBar: 'soundBar 0.55s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
