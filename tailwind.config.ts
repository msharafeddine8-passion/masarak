import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1B3A6B",
        accent:  "#E8A020",
        success: "#1A7A4A",
        danger:  "#C0392B",
        light:   "#EEF3FA",
        "light-gold": "#FEF6E4",
        "light-green": "#E9F7EF",
        "text-main": "#1A1A2E",
        "text-sub":  "#4A4A6A",
      },
      fontFamily: {
        tajawal: ["Tajawal", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
