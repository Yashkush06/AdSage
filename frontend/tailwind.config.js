/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "primary": "#FF3B3B",
        "on-primary": "#FFFFFF",
        "primary-container": "#4d0006",
        "on-primary-container": "#ffdad6",
        
        "secondary": "#E5E7EB",
        "on-secondary": "#11131A",
        "secondary-container": "#374151",
        "on-secondary-container": "#F3F4F6",

        "surface": "#11131A",
        "on-surface": "#FFFFFF",
        "surface-variant": "#1f2937",
        "on-surface-variant": "#E5E7EB",

        "background": "#11131A",
        "on-background": "#FFFFFF",

        "outline": "#374151",
        "outline-variant": "#4B5563",

        "surface-container-lowest": "#0b0c11",
        "surface-container-low": "#15171e",
        "surface-container": "#1a1c24",
        "surface-container-high": "#21232c",
        "surface-container-highest": "#282a34",

        "inverse-surface": "#E5E7EB",
        "inverse-on-surface": "#11131A",
        "inverse-primary": "#FF3B3B",

        "error": "#ffb4ab",
        "on-error": "#690005",
        "error-container": "#93000a",
        "on-error-container": "#ffdad6",

        "loading": "#FF3B3B",
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
