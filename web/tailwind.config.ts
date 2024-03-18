const config = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: { 500: "#bb9af7" },
        secondary: { 700: "#24283b" },
        background: { 900: "#1a1b26" },
      },

      screens: {
        "3xl": "2560px",
      },
    },
  },
  plugins: [],
};

export default config;
