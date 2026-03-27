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
        navy: {
          DEFAULT: "#003366",
          deep: "#001a33",
          muted: "#1a3a5a",
        },
        skybrand: "#4a90e2",
        gold: "#FFCC00",
        cream: "#f4f7fb",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "diagonal-split":
          "linear-gradient(105deg, #f4f7fb 0%, #f4f7fb 49.5%, #e8eef6 49.5%, #e8eef6 100%)",
      },
      boxShadow: {
        soft: "0 18px 50px -12px rgba(0, 51, 102, 0.18)",
      },
    },
  },
  plugins: [],
};

export default config;
