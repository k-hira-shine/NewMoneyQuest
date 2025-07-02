/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4F46E5', // インジゴ
        secondary: '#10B981', // エメラルド
        accent: '#F59E0B', // アンバー
        dark: '#1F2937', // ダークグレー
        light: '#F3F4F6', // ライトグレー
      },
      fontFamily: {
        rpg: ['"Press Start 2P"', 'cursive', 'sans-serif'],
      },
    },
  },
  plugins: [],
  darkMode: 'class',
}
