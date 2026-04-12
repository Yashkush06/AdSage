/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "primary": "#FF0032",
        "primary-container": "#1A1A1A",
        "secondary": "#00F0FF",
        "secondary-container": "#0B1E26",
        "tertiary": "#00F0FF",
        "tertiary-container": "#E60000",
        "surface": "#050505",
        "surface-variant": "#121214",
        "on-surface": "#FFFFFF",
        "on-surface-variant": "#FF0032",
        "outline": "#FF0032",
        "outline-variant": "#00F0FF",
        "error": "#FF0032",
        "error-container": "#1A0000",
        "background": "#050505",
        "on-background": "#FF0032",
        "surface-container-low": "#0A0A0C",
        "surface-container": "#121214",
        "surface-container-high": "#1A1A1C",
        "surface-container-highest": "#1E1E20",
        "surface-container-lowest": "#000000",
      },
      borderRadius: {
        "DEFAULT": "0.125rem",
        "lg": "0.25rem",
        "xl": "0.5rem",
        "full": "0.75rem",
      },
      fontFamily: {
        headline: ["Noto Serif", "serif"],
        body: ["Inter", "sans-serif"],
        label: ["Inter", "sans-serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
      },
      keyframes: {
        fadeIn: { from: { opacity: "0" }, to: { opacity: "1" } },
        slideUp: {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
