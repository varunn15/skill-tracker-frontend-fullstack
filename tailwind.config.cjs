/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],

  darkMode: 'class',

  theme: {
    extend: {
      colors: {
        // 🎯 Brand Colors
        primary: "#6366f1",     // Indigo
        primaryHover: "#4f46e5",

        secondary: "#22c55e",   // Green
        danger: "#ef4444",      // Red

        // 🌙 Dark Mode System
        darkBg: "#0f172a",      // Main background (slate-900)
        darkCard: "#1e293b",    // Card background (slate-800)
        darkBorder: "#334155",  // Borders (slate-700)

        // 📝 Text Colors
        textMain: "#e2e8f0",    // Main text (slate-200)
        textMuted: "#94a3b8",   // Muted text (slate-400)

        // ☀️ Light Mode Helpers (optional but useful)
        lightBg: "#f8fafc",
        lightCard: "#ffffff",
      },

      borderRadius: {
        xl: "12px",
        "2xl": "16px",
      },

      boxShadow: {
        card: "0 4px 20px rgba(0,0,0,0.25)",
        soft: "0 2px 10px rgba(0,0,0,0.1)",
      },

      transitionProperty: {
        height: "height",
        spacing: "margin, padding",
      },
    },
  },

  plugins: [],
};