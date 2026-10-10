/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['Montserrat', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        // Strict Brand Identity Tokens (Warm Ivory, Deep Editorial Blue, Coral Orange)
        'warm-ivory': '#eae6ed',
        'editorial-blue': '#226192',
        coral: '#ef8557',

        // Semantic surface tokens derived exclusively from the 3 approved colors
        canvas: {
          DEFAULT: '#eae6ed',
          dot: 'rgba(34, 97, 146, 0.15)',
        },
        surface: {
          DEFAULT: '#eae6ed',
          base: '#eae6ed',
          deep: '#eae6ed',
          raised: 'rgba(34, 97, 146, 0.05)',
          elevated: 'rgba(34, 97, 146, 0.08)',
          subtle: 'rgba(34, 97, 146, 0.025)',
        },
        stroke: {
          DEFAULT: 'rgba(34, 97, 146, 0.20)',
          structural: 'rgba(34, 97, 146, 0.20)',
          subtle: 'rgba(34, 97, 146, 0.10)',
          hover: 'rgba(34, 97, 146, 0.35)',
        },
        status: {
          success: '#226192',
          warning: '#ef8557',
          danger: '#ef8557',
        },
        brand: {
          DEFAULT: '#226192',
          action: '#226192',
          'action-hover': 'rgba(34, 97, 146, 0.88)',
          focus: '#ef8557',
          accent: '#ef8557',
        },

        // Backward-compatibility aliases mapped strictly to approved palette opacities
        slate: {
          50: '#226192',
          100: '#226192',
          200: 'rgba(34, 97, 146, 0.90)',
          300: 'rgba(34, 97, 146, 0.75)',
          400: 'rgba(34, 97, 146, 0.60)',
          500: 'rgba(34, 97, 146, 0.45)',
          600: 'rgba(34, 97, 146, 0.30)',
          700: 'rgba(34, 97, 146, 0.20)',
          800: 'rgba(34, 97, 146, 0.10)',
          900: '#eae6ed',
          950: '#eae6ed',
        },
        cyan: {
          DEFAULT: '#ef8557',
          300: '#ef8557',
          400: '#ef8557',
          500: '#ef8557',
          600: '#ef8557',
          700: '#226192',
        },
        emerald: {
          DEFAULT: '#eae6ed',
          200: '#eae6ed',
          300: '#eae6ed',
          400: '#eae6ed',
          500: '#eae6ed',
        },
        rose: {
          DEFAULT: '#ef8557',
          200: '#ef8557',
          300: '#ef8557',
          400: '#ef8557',
          500: '#ef8557',
          600: '#ef8557',
        },
        amber: {
          DEFAULT: '#ef8557',
          300: '#ef8557',
          400: '#ef8557',
          500: '#ef8557',
        },
      },
      transitionTimingFunction: {
        spring: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      transitionDuration: {
        fast: '100ms',
        normal: '200ms',
        smooth: '300ms',
      },
    },
  },
  plugins: [],
};
