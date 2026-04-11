/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],

  // Dark mode via class on <html> — controlled by ThemeContext
  darkMode: "class",

  theme: {
    extend: {
      // ── Brand fonts ──────────────────────────────────────────────────────
      // Primary UI: Noto Sans Myanmar (supports both EN and Myanmar script)
      // Display/Logo: Torus (headings, logo mark)
      fontFamily: {
        sans:            ["Noto Sans Myanmar", "sans-serif"],   // DEFAULT body
        display:         ["Torus", "sans-serif"],               // headings, logo
        notosansmyanmar: ["Noto Sans Myanmar", "sans-serif"],   // explicit alias
        roboto:          ["Roboto", "sans-serif"],
        poppins:         ["Poppins", "sans-serif"],
        lato:            ["Lato", "sans-serif"],
        torus:           ["Torus", "sans-serif"],
      },

      // ── Fluid font sizes (clamp-based responsive typography) ─────────────
      fontSize: {
        "2xs":  ["0.65rem",  { lineHeight: "1rem" }],
        xs:     ["0.75rem",  { lineHeight: "1.125rem" }],
        sm:     ["0.875rem", { lineHeight: "1.375rem" }],
        base:   ["1rem",     { lineHeight: "1.6rem" }],
        lg:     ["1.125rem", { lineHeight: "1.75rem" }],
        xl:     ["1.25rem",  { lineHeight: "1.875rem" }],
        "2xl":  ["1.5rem",   { lineHeight: "2rem" }],
        "3xl":  ["1.875rem", { lineHeight: "2.375rem" }],
        "4xl":  ["2.25rem",  { lineHeight: "2.75rem" }],
        "5xl":  ["3rem",     { lineHeight: "1.15" }],
        "6xl":  ["3.75rem",  { lineHeight: "1.1" }],
        // Fluid: these scale with viewport using CSS clamp
        "fluid-sm":   ["clamp(0.8rem, 1.5vw, 0.875rem)",  { lineHeight: "1.5" }],
        "fluid-base": ["clamp(0.9rem, 1.8vw, 1rem)",      { lineHeight: "1.6" }],
        "fluid-lg":   ["clamp(1rem, 2.2vw, 1.25rem)",     { lineHeight: "1.65" }],
        "fluid-xl":   ["clamp(1.1rem, 2.5vw, 1.5rem)",    { lineHeight: "1.5" }],
        "fluid-2xl":  ["clamp(1.3rem, 3.5vw, 2.25rem)",   { lineHeight: "1.3" }],
        "fluid-3xl":  ["clamp(1.6rem, 5vw, 3rem)",        { lineHeight: "1.2" }],
        "fluid-hero": ["clamp(2rem, 7vw, 4rem)",           { lineHeight: "1.1" }],
      },

      // ── Design tokens — light & dark ─────────────────────────────────────
      colors: {
        brand: {
          50:  "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          800: "#166534",
          900: "#14532d",
          950: "#052e16",
        },
      },

      // ── Transitions ──────────────────────────────────────────────────────
      transitionDuration: {
        DEFAULT: "200ms",
      },
    },
  },
  plugins: [],
};