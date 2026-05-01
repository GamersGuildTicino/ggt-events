import type { SelectEnumProps } from "~/ui/select-enum";
import SelectEnum from "~/ui/select-enum";
import type { Locale } from "./locale";
import { locales } from "./locale";
import useI18n from "./use-i18n";

//------------------------------------------------------------------------------
// Locale Select
//------------------------------------------------------------------------------

type LocaleSelectProps = Omit<
  SelectEnumProps<Locale>,
  "defaultValue" | "multiple" | "onValueChange" | "options" | "value"
>;

export default function LocaleSelect(props: LocaleSelectProps) {
  const { locale, setLocale, t } = useI18n();
  const localeOptions = locales.map((locale) => ({
    label: t(`locale.${locale}`),
    value: locale,
  }));

  return (
    <SelectEnum<Locale>
      aria-label={t("common.locale")}
      onValueChange={setLocale}
      options={localeOptions}
      size="sm"
      value={locale}
      w="6em"
      {...props}
    />
  );
}
