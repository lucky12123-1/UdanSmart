/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: { 900: '#0A0F1E', 800: '#0D1526', 700: '#111D35', 600: '#1A2A4A' },
        brand: { 400: '#60A5FA', 500: '#3B82F6', 600: '#2563EB' },
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
        saffron: '#FF9933',
        'india-green': '#138808'
      },
      fontFamily: { sans: ['Inter', 'sans-serif'] },
      animation: {
        'fade-in': 'fadeIn 0.45s ease-out both',
        'slide-up': 'slideUp 0.55s ease-out both',
        shimmer: 'shimmer 1.7s linear infinite',
        'pulse-slow': 'pulse 4s ease-in-out infinite',
        float: 'float 10s ease-in-out infinite'
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(30px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-22px)' } }
      }
    }
  },
  plugins: []
};
