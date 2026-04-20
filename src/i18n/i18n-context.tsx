import { createContext } from "react";
import type { Locale } from "./locale";

//------------------------------------------------------------------------------
// I18n Context Value
//------------------------------------------------------------------------------

export type I18nContextValue = {
  locale: Locale;
  setLocale: React.Dispatch<React.SetStateAction<Locale>>;
  t: (key: string) => string;
  ti: (key: string, ...args: string[]) => string;
  tp: (key: string, count: number) => string;
  tpi: (key: string, count: number, ...args: string[]) => string;
};

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const I18nContext = createContext<I18nContextValue | null>(null);

export default I18nContext;
