import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        "sans": ["var(--font-inter)", "system-ui", "sans-serif"],
        "mono": ["var(--font-exo2)", "monospace"] // Usando Exo 2 como mono/tech visual
      },
      borderRadius: {
        "none": "0",
        "sm": "0.25rem",
        "DEFAULT": "0.5rem",
        "md": "0.75rem",
        "lg": "1rem",
        "xl": "1.5rem",
        "2xl": "2rem",
        "full": "9999px"
      },
      boxShadow: {
        "sm": "0 1px 2px 0 rgba(0, 0, 0, 0.4)",
        "DEFAULT": "0 4px 6px -1px rgba(0, 0, 0, 0.6), 0 2px 4px -1px rgba(0, 0, 0, 0.4)",
        "md": "0 10px 15px -3px rgba(0, 0, 0, 0.7), 0 4px 6px -2px rgba(0, 0, 0, 0.5)",
        "lg": "0 20px 25px -5px rgba(0, 0, 0, 0.8), 0 10px 10px -5px rgba(0, 0, 0, 0.6)",
        "glow": "0 0 20px rgba(139, 92, 246, 0.6)",
        "glowSuccess": "0 0 20px rgba(16, 185, 129, 0.6)",
        "inner": "inset 0 2px 4px 0 rgba(0, 0, 0, 0.5)"
      },
      colors: {
        "background": {
          "primary": "#0a0a0a",
          "secondary": "#171717",
          "tertiary": "#262626",
          "card": "#1f1f1f",
          "hover": "#2a2a2a"
        },
        "text": {
          "primary": "#fafafa",
          "secondary": "#d4d4d8",
          "muted": "#a1a1aa",
          "disabled": "#52525b"
        },
        "brand": {
          "primary": "#8b5cf6",
          "primaryHover": "#a78bfa",
          "secondary": "#06b6d4",
          "secondaryHover": "#22d3ee"
        },
        "accent": {
          "success": "#10b981",
          "warning": "#f59e0b",
          "danger": "#ef4444",
          "info": "#3b82f6"
        },
        "retro": {
          "orange": "#fb923c",
          "green": "#4ade80",
          "purple": "#c084fc"
        }
      },
      spacing: {
        "xs": "0.5rem",
        "sm": "0.75rem",
        "md": "1rem",
        "lg": "1.5rem",
        "xl": "2rem",
        "2xl": "3rem",
        "3xl": "4rem"
      }
    },
  },
  plugins: [],
} satisfies Config;

export default config;