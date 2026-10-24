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
          900: '#0F172A', // Slate dark charcoal
          800: '#1E293B', // Charcoal body dark
          700: '#334155', // Steel grey card
          600: '#475569', // Border steel
          500: '#64748B', // Muted steel
          400: '#94A3B8', // Light steel
          100: '#F1F5F9', // Crisp light background
          50: '#F8FAFC',
        },
        workshop: {
          orange: '#EA580C', // Industrial safety orange
          orangeHover: '#C2410C',
          orangeLight: '#FFF7ED',
          amber: '#F59E0B',
          navy: '#0B132B',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
