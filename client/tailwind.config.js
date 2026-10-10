/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Semantic surface tokens
        canvas: {
          DEFAULT: '#0a0f1d',
          dot: '#334155',
        },
        surface: {
          base: '#0f172a',       // slate-900: default body & cards
          deep: '#020617',       // slate-950: dialogs, backdrop, studio chrome
          elevated: '#1e293b',   // slate-800: docked sidebars, panels
          subtle: '#334155',     // slate-700: hover wells, borders
        },
        // Semantic structural borders
        stroke: {
          structural: 'rgba(30, 41, 59, 0.8)', // slate-800/80
          subtle: 'rgba(51, 65, 85, 0.6)',     // slate-700/60
          hover: '#475569',                    // slate-600
        },
        // Brand & Interactive Accents
        brand: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bae0fd',
          300: '#7cc7fb',
          400: '#36a8f6',
          500: '#0c8de4',
          600: '#0270c2',
          700: '#03599e',
          800: '#074c82',
          900: '#0b3f6d',
          // Verified WCAG AA Action Colors
          action: '#0e7490',         // cyan-700: verified 5.36:1 with white text (WCAG AA >4.5:1)
          'action-hover': '#155e75', // cyan-800: active/hover state
          focus: '#06b6d4',          // cyan-500: verified 7.87:1 against dark bg
          accent: '#22d3ee',         // cyan-400: active selection highlights
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
