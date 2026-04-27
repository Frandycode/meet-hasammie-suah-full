/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        'track-gold': '#D4AF37',
        'golden-green': '#7A9B00',
        'lime-gold': '#9AB800',
        'forest-dark': '#0F1A08',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['"DM Sans"', 'sans-serif'],
        accent: ['"Cormorant Garamond"', 'serif'],
      },
    },
  },
  plugins: [],
};
