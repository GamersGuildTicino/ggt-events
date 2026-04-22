import { MoonIcon, SunIcon } from "lucide-react";
import { useCallback } from "react";
import useI18n from "~/i18n/use-i18n";
import IconButton from "~/ui/icon-button";
import { useTheme } from "./theme";

//------------------------------------------------------------------------------
// Theme Button
//------------------------------------------------------------------------------

export default function ThemeButton() {
  const { t } = useI18n();
  const [theme, setTheme] = useTheme();

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }, [setTheme]);

  return (
    <IconButton
      Icon={theme === "dark" ? MoonIcon : SunIcon}
      aria-label={t("common.toggle_theme")}
      onClick={toggleTheme}
      size="sm"
      variant="ghost"
    />
  );
}
