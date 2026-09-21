/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx,js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        
        surface: "hsl(var(--surface))",
        "surface-container-lowest": "hsl(var(--surface-container-lowest))",
        "surface-container-low": "hsl(var(--surface-container-low))",
        "surface-container": "hsl(var(--surface-container))",
        "surface-container-high": "hsl(var(--surface-container-high))",
        "surface-container-highest": "hsl(var(--surface-container-highest))",
        
        "on-surface": "hsl(var(--on-surface))",
        "on-surface-variant": "hsl(var(--on-surface-variant))",
        outline: "hsl(var(--outline))",
        "outline-variant": "hsl(var(--outline-variant))",
        
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--on-primary))",
        },
        "primary-container": "hsl(var(--primary-container))",
        "on-primary-container": "hsl(var(--on-primary-container))",
        "primary-fixed": "hsl(var(--primary-fixed))",
        "primary-fixed-dim": "hsl(var(--primary-fixed-dim))",
        
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--on-secondary))",
        },
        "secondary-container": "hsl(var(--secondary-container))",
        "on-secondary-container": "hsl(var(--on-secondary-container))",
        "secondary-fixed": "hsl(var(--secondary-fixed))",
        
        tertiary: {
          DEFAULT: "hsl(var(--tertiary))",
          foreground: "hsl(var(--on-tertiary))",
        },
        "tertiary-container": "hsl(var(--tertiary-container))",
        "on-tertiary-container": "hsl(var(--on-tertiary-container))",
        "tertiary-fixed": "hsl(var(--tertiary-fixed))",
        
        error: "hsl(var(--error))",
        "on-error": "hsl(var(--on-error))",
        "error-container": "hsl(var(--error-container))",
        "on-error-container": "hsl(var(--on-error-container))",
        
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
      },
      borderRadius: {
        "DEFAULT": "0.125rem",
        "lg": "var(--radius)",
        "md": "calc(var(--radius) - 2px)",
        "sm": "calc(var(--radius) - 4px)",
        "xl": "1rem",
        "2xl": "1.5rem",
        "full": "9999px"
      },
      spacing: {
        "space-xs": "0.25rem",
        "space-sm": "0.5rem",
        "space-md": "0.75rem",
        "space-lg": "1rem",
        "space-xl": "1.5rem",
        "space-2xl": "2.5rem",
        "gutter": "1rem",
        "gutter-lg": "2rem",
        "margin-mobile": "1rem",
        "margin": "2rem",
      },
      fontFamily: {
        "citation-code": ["JetBrains Mono", "monospace"],
        "body-sm": ["Inter", "sans-serif"],
        "body-md": ["Inter", "sans-serif"],
        "body-lg": ["Inter", "sans-serif"],
        "label-sm": ["Inter", "sans-serif"],
        "label-md": ["Inter", "sans-serif"],
        "headline-md": ["Outfit", "sans-serif"],
        "headline-lg": ["Outfit", "sans-serif"],
        "headline-xl": ["Outfit", "sans-serif"],
        "headline-xl-mobile": ["Outfit", "sans-serif"],
      },
      fontSize: {
        "citation-code": ["12px", { "lineHeight": "16px", "letterSpacing": "-0.01em", "fontWeight": "500" }],
        "body-sm": ["13px", { "lineHeight": "20px", "fontWeight": "400" }],
        "body-md": ["14px", { "lineHeight": "22px", "fontWeight": "400" }],
        "body-lg": ["16px", { "lineHeight": "26px", "fontWeight": "400" }],
        "label-sm": ["11px", { "lineHeight": "14px", "letterSpacing": "0.03em", "fontWeight": "500" }],
        "label-md": ["12px", { "lineHeight": "16px", "letterSpacing": "0.02em", "fontWeight": "600" }],
        "headline-md": ["18px", { "lineHeight": "24px", "letterSpacing": "-0.01em", "fontWeight": "600" }],
        "headline-lg": ["24px", { "lineHeight": "30px", "letterSpacing": "-0.02em", "fontWeight": "600" }],
        "headline-xl": ["36px", { "lineHeight": "44px", "letterSpacing": "-0.03em", "fontWeight": "700" }],
        "headline-xl-mobile": ["28px", { "lineHeight": "36px", "letterSpacing": "-0.02em", "fontWeight": "700" }]
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "pulse-slow": {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: .5 },
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-slow": "pulse-slow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
