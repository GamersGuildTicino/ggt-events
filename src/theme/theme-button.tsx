import { MoonIcon, SunIcon } from "lucide-react";
import IconButton from "~/ui/icon-button";
import useTheme from "./use-theme";

//------------------------------------------------------------------------------
// Theme Button
//------------------------------------------------------------------------------

export default function ThemeButton() {
  const [theme, _setColorMode, toggleTheme] = useTheme();
  return (
    <IconButton
      Icon={theme === "dark" ? MoonIcon : SunIcon}
      aria-label="Toggle color mode"
      onClick={toggleTheme}
      size="sm"
      variant="ghost"
    />
  );
}
