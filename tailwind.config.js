/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Roboto', 'Noto Sans', 'system-ui', 'sans-serif'],
      },
      colors: {
        one: {
          canvas: {
            DEFAULT: '#F6F6F6',
            dark: '#010101',
          },
          surface: {
            DEFAULT: '#FFFFFF',
            dark: '#2C2C2C',
          },
          fg: {
            DEFAULT: '#252525',
            dark: '#FCFCFC',
          },
          muted: {
            DEFAULT: '#8C8C8C',
            dark: '#9A9A9A',
          },
          blue: {
            DEFAULT: '#0381FE',
            deep: '#0072DE',
            bright: '#3E91FF',
          },
          danger: {
            DEFAULT: '#E73F3F',
            dark: '#FF6B6B',
          },
          divider: {
            DEFAULT: '#EDEDED',
            dark: '#3D3D3D',
          },
          success: {
            DEFAULT: '#1BA954',
          },
        },
      },
    },
  },
  plugins: [],
};
