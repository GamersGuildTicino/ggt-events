import { createSystem, defaultConfig } from "@chakra-ui/react";

//------------------------------------------------------------------------------
// System
//------------------------------------------------------------------------------

export const system = createSystem(defaultConfig, {
  theme: {
    breakpoints: {
      xs: "15rem",
    },
    recipes: {
      heading: {
        variants: {
          size: {
            "2xl": { lineHeight: 1.2 },
            "3xl": { lineHeight: 1.2 },
            "lg": { lineHeight: 1.2 },
            "md": { lineHeight: 1.2 },
          },
        },
      },
      text: {
        base: {
          lineHeight: 1.2,
        },
      },
    },
    tokens: {
      colors: {
        ggt: {
          border: {
            primary: { value: "#458db9" },
          },
          fg: {
            primary: { value: "#65bff7" },
            secondary: { value: "#e68bb6" },
          },
          footer: {
            bg: { value: "#0e4263" },
          },
          page: {
            bg: { value: "#addcf9" },
          },
          surface: {
            bg: { value: "#fafafa" },
            border: { value: "#65bff7" },
          },
        },
      },
    },
  },
});
