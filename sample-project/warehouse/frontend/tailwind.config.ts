import { MaisonNeue } from '@/src/utils/customFont';
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  daisyui: {
    themes: ["black"],
  },
  theme: {
    screens: {
      'xs': '376px',
      'sm': '640px',
      // => @media (min-width: 640px) { ... }

      'md': '768px',
      // => @media (min-width: 768px) { ... }

      'lg': '1024px',
      // => @media (min-width: 1024px) { ... }

      'xl': '1280px',
      // => @media (min-width: 1280px) { ... }

      '2xl': '1536px',
      // => @media (min-width: 1536px) { ... }
    },
    fontFamily: {
      maisonNeue: ["var(--font-maison-neue)"]
    },
    extend: {
      colors: {
        primary: {
          semiwhite: '#D0D0D0',
          white: "#FFFFFF",
          light: "#A7A7A8",
          lightdark: "#313234",
          extradark: "#27282A",
          dark: "#1E1F20",
          search: "#232325",
          searchBG: "#141516",
          sklight: "#D9D9D966",
          sklightdark: "#48494C",
          
        },
        custom: {
          blue: "#0052FF",
          cyan: "#00B2FF",
          green: "#5CCF60",
          darkgreen: "#36B53A",
          orange: "#FFA800",
          yellow: "#FFE81D",
          red: "#FF5858",
          pink: "#FF6ADE"
        }
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "gradient-most-hunted-card": "conic-gradient(from 180.13deg at 50.11% 49.75%, rgba(255, 168, 80, 0) 0deg, #FFA800 360deg), linear-gradient(0deg, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2))"
      },
      animation: {
        rotate: "rotate 2s linear infinite",
      },
      keyframes: {
        rotate: {
          "0%": { transform: "rotate(0deg) scale(10)" },
          "100%": { transform: "rotate(-360deg) scale(10)" },
        },
      },
    },
  },
  plugins: [
    require('tailwind-animatecss')
  ],
};
export default config;
