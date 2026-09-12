/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        industrial: {
          bg: '#F5F7FA',
          surface: '#FFFFFF',
          card: 'rgba(255, 255, 255, 0.88)',
          border: '#E2E8F0',
          'border-dark': '#CBD5E1',
          text: '#0F172A',
          muted: '#64748B',
          subtle: '#94A3B8',
          dark: '#1E293B',
          accent: '#0284C7',
          'accent-light': '#E0F2FE',
          emerald: '#059669',
          'emerald-light': '#ECFDF5',
          amber: '#D97706',
          'amber-light': '#FFFBEB',
          rose: '#DC2626',
          'rose-light': '#FEF2F2',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(15, 23, 42, 0.04), 0 1px 2px -1px rgba(15, 23, 42, 0.04)',
        'card': '0 4px 6px -1px rgba(15, 23, 42, 0.05), 0 2px 4px -2px rgba(15, 23, 42, 0.05)',
        'elevated': '0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.04)',
        'modal': '0 20px 25px -5px rgba(15, 23, 42, 0.12), 0 8px 10px -6px rgba(15, 23, 42, 0.06)',
      },
      animation: {
        'spin-slow': 'spin 35s linear infinite',
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
