module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      keyframes: {
        grow: {
          '0%': { transform: 'scaleY(0)', opacity: 0 },
          '100%': { transform: 'scaleY(1)', opacity: 1 },
        },
        fadeIn: {
          '0%': { opacity: 0, transform: 'translateY(10px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        }
      },
      animation: {
        grow: 'grow 0.6s ease-out forwards',
        'fade-in': 'fadeIn 0.8s ease-out forwards',
      }
    }
  },
  plugins: [],
}
