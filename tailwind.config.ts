import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#071014",
        sidebar: "#09151A",
        foreground: "#F2F7F8",
        card: {
          DEFAULT: "#0D1B21",
          foreground: "#F2F7F8",
        },
        popover: {
          DEFAULT: "#0D1B21",
          foreground: "#F2F7F8",
        },
        primary: {
          DEFAULT: "#18B6A4",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#3B82F6",
          foreground: "#FFFFFF",
        },
        muted: {
          DEFAULT: "#0D1B21",
          foreground: "#91A7AE",
        },
        accent: {
          DEFAULT: "#18B6A4",
          foreground: "#FFFFFF",
        },
        destructive: {
          DEFAULT: "#EF4444",
          foreground: "#FFFFFF",
        },
        success: {
          DEFAULT: "#22C55E",
          foreground: "#FFFFFF",
        },
        warning: {
          DEFAULT: "#F59E0B",
          foreground: "#FFFFFF",
        },
        purple: "#8B5CF6",
        border: "#1A3038",
        "surface-hover": "#12252C",
        input: "#0D1B21",
        ring: "#18B6A4",
        chart: {
          "1": "#3B82F6",
          "2": "#10B981",
          "3": "#F59E0B",
          "4": "#EF4444",
          "5": "#8B5CF6",
        },
      },
      borderRadius: {
        lg: "0.75rem",
        md: "0.5rem",
        sm: "0.25rem",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        heading: ["Geist", "Inter", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "gradient-dark":
          "linear-gradient(135deg, #0A0A0F 0%, #1a1a2e 50%, #0A0A0F 100%)",
        "gradient-hero":
          "linear-gradient(135deg, rgba(24,182,164,0.12) 0%, rgba(59,130,246,0.06) 50%, transparent 100%)",
      },
      boxShadow: {
        glow: "0 0 20px rgba(24,182,164,0.3)",
        "glow-lg": "0 0 30px rgba(24,182,164,0.4)",
        "glow-secondary": "0 0 20px rgba(59,130,246,0.3)",
      },
      animation: {
        "fade-in-up": "fade-in-up 0.5s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        "slide-in-right": "slide-in-right 0.3s ease-out",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        float: "float 6s ease-in-out infinite",
      },
      keyframes: {
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-in-right": {
          "0%": { opacity: "0", transform: "translateX(-20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(59,130,246,0.3)" },
          "50%": { boxShadow: "0 0 40px rgba(59,130,246,0.5)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
