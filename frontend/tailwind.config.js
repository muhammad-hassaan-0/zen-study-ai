/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      boxShadow: {
        soft: "0 25px 50px -24px rgba(15, 23, 42, 0.18)",
      },
      borderRadius: {
        xl: "18px",
      },
    },
  },
  plugins: [],
};
