import { useCallback, useMemo } from "react";
import type { PropsWithChildren } from "react";
import I18nContext from "./i18n-context";
import type { Locale } from "./locale";
import useLocale from "./locale";
import enGB from "./messages/en-gb";
import itCH from "./messages/it-ch";

//------------------------------------------------------------------------------
// Messages
//------------------------------------------------------------------------------

const messages = { "en-GB": enGB, "it-CH": itCH } as const;

//------------------------------------------------------------------------------
// Resolve Message
//------------------------------------------------------------------------------

function resolveMessage(locale: Locale, key: string, fallback: string) {
  const localeMessages = messages[locale] as Record<string, string>;
  return localeMessages[key] ?? fallback;
}

//------------------------------------------------------------------------------
// Interpolate
//------------------------------------------------------------------------------

function interpolate(template: string, ...args: string[]) {
  return args.reduce(
    (result, value, index) => result.replaceAll(`{${index}}`, value),
    template,
  );
}

//------------------------------------------------------------------------------
// I18n Provider
//------------------------------------------------------------------------------

export default function I18nProvider({ children }: PropsWithChildren) {
  const [locale, setLocale] = useLocale();

  const t = useCallback(
    (key: string) => {
      return resolveMessage(locale, key, key);
    },
    [locale],
  );

  const tp = useCallback(
    (key: string, count: number) => {
      return resolveMessage(locale, `${key}/${count}`, t(`${key}/*`));
    },
    [locale, t],
  );

  const ti = useCallback(
    (key: string, ...args: string[]) => {
      return interpolate(t(key), ...args);
    },
    [t],
  );

  const tpi = useCallback(
    (key: string, count: number, ...args: string[]) => {
      return interpolate(tp(key, count), ...args);
    },
    [tp],
  );

  const value = useMemo(
    () => ({ locale, setLocale, t, ti, tp, tpi }),
    [locale, setLocale, t, ti, tp, tpi],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
