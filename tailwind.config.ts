import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: "#ef4444",
        dark: "#0a0a0f",
        surface: "#12121a",
        border: "#1e1e2e",
        muted: "#6b6b8a",
        accent: "#836ef9",
        success: "#4ade80",
      },
      animation: {
        "ping-slow": "ping 2s ease-in-out infinite",
        "fade-in": "fadeIn 0.3s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
      },
      keyframes: {
        fadeIn: { from: { opacity: "0" }, to: { opacity: "1" } },
        slideUp: { from: { transform: "translateY(20px)", opacity: "0" }, to: { transform: "translateY(0)", opacity: "1" } },
      },
    },
  },
  plugins: [],
};
export default config;
