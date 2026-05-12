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
        // ═══ MASARAK BRAND (extracted from logo) ═══════════════════════════
        // Dark teal — main brand (logo text color)
        primary:        "#0F4A52",
        "primary-dark": "#093A41",
        "primary-light":"#1A6F7C",
        "primary-50":   "#E8F7F1",
        "primary-100":  "#C8EDE3",
        "primary-200":  "#95D5C5",   // ← logo background mint
        "primary-300":  "#6CC4B0",
        "primary-400":  "#3FAA94",
        "primary-500":  "#1A8C7A",
        "primary-600":  "#13716A",
        "primary-700":  "#0F4A52",   // ← logo text dark teal
        "primary-800":  "#093A41",
        "primary-900":  "#062A30",

        // Mint — calm, soft surfaces
        mint:         "#95D5C5",
        "mint-light": "#C8EDE3",
        "mint-pale":  "#E8F7F1",

        // Accent — warm coral/orange (complements teal)
        accent:        "#F97316",   // Orange 500
        "accent-light":"#FFEDD5",   // Orange 100
        "accent-dark": "#C2410C",
        "accent-50":   "#FFF7ED",
        "accent-500":  "#F97316",
        "accent-600":  "#EA580C",

        // Secondary playful accents
        coral:    "#FB7185",   // Rose 400
        amber:    "#F59E0B",   // Amber 500
        violet:   "#A78BFA",   // Violet 400

        // Semantic
        success: "#10B981",
        "success-light": "#D1FAE5",
        warning: "#F59E0B",
        "warning-light": "#FEF3C7",
        danger:  "#EF4444",
        "danger-light":  "#FEE2E2",
        info:    "#0EA5E9",
        "info-light": "#E0F2FE",

        // Surface
        bg:           "#FAFAF9",
        "bg-soft":    "#F3F4F6",
        "bg-mint":    "#F0FAF6",   // Very subtle mint tint for sections
        surface:      "#FFFFFF",
        "surface-2":  "#F9FAFB",
        border:       "#E5E7EB",
        "border-soft":"#F3F4F6",

        // Text
        ink:           "#0F1B1F",  // Dark teal-black
        "ink-muted":   "#6B7280",
        "ink-subtle":  "#9CA3AF",
        "ink-inverse": "#FFFFFF",

        // Legacy aliases (so existing components don't break)
        light:         "#F8FAFC",
        "light-gold":  "#FFEDD5",
        "light-green": "#D1FAE5",
        "text-main":   "#0F1B1F",
        "text-sub":    "#6B7280",
      },

      fontFamily: {
        tajawal: ["Tajawal", "system-ui", "sans-serif"],
        sans:    ["Tajawal", "system-ui", "-apple-system", "sans-serif"],
        display: ["Tajawal", "system-ui", "sans-serif"],
      },

      // Modern shadow scale
      boxShadow: {
        soft:   "0 1px 3px 0 rgba(15,74,82,.08), 0 1px 2px 0 rgba(15,74,82,.04)",
        card:   "0 4px 14px 0 rgba(15,74,82,.08), 0 2px 4px 0 rgba(15,74,82,.04)",
        floaty: "0 10px 30px -10px rgba(15,74,82,.4)",
        glow:   "0 0 0 4px rgba(149,213,197,.4)",
        "glow-accent": "0 0 0 4px rgba(249,115,22,.2)",
        inset:  "inset 0 1px 2px 0 rgba(15,74,82,.05)",
        none:   "none",
      },

      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },

      // Gradient utilities
      backgroundImage: {
        "gradient-hero":     "linear-gradient(135deg, #0F4A52 0%, #1A8C7A 50%, #95D5C5 100%)",
        "gradient-mint":     "linear-gradient(135deg, #95D5C5 0%, #C8EDE3 100%)",
        "gradient-mint-deep":"linear-gradient(135deg, #1A8C7A 0%, #0F4A52 100%)",
        "gradient-warm":     "linear-gradient(135deg, #F97316 0%, #FB7185 100%)",
        "gradient-cool":     "linear-gradient(135deg, #0F4A52 0%, #0EA5E9 100%)",
        "gradient-fresh":    "linear-gradient(135deg, #10B981 0%, #95D5C5 100%)",
        "gradient-sunset":   "linear-gradient(135deg, #F97316 0%, #FB7185 50%, #A78BFA 100%)",
        "gradient-soft":     "linear-gradient(135deg, #E8F7F1 0%, #FFEDD5 100%)",
        "gradient-page":     "linear-gradient(180deg, #FAFAF9 0%, #F0FAF6 100%)",
        "pattern-dots":      "radial-gradient(circle, rgba(15,74,82,0.08) 1px, transparent 1px)",
      },

      // Animations
      keyframes: {
        "fade-in":      { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        "fade-up":      {
          "0%":   { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        "scale-in":     {
          "0%":   { opacity: "0", transform: "scale(.95)" },
          "100%": { opacity: "1", transform: "scale(1)" }
        },
        "slide-in-right": {
          "0%":   { opacity: "0", transform: "translateX(20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" }
        },
        "float":        {
          "0%,100%": { transform: "translateY(0px)" },
          "50%":     { transform: "translateY(-8px)" }
        },
        "shimmer":      {
          "0%":   { backgroundPosition: "-1000px 0" },
          "100%": { backgroundPosition: "1000px 0" }
        },
        "pulse-soft":   {
          "0%,100%": { opacity: "1" },
          "50%":     { opacity: ".7" }
        },
        "bounce-soft":  {
          "0%,100%": { transform: "translateY(0)" },
          "50%":     { transform: "translateY(-4px)" }
        },
        "wiggle":       {
          "0%,100%": { transform: "rotate(-2deg)" },
          "50%":     { transform: "rotate(2deg)" }
        },
      },
      animation: {
        "fade-in":        "fade-in .4s ease-out",
        "fade-up":        "fade-up .5s cubic-bezier(.16,1,.3,1)",
        "scale-in":       "scale-in .3s cubic-bezier(.16,1,.3,1)",
        "slide-in-right": "slide-in-right .4s cubic-bezier(.16,1,.3,1)",
        "float":          "float 4s ease-in-out infinite",
        "shimmer":        "shimmer 2s linear infinite",
        "pulse-soft":     "pulse-soft 2s ease-in-out infinite",
        "bounce-soft":    "bounce-soft 1.5s ease-in-out infinite",
        "wiggle":         "wiggle 1s ease-in-out infinite",
      },

      // Larger spacing scale
      spacing: {
        "18": "4.5rem",
        "88": "22rem",
        "112": "28rem",
        "128": "32rem",
      },

      // Better max-widths
      maxWidth: {
        "8xl": "88rem",
        "9xl": "96rem",
      },

      letterSpacing: {
        tight: "-0.015em",
        tighter: "-0.025em",
      },
    },
  },
  plugins: [],
};
export default config;
