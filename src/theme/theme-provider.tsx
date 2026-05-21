import { ChakraProvider, ClientOnly } from "@chakra-ui/react";
import { ThemeProvider as NextThemesThemeProvider } from "next-themes";
import { type ReactNode } from "react";
import { system } from "./system";
import { useTheme } from "./theme";

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
