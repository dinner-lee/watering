import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // 차분한 식물 콘셉트 팔레트
        leaf: {
          50: "#f1f8f0",
          100: "#dcefd9",
          200: "#bce0b6",
          300: "#90c987",
          400: "#5fa854",
          500: "#3e8a37",
          600: "#2f6e2b",
          700: "#275825",
          800: "#224620",
          900: "#1d3a1c",
        },
        soil: "#6b4f3a",
        cream: "#f7f5ec",
      },
      fontFamily: {
        pixel: ["RoundedFixedsys", "DungGeunMo", "monospace"],
      },
      boxShadow: {
        // 도트 느낌의 하드 섀도
        pixel: "4px 4px 0 0 rgba(29, 58, 28, 0.9)",
        "pixel-sm": "2px 2px 0 0 rgba(29, 58, 28, 0.9)",
      },
    },
  },
  plugins: [],
};

export default config;
