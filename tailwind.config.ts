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
        // ═══ MASARAK — REFINED LIGHT (deep teal + turquoise + mint) ═══════════
        // Deep teal — main brand: headings + primary buttons (white text on it).
        primary:        "#0F4A52",
        "primary-dark": "#0A363C",
        "primary-light":"#16808F",
        "primary-50":   "#E6F4F1",
        "primary-100":  "#C6E8E1",
        "primary-200":  "#95D5C5",
        "primary-300":  "#5FC3AE",
        "primary-400":  "#2BA791",
        "primary-500":  "#0F4A52",
        "primary-600":  "#0C3F46",
        "primary-700":  "#0A363C",
        "primary-800":  "#072A2F",
        "primary-900":  "#051E22",

        // Mint — soft surfaces / accents
        mint:         "#95D5C5",
        "mint-light": "#C8EDE3",
        "mint-pale":  "#EAF7F2",

        // Accent — turquoise (highlights, links, secondary CTAs)
        accent:        "#0E8FA6",
        "accent-light":"#D7F1F5",
        "accent-dark": "#0A6F82",
        "accent-50":   "#ECFAFC",
        "accent-500":  "#0E8FA6",
        "accent-600":  "#0A6F82",

        // Secondary playful accents
        coral:    "#FB7185",
        amber:    "#F59E0B",
        violet:   "#A78BFA",

        // Semantic
        success: "#10B981",
        "success-light": "#D6F5EA",
        warning: "#F59E0B",
        "warning-light": "#FEF3C7",
        danger:  "#EF4444",
        "danger-light":  "#FEE2E2",
        info:    "#0E8FA6",
        "info-light": "#ECFAFC",

        // Surface (light)
        bg:           "#F6FAF9",
        "bg-soft":    "#EEF4F3",
        "bg-mint":    "#EAF7F2",
        surface:      "#FFFFFF",
        "surface-2":  "#F7FAFA",
        border:       "#E2EAE9",
        "border-soft":"#EFF4F3",
        line:         "#E2EAE9",

        // Text (dark on light)
        ink:           "#0F2A30",
        "ink-muted":   "#566B70",
        // Darkened from #8AA0A4 (~2.6:1, failed WCAG AA) to ~4.9:1 on white so
        // captions/placeholders meet the 4.5:1 minimum (audit A3).
        "ink-subtle":  "#5E7479",
        "ink-inverse": "#FFFFFF",

        // Legacy aliases
        light:         "#F6FAF9",
        "light-gold":  "#FEF3C7",
        "light-green": "#D6F5EA",
        "text-main":   "#0F2A30",
        "text-sub":    "#566B70",
      },

      fontFamily: {
        tajawal: ["var(--font-tajawal)", "Tajawal", "system-ui", "sans-serif"],
        sans:    ["var(--font-tajawal)", "Tajawal", "system-ui", "-apple-system", "sans-serif"],
        display: ["var(--font-tajawal)", "Tajawal", "system-ui", "sans-serif"],
      },

      // Soft teal-tinted shadows for the light UI
      boxShadow: {
        soft:   "0 1px 3px 0 rgba(15,74,82,.08), 0 1px 2px 0 rgba(15,74,82,.04)",
        card:   "0 4px 16px 0 rgba(15,74,82,.08), 0 2px 4px 0 rgba(15,74,82,.04)",
        floaty: "0 12px 32px -10px rgba(15,74,82,.28)",
        glow:   "0 0 0 4px rgba(149,213,197,.4)",
        "glow-accent": "0 0 0 4px rgba(14,143,166,.18)",
        inset:  "inset 0 1px 2px 0 rgba(15,74,82,.05)",
        none:   "none",
      },

      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },

      // Gradients
      backgroundImage: {
        "gradient-hero":     "linear-gradient(135deg, #0F4A52 0%, #16808F 55%, #2BA791 100%)",
        "gradient-mint":     "linear-gradient(135deg, #95D5C5 0%, #C8EDE3 100%)",
        "gradient-mint-deep":"linear-gradient(135deg, #0F4A52 0%, #16808F 100%)",
        "gradient-warm":     "linear-gradient(135deg, #16C7D9 0%, #95D5C5 100%)",
        "gradient-cool":     "linear-gradient(135deg, #0F4A52 0%, #16C7D9 100%)",
        "gradient-fresh":    "linear-gradient(135deg, #10B981 0%, #95D5C5 100%)",
        "gradient-sunset":   "linear-gradient(135deg, #16C7D9 0%, #95D5C5 50%, #A78BFA 100%)",
        "gradient-soft":     "linear-gradient(135deg, #E6F4F1 0%, #EAF7F2 100%)",
        "gradient-page":     "linear-gradient(180deg, #F6FAF9 0%, #EAF7F2 100%)",
        "pattern-dots":      "radial-gradient(circle, rgba(15,74,82,0.08) 1px, transparent 1px)",
      },

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

      spacing: {
        "18": "4.5rem",
        "88": "22rem",
        "112": "28rem",
        "128": "32rem",
      },

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
