/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],

  darkMode: "class",

  theme: {
    extend: {
      colors: {
        // ✅ SHADCN SYSTEM (REQUIRED)
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",

        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",

        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },

        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },

        destructive: {
          DEFAULT: "hsl(var(--destructive))",
        },

        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },

        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },

        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },

        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },

        // 🎯 YOUR CUSTOM COLORS (kept)
        primaryHover: "#4f46e5",

        darkBg: "#0f172a",
        darkCard: "#1e293b",
        darkBorder: "#334155",

        textMain: "#e2e8f0",
        textMuted: "#94a3b8",

        lightBg: "#f8fafc",
        lightCard: "#ffffff",
      },

      borderRadius: {
        xl: "12px",
        "2xl": "16px",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
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