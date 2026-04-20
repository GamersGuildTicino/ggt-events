import { useContext } from "react";
import I18nContext from "./i18n-context";

//------------------------------------------------------------------------------
// Use I18n
//------------------------------------------------------------------------------

export default function useI18n() {
  const i18n = useContext(I18nContext);
  if (i18n) return i18n;
  throw new Error("useI18n must be used within an I18nProvider.");
}
