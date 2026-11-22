/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Fraunces', 'Georgia', '"Times New Roman"', 'serif'],
        sans: ['"Instrument Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        // Paper & Espresso — warm neutral scale.
        // ink-50 is the paper canvas, ink-900/950 the espresso ink.
        ink: {
          50: '#FAF7F2',
          100: '#F5EFE6',
          200: '#E5DDD0',
          300: '#D4C6B2',
          400: '#A08D78',
          500: '#7A6653',
          600: '#5C4A3B',
          700: '#43332A',
          800: '#2C1E18',
          900: '#231914',
          950: '#17100D',
        },
        // Saffron primary (was indigo). Kept on the `indigo` scale name so the
        // whole existing component set inherits the warm accent.
        indigo: {
          50: '#FDF5E6',
          100: '#FAE8C8',
          200: '#F3D49B',
          300: '#E9B964',
          400: '#E09B2C',
          500: '#D97706',
          600: '#C26508',
          700: '#9E5009',
          800: '#7C3F0D',
          900: '#63340F',
        },
        // Sage (was emerald) for positive/success semantics.
        emerald: {
          50: '#F2F5ED',
          100: '#E3E9D8',
          200: '#C8D3B4',
          300: '#A7B98E',
          400: '#879A6D',
          500: '#6B7F5E',
          600: '#54674A',
          700: '#42533B',
          800: '#364430',
          900: '#2C3828',
        },
        // Terracotta (was violet) for one of the four track colours.
        violet: {
          50: '#FBEFEA',
          100: '#F6DCD1',
          200: '#EDBCA9',
          300: '#E0957B',
          400: '#CE7355',
          500: '#B4543A',
          600: '#9A452F',
          700: '#7D3826',
          800: '#662F21',
          900: '#54291F',
        },
        // Deeper gold (was amber) for aptitude / warning.
        amber: {
          50: '#FDF6E3',
          100: '#F9EBC4',
          200: '#F2D98D',
          300: '#E8C054',
          400: '#DDA62B',
          500: '#C08A17',
          600: '#A06F11',
          700: '#7E5612',
          800: '#684716',
          900: '#593C16',
        },
        // Brick (was rose) for errors and missing keywords.
        rose: {
          50: '#FCF0EE',
          100: '#F8DFDA',
          200: '#F0BFB4',
          300: '#E2988A',
          400: '#CE6E5C',
          500: '#B7503D',
          600: '#9C3F2F',
          700: '#803529',
          800: '#6B2F26',
          900: '#5A2A23',
        },
        // Named brand tokens for new work.
        paper: '#FAF7F2',
        espresso: {
          DEFAULT: '#231914',
          soft: '#2C1E18',
          line: '#3A2A22',
        },
        saffron: {
          DEFAULT: '#D97706',
          deep: '#C26508',
          tint: '#FDF5E6',
        },
        sand: '#E5DDD0',
        terracotta: '#B4543A',
        sage: '#6B7F5E',
      },
      boxShadow: {
        card: '0 1px 2px 0 rgb(35 25 20 / 0.04), 0 1px 3px 0 rgb(35 25 20 / 0.05)',
        lift: '0 14px 34px -14px rgb(35 25 20 / 0.22), 0 2px 6px -2px rgb(35 25 20 / 0.08)',
      },
      keyframes: {
        'rise-in': {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(0.9)', opacity: '0.6' },
          '70%': { transform: 'scale(1.35)', opacity: '0' },
          '100%': { transform: 'scale(1.35)', opacity: '0' },
        },
      },
      animation: {
        'rise-in': 'rise-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) both',
        'pulse-ring': 'pulse-ring 2.4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
};
