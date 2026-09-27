/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        raksha: {
          bg: '#070a10',
          card: '#0d131f',
          surface: '#121929',
          border: '#1f2b45',
          borderBright: '#2d3f66',
          textMuted: '#94a3b8',
          textBright: '#f8fafc',
          alert: {
            red: '#ef4444',
            redGlow: 'rgba(239, 68, 68, 0.4)',
            amber: '#f59e0b',
            amberGlow: 'rgba(245, 158, 11, 0.3)',
            green: '#10b981',
            greenGlow: 'rgba(16, 185, 129, 0.3)',
            blue: '#3b82f6',
            cyan: '#06b6d4'
          }
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      },
      animation: {
        'pulse-subtle': 'pulse 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'radar-sweep': 'radar 3s linear infinite',
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
        'glow-pulse': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        radar: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' }
        },
        glow: {
          '0%': { filter: 'drop-shadow(0 0 4px rgba(239, 68, 68, 0.3))' },
          '100%': { filter: 'drop-shadow(0 0 16px rgba(239, 68, 68, 0.8))' }
        }
      },
      boxShadow: {
        'tactical-red': '0 0 20px -3px rgba(239, 68, 68, 0.35)',
        'tactical-cyan': '0 0 20px -3px rgba(6, 182, 212, 0.35)',
        'tactical-amber': '0 0 20px -3px rgba(245, 158, 11, 0.35)',
        'tactical-blue': '0 0 25px -4px rgba(59, 130, 246, 0.4)',
        'inner-glow': 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.08)',
      }
    },
  },
  plugins: [],
}
