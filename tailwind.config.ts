import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        purple: {
          DEFAULT: "#7B3FBF",
          dark:    "#5A2D8F",
          light:   "#9B6FD0",
          pale:    "#F3EAFB",
        },
        gold: {
          DEFAULT: "#F5C518",
          dark:    "#D4A80F",
        },
        surface: "#FFFFFF",
        bg:      "#FAFAFA",
        border:  "#EEE8F4",
        muted:   "#8888AA",
      },
      fontFamily: {
        sans: ["Nunito", "sans-serif"],
      },
      borderRadius: {
        xl2: "20px",
        xl3: "24px",
      },
      boxShadow: {
        card: "0 2px 20px rgba(123, 63, 191, 0.08)",
        purple: "0 4px 15px rgba(123, 63, 191, 0.35)",
        "purple-lg": "0 8px 32px rgba(123, 63, 191, 0.45)",
      },
    },
  },
  plugins: [],
};
export default config;
