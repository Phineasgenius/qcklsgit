/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Georgia', 'Cambria', '"Times New Roman"', 'Times', 'serif'],
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      colors: {
        gold: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
        },
        editorial: {
          morningBg: '#faf8f5',
          morningCard: '#ffffff',
          morningBorder: '#e7e2d9',
          goldenBg: '#fef7ee',
          goldenCard: '#fffdfa',
          goldenBorder: '#edd5b7',
          duskBg: '#181b2a',
          duskCard: '#22273d',
          duskBorder: '#363d5c',
          midnightBg: '#121212',
          midnightCard: '#1a1a1a',
          midnightBorder: '#2d2d2d',
        }
      },
    },
  },
  plugins: [],
}
