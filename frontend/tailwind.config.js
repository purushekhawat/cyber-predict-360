/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        cyber: {
          dark: "#0b0f19",
          card: "#111827",
          border: "#1f2937",
          primary: "#3b82f6",
          accent: "#06b6d4",
          success: "#10b981",
          warning: "#f59e0b",
          alert: "#ef4444",
        },
      },
    },
  },
  plugins: [],
};
