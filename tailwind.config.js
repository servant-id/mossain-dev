import typography from "@tailwindcss/typography";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef4ff",
          100: "#dbe7ff",
          200: "#b8cfff",
          300: "#8aacff",
          400: "#5a82ff",
          500: "#2f57f5",
          600: "#0040ce",
          700: "#0033a8",
          800: "#062a7d",
          900: "#0a2461",
        },
        ink: {
          900: "#0f1b2d",
          800: "#16253d",
          700: "#1f3350",
        },
        mint: {
          50: "#eafbf3",
          100: "#cff5e2",
          400: "#3fd18f",
          500: "#22b573",
          600: "#189a61",
        },
        // Matches the Mossa logo's orange accent
        accent: {
          50: "#fff7e6",
          100: "#ffecc2",
          400: "#ffb020",
          500: "#f7941d",
          600: "#dd7d0a",
        },
      },
      fontFamily: {
        sans: ["'Plus Jakarta Sans'", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["'Fraunces'", "ui-serif", "Georgia", "serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(15,27,45,.04), 0 8px 24px rgba(15,27,45,.06)",
        floaty: "0 20px 45px -15px rgba(10,36,97,.35)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [typography],
};
