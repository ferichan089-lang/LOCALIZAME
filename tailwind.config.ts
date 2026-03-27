import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        purple: {
          DEFAULT: "#7B2FB5",
          dark:    "#5A1D8E",
          light:   "#9B5FD0",
          pale:    "#F3E8FB",
        },
        gold: {
          DEFAULT: "#FFC107",
          dark:    "#E6A200",
          deep:    "#A66F00",
          amber:   "#FFA000",
        },
        surface: "#FFFFFF",
        bg:      "#FFF8F0",
        border:  "#EEE4F8",
        muted:   "#9999AA",
        text:    "#1A1025",
      },
      fontFamily: {
        sans: ["Nunito", "sans-serif"],
      },
      borderRadius: {
        xl2: "20px",
        xl3: "24px",
      },
      boxShadow: {
        card:       "0 2px 16px rgba(123,47,181,0.10)",
        purple:     "0 4px 15px rgba(90,29,142,0.35)",
        "purple-lg":"0 8px 32px rgba(107,31,160,0.50)",
        gold:       "0 4px 16px rgba(255,193,7,0.25)",
      },
    },
  },
  plugins: [],
};
export default config;
