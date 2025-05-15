import {heroui} from '@heroui/theme';
import type {Config} from "tailwindcss";

export default {
  darkMode: ["class"],
  plugins: [heroui()],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@heroui/theme/dist/components/(accordion|divider).js"
  ],
} satisfies Config;
