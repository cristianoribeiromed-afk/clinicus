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
        background: "#030707",
        sidebar: "#0A0D0D",
        foreground: "#FFFFFF",
        card: {
          DEFAULT: "#0F1115",
          foreground: "#FFFFFF",
        },
        popover: {
          DEFAULT: "#0F1115",
          foreground: "#FFFFFF",
        },
        primary: {
          DEFAULT: "#1DB954",
          light: "#7DFFC1",
          foreground: "#04140A",
        },
        secondary: {
          DEFAULT: "#D8A53B",
          foreground: "#1A1200",
        },
        muted: {
          DEFAULT: "#0F1115",
          foreground: "#A5A5A5",
        },
        accent: {
          DEFAULT: "#1DB954",
          foreground: "#04140A",
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
        border: "rgba(255,255,255,0.08)",
        "border-strong": "rgba(255,255,255,0.14)",
        "surface-2": "#171A20",
        "surface-hover": "#171A20",
        input: "#0F1115",
        ring: "#1DB954",
        chart: {
          "1": "#1DB954",
          "2": "#3B82F6",
          "3": "#D8A53B",
          "4": "#EF4444",
          "5": "#8B5CF6",
        },
      },
      borderRadius: {
        lg: "1.5rem",
        md: "1.125rem",
        sm: "0.75rem",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        heading: ["Geist", "Inter", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Cormorant Garamond", "Georgia", "serif"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "gradient-dark":
          "linear-gradient(135deg, #0A0A0F 0%, #1a1a2e 50%, #0A0A0F 100%)",
        "gradient-hero":
          "linear-gradient(135deg, rgba(29,185,84,0.14) 0%, rgba(216,165,59,0.05) 50%, transparent 100%)",
      },
      boxShadow: {
        glow: "0 0 20px rgba(29,185,84,0.3)",
        "glow-lg": "0 0 60px rgba(29,185,84,0.18)",
        "glow-secondary": "0 0 60px rgba(216,165,59,0.16)",
        card: "0 30px 80px rgba(0,0,0,0.35)",
        "card-hover": "0 40px 100px rgba(0,0,0,0.45)",
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
