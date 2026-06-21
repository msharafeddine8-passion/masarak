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
        // ═══ MASARAK — DARK TEAL / TURQUOISE GLASSMORPHISM ════════════════════
        // Primary turquoise (interactive + headings). Scale runs dark→bright so
        // light-fill utilities (e.g. bg-primary-50) become dark surfaces.
        primary:        "#16C7D9",
        "primary-dark": "#0FA9BD",
        "primary-light":"#5BE0EE",
        "primary-50":   "#0C2A31",
        "primary-100":  "#103039",
        "primary-200":  "#16414C",
        "primary-300":  "#1D5460",
        "primary-400":  "#2C8A98",
        "primary-500":  "#16C7D9",
        "primary-600":  "#15A7B7",
        "primary-700":  "#118C9A",
        "primary-800":  "#0C6B77",
        "primary-900":  "#094E57",

        // Mint — bright accent + dark mint surfaces
        mint:         "#7FE0CE",
        "mint-light": "#16414C",
        "mint-pale":  "#0E2A31",

        // Accent — warm amber/orange (pops on dark teal)
        accent:        "#F9A03F",
        "accent-light":"#3A2A14",
        "accent-dark": "#FBBF6B",
        "accent-50":   "#2A1E0E",
        "accent-500":  "#F9A03F",
        "accent-600":  "#E08A2E",

        // Secondary playful accents
        coral:    "#FB7185",
        amber:    "#FBBF24",
        violet:   "#A78BFA",

        // Semantic (base = bright text/icon, -light = dark fill)
        success: "#34D399",
        "success-light": "#0E2A22",
        warning: "#FBBF24",
        "warning-light": "#2C2410",
        danger:  "#FB7185",
        "danger-light":  "#2E1417",
        info:    "#16C7D9",
        "info-light": "#0C2A31",

        // Surface
        bg:           "#0F2A30",
        "bg-soft":    "#143138",
        "bg-mint":    "#143138",
        surface:      "#173942",
        "surface-2":  "#143036",
        border:       "#2C505A",
        "border-soft":"#234851",

        // Text
        ink:           "#EAF4F2",
        "ink-muted":   "#A6BEC3",
        "ink-subtle":  "#7E989E",
        "ink-inverse": "#04222A",

        // Legacy aliases
        light:         "#102A31",
        "light-gold":  "#3A2A14",
        "light-green": "#0E2A22",
        "text-main":   "#EAF4F2",
        "text-sub":    "#9DB6BB",
      },

      fontFamily: {
        tajawal: ["Tajawal", "system-ui", "sans-serif"],
        sans:    ["Tajawal", "system-ui", "-apple-system", "sans-serif"],
        display: ["Tajawal", "system-ui", "sans-serif"],
      },

      // Shadow scale tuned for dark UI
      boxShadow: {
        soft:   "0 1px 3px 0 rgba(0,0,0,.30), 0 1px 2px 0 rgba(0,0,0,.20)",
        card:   "0 8px 24px 0 rgba(0,0,0,.35), 0 2px 6px 0 rgba(0,0,0,.25)",
        floaty: "0 18px 40px -12px rgba(0,0,0,.55)",
        glow:   "0 0 0 4px rgba(22,199,217,.25)",
        "glow-accent": "0 0 0 4px rgba(249,160,63,.2)",
        inset:  "inset 0 1px 2px 0 rgba(0,0,0,.3)",
        none:   "none",
      },

      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },

      // Gradient utilities (dark)
      backgroundImage: {
        "gradient-hero":     "linear-gradient(135deg, #1B4C56 0%, #143138 55%, #0F2A30 100%)",
        "gradient-mint":     "linear-gradient(135deg, #16414C 0%, #0B1F24 100%)",
        "gradient-mint-deep":"linear-gradient(135deg, #16C7D9 0%, #7FE0CE 100%)",
        "gradient-warm":     "linear-gradient(135deg, #F9A03F 0%, #FB7185 100%)",
        "gradient-cool":     "linear-gradient(135deg, #143B43 0%, #16C7D9 100%)",
        "gradient-fresh":    "linear-gradient(135deg, #16C7D9 0%, #7FE0CE 100%)",
        "gradient-sunset":   "linear-gradient(135deg, #F9A03F 0%, #FB7185 50%, #A78BFA 100%)",
        "gradient-soft":     "linear-gradient(135deg, #102A31 0%, #15303A 100%)",
        "gradient-page":     "linear-gradient(180deg, #0F2A30 0%, #0C242A 100%)",
        "pattern-dots":      "radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)",
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
