import { Button, Card, HStack, Heading, Text, VStack } from "@chakra-ui/react";
import { ChevronLeft } from "lucide-react";
import { Link as RouterLink } from "react-router";
import usePageTitle from "~/hooks/use-page-title";
import LocaleSelect from "~/i18n/locale-select";
import useI18n from "~/i18n/use-i18n";
import RichText from "~/ui/rich-text";

//------------------------------------------------------------------------------
// Terms And Conditions Page
//------------------------------------------------------------------------------

export default function DataAndTermsPage() {
  const { t } = useI18n();

  usePageTitle(t("page.data_and_terms.heading"));

  return (
    <VStack align="stretch" gap={6} w="full">
      <HStack justify="space-between" w="full">
        <Button asChild size="sm" variant="ghost">
          <RouterLink to="/">
            <ChevronLeft />
            {t("page.event.back_to_home")}
          </RouterLink>
        </Button>
        <LocaleSelect css={localeSelectCss} />
      </HStack>

      <VStack align="stretch" gap={2}>
        <Heading size="3xl">{t("page.data_and_terms.heading")}</Heading>
        <Text color="fg.muted">{t("page.data_and_terms.last_updated")}</Text>
      </VStack>

      <Card.Root bg="publicSurfaceBg" borderColor="publicSurfaceBorder">
        <Card.Body gap={2} lineHeight={1.2}>
          {t("page.data_and_terms.content")
            .split("\n")
            .map((paragraph) => (
              <RichText text={paragraph} />
            ))}
        </Card.Body>
      </Card.Root>
    </VStack>
  );
}

//------------------------------------------------------------------------------
// Locale Select CSS
//------------------------------------------------------------------------------

const localeSelectCss = {
  "& [data-part='trigger']": {
    borderColor: "black",
  },
};
