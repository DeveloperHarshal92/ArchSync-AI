/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['Montserrat', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        // Semantic CSS variable-based tokens that adapt dynamically
        theme: {
          bg: 'var(--color-bg)',
          surface: 'var(--color-surface)',
          'surface-raised': 'var(--color-surface-raised)',
          'surface-card': 'var(--color-surface-card)',
          text: 'var(--color-text)',
          muted: 'var(--color-text-muted)',
          border: 'var(--color-border)',
          accent: 'var(--color-accent)',
          'accent-hover': 'var(--color-accent-hover)',
          'accent-deep': 'var(--color-accent-deep)',
          focus: 'var(--color-focus)',
          technical: 'var(--color-technical)',
        },

        // Coral accent tokens for Light Theme (from reference images)
        coral: {
          DEFAULT: '#EB7844',
          hover: '#D96634',
          light: '#F08C5D',
          subtle: '#FFF5F0',
          border: 'rgba(235, 120, 68, 0.25)',
        },

        // Canonical Dark Architectural Tokens
        arch: {
          bg: '#090907',
          surface: '#11110F',
          raised: '#191814',
          card: '#141310',
          text: '#F2EEE7',
          muted: '#B9B1A5',
          border: 'rgba(185, 157, 115, 0.22)',
          accent: '#B99D73',
          'accent-deep': '#6C5636',
          focus: '#D6B887',
        },

        // Primary palette aliases
        bronze: {
          DEFAULT: '#B99D73',
          light: '#D6B887',
          deep: '#6C5636',
          muted: 'rgba(185, 157, 115, 0.22)',
        },

        canvas: {
          DEFAULT: 'var(--color-canvas-bg)',
          dot: 'var(--color-canvas-dot)',
        },
        surface: {
          DEFAULT: 'var(--color-surface)',
          base: 'var(--color-bg)',
          deep: 'var(--color-bg)',
          raised: 'var(--color-surface-raised)',
          elevated: 'var(--color-surface-raised)',
          subtle: 'var(--color-surface-subtle)',
        },
        stroke: {
          DEFAULT: 'var(--color-border)',
          structural: 'var(--color-border)',
          subtle: 'var(--color-border-subtle)',
          hover: 'var(--color-accent)',
        },
        status: {
          success: '#10B981',
          warning: '#F59E0B',
          danger: '#EF4444',
          info: '#3B82F6',
        },
        brand: {
          DEFAULT: 'var(--color-accent)',
          action: 'var(--color-accent)',
          'action-hover': 'var(--color-accent-hover)',
          focus: 'var(--color-focus)',
          accent: 'var(--color-accent)',
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
