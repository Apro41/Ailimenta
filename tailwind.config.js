module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#66bb6a',
          DEFAULT: '#43a047',
          dark: '#1b5e20',
        },
        accent: '#ffd600',
        background: '#f1f8e9',
        card: '#fffde7',
      },
      fontFamily: {
        sans: ['Inter', 'Nunito', 'sans-serif'],
      },
      borderRadius: {
        xl: '1.5rem',
      },
      boxShadow: {
        card: '0 4px 24px 0 rgba(67, 160, 71, 0.10)',
      },
    },
  },
  plugins: [],
};
