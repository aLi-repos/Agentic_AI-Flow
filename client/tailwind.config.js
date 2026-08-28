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
      colors: {
        brand: {
          50: '#f0f4ff',
          100: '#dbe4fe',
          200: '#bfd0fe',
          300: '#93b2fd',
          400: '#608bf9',
          500: '#3b66f5',
          600: '#2547eb',
          700: '#1d35d8',
          800: '#1e2cb0',
          900: '#1e2a8a',
          950: '#111754',
        },
        surface: {
          50: '#0f172a',
          100: '#1e293b',
          200: '#334155',
          300: '#475569',
          800: '#0b0f19',
          900: '#060911',
          950: '#030509',
        },
        agent: {
          planner: '#38bdf8',     // Sky blue
          execution: '#a855f7',   // Purple
          validation: '#10b981',  // Emerald
          recovery: '#f59e0b',    // Amber
          monitoring: '#ec4899',  // Pink
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 12s linear infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 15px rgba(59, 102, 245, 0.3)' },
          '100%': { boxShadow: '0 0 30px rgba(59, 102, 245, 0.7)' },
        }
      }
    },
  },
  plugins: [],
}
