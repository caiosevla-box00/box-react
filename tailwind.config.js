/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        verde:   '#AAFF00',
        'verde-dim': '#5abf00',
        preto:   '#080808',
        escuro:  '#111111',
        card:    '#111111',
        borda:   '#222222',
        dim:     '#555555',
        texto:   '#f0f0f0',
        alerta:  '#f0a500',
        erro:    '#ff6b6b',
        azul:    '#74b9ff',
      },
      fontFamily: {
        bebas:  ['"Bebas Neue"', 'sans-serif'],
        barlow: ['"Barlow Condensed"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
