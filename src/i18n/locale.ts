import z from "zod";
import { createLocalStore } from "../store/local-store";

//------------------------------------------------------------------------------
// Locale
//------------------------------------------------------------------------------

export const localeSchema = z.enum(["en-GB", "it-CH"]);

export const locales = localeSchema.options;

export type Locale = z.infer<typeof localeSchema>;

//------------------------------------------------------------------------------
// Detect Locale
//------------------------------------------------------------------------------

function detectLocale(): Locale {
  if (typeof navigator === "undefined") return "it-CH";
  const parsed = localeSchema.safeParse(navigator.language);
  return parsed.success ? parsed.data : "it-CH";
}

//------------------------------------------------------------------------------
// Locale Store
//------------------------------------------------------------------------------

const localeStore = createLocalStore(
  "i18n.locale",
  detectLocale(),
  localeSchema.parse,
);

//------------------------------------------------------------------------------
// Use Locale
//------------------------------------------------------------------------------

export default function useLocale(): [
  Locale,
  React.Dispatch<React.SetStateAction<Locale>>,
] {
  return localeStore.use();
}
