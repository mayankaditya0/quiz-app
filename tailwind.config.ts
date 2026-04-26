
import type { Config } from "tailwindcss";

const config: Config = {

  content: ["./app/**/*.{ts,tsx}"],

  theme: {

    extend: {

      keyframes: {

        slideUp: {

          "0%": { transform: "translateY(100%)", opacity: "0" },

          "100%": { transform: "translateY(0)", opacity: "1" }

        },

        jump: {

          "0%": { transform: "scale(0.5)" },

          "70%": { transform: "scale(1.2)" },

          "100%": { transform: "scale(1)" }

        }

      },

      animation: {

        slideUp: "slideUp 0.5s ease",

        jump: "jump 0.4s ease"

      }

    }

  },

  plugins: []

};

export default config;
 