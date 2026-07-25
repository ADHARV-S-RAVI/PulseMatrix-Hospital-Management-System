/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#040B16', // Deep space dark navy
        surface: '#0B132B',
        primary: '#00E5FF', // Glowing cyan
        secondary: '#1C4E80', // Electric blue
        accent: '#FF3366', // Neon red
        success: '#00FFAA', // Neon green
        warning: '#FFD700', // Neon yellow
        danger: '#FF3366', // Neon red for disaster
        hologram: 'rgba(0, 229, 255, 0.1)', // Glassmorphism glow
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Orbitron', 'Inter', 'sans-serif'], // Cyberpunk-ish font
      },
      boxShadow: {
        'neon': '0 0 10px rgba(0, 229, 255, 0.5), 0 0 20px rgba(0, 229, 255, 0.3)',
        'neon-red': '0 0 10px rgba(255, 51, 102, 0.5), 0 0 20px rgba(255, 51, 102, 0.3)',
        'glass': '0 8px 32px 0 rgba(0, 229, 255, 0.1)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(0, 229, 255, 0.2)' },
          '100%': { boxShadow: '0 0 20px rgba(0, 229, 255, 0.6)' },
        }
      }
    },
  },
  plugins: [],
}
