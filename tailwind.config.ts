// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class", // Enable class-based dark mode
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Your custom palette from the project brief
        "primary-deep-blue": "#0B2B4A",
        "accent-cyan-blue": "#2EC4B6",
        "secondary-slate": "#1E3A5F",
        "muted-gray": "#9FB3C8",
        "surface-light": "#F6F9FB",
        "text-dark": "#0B1828",
        "dark-card": "#0F2E46",
      },
    },
  },
  plugins: [],
};
export default config;