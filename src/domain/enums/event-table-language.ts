import { useMemo } from "react";
import { z } from "zod";
import useI18n from "~/i18n/use-i18n";

//------------------------------------------------------------------------------
// Event Table Language
//------------------------------------------------------------------------------

export const eventTableLanguageSchema = z.enum([
  "unspecified",
  "italian",
  "english",
  "french",
  "german",
  "spanish",
  "portuguese",
]);

export const eventTableLanguages = eventTableLanguageSchema.options;

export type EventTableLanguage = z.infer<typeof eventTableLanguageSchema>;

//------------------------------------------------------------------------------
// Use Event Table Language Options
//------------------------------------------------------------------------------

export function useEventTableLanguageOptions() {
  const { t } = useI18n();

  return useMemo(() => {
    return eventTableLanguages.map((language) => ({
      label: t(`enum.event_table_language.${language}`),
      value: language,
    }));
  }, [t]);
}
