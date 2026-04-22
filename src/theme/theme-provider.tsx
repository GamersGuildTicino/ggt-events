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
      text: {
        base: {
          lineHeight: 1.2,
        },
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
