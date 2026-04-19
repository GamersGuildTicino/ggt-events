"use client";

import { ChakraProvider, ClientOnly, defaultSystem } from "@chakra-ui/react";
import { ThemeProvider as NextThemesThemeProvider } from "next-themes";
import type { ReactNode } from "react";
import useTheme from "./use-theme";

//------------------------------------------------------------------------------
// Theme Provider
//------------------------------------------------------------------------------

export type ThemeProviderProps = {
  children: ReactNode;
};

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme] = useTheme();

  return (
    <ChakraProvider value={defaultSystem}>
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
