export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#080A0D",
        "bg-secondary": "#101419",
        card: "#171D23",
        "card-elevated": "#202830",
        accent: "#A3FF55",
        "accent-secondary": "#74D936",
        text: "#F5F7F8",
        "text-secondary": "#8B949E",
        danger: "#FF5555",
        success: "#55DB91",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};