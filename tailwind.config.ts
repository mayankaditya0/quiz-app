export default {

  content: ["./app/**/*.{ts,tsx}"],

  theme: {

    extend: {

      keyframes: {

        slideFromTop: {

          "0%": { transform: "translateY(-100%)", opacity: "0" },

          "100%": { transform: "translateY(0)", opacity: "1" }

        },

        slideFromBottom: {

          "0%": { transform: "translateY(100%)", opacity: "0" },

          "100%": { transform: "translateY(0)", opacity: "1" }

        },

        slideFromLeft: {

          "0%": { transform: "translateX(-100%)", opacity: "0" },

          "100%": { transform: "translateX(0)", opacity: "1" }

        },

        slideFromRight: {

          "0%": { transform: "translateX(100%)", opacity: "0" },

          "100%": { transform: "translateX(0)", opacity: "1" }

        },

        bounceIn: {

          "0%": { transform: "scale(0.5)" },

          "60%": { transform: "scale(1.2)" },

          "100%": { transform: "scale(1)" }

        }

      },

      animation: {

        top: "slideFromTop 0.6s ease",

        bottom: "slideFromBottom 0.6s ease",

        left: "slideFromLeft 0.6s ease",

        right: "slideFromRight 0.6s ease",

        bounceIn: "bounceIn 0.4s ease"

      }

    }

  }

};
 