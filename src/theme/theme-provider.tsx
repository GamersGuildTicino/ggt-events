import {
  ChakraProvider,
  ClientOnly,
  createSystem,
  defaultConfig,
} from "@chakra-ui/react";
import { ThemeProvider as NextThemesThemeProvider } from "next-themes";
import { type ReactNode } from "react";
import { useTheme } from "./theme";

//------------------------------------------------------------------------------
// System
//------------------------------------------------------------------------------

const system = createSystem(defaultConfig, {
  theme: {
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
        publicAccentBorder: { value: "#458db9" },
        publicFooterBg: { value: "#0e4263" },
        publicPageBg: { value: "#addcf9" },
        publicSurfaceBg: { value: "#fafafa" },
        publicSurfaceBorder: { value: "#65bff7" },
        publicSurfaceMutedBg: { value: "#fafafa" },
      },
    },
  },
});

//------------------------------------------------------------------------------
// Theme Provider
//------------------------------------------------------------------------------

export type ThemeProviderProps = {
  children: ReactNode;
};

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme] = useTheme();

  return (
    <ChakraProvider value={system}>
      <NextThemesThemeProvider
        attribute="class"
        disableTransitionOnChange
        forcedTheme={theme}
      >
        <ClientOnly>{children}</ClientOnly>
      </NextThemesThemeProvider>
    </ChakraProvider>
  );
}
