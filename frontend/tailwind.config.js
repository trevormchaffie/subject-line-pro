/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#3490dc",
        secondary: "#ffed4a",
        danger: "#e3342f",
        success: "#38c172",
        warning: "#f6993f",
      },
    },
  },
  plugins: [],
};
