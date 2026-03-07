/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts,scss}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e8eaf6',
          100: '#c5cae9',
          500: '#3f51b5',
          700: '#303f9f',
          900: '#1a237e',
        },
        accent: {
          500: '#ff4081',
        },
        // Pastel Jungle palette
        jungle: {
          50: '#f0f7f4',
          100: '#d9ede3',
          200: '#b5dbc8',
          300: '#88c4a8',
          400: '#5eaa86',
          500: '#3d8f6b',
          600: '#2d7356',
          700: '#255d46',
          800: '#1f4b39',
          900: '#1a3e30',
          950: '#0d231b',
        },
        sand: {
          50: '#faf8f5',
          100: '#f3efe8',
          200: '#e6ddd0',
          300: '#d4c5ae',
          400: '#c0a98a',
          500: '#b29470',
        },
        coral: {
          50: '#fef5f2',
          100: '#fde8e1',
          200: '#fcd5c8',
          300: '#f8b4a0',
          400: '#f28b6d',
          500: '#e86e4e',
        },
        lagoon: {
          50: '#effcfc',
          100: '#d7f5f6',
          200: '#b3ebee',
          300: '#7fdce1',
          400: '#46c4cd',
          500: '#29a8b3',
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        glass: '0 8px 32px rgba(0, 0, 0, 0.08)',
        'glass-lg': '0 16px 48px rgba(0, 0, 0, 0.12)',
      },
    },
  },
  plugins: [],
};
