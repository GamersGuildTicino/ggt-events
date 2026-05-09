import { HStack, Heading, Text, VStack } from "@chakra-ui/react";
import LocaleSelect from "~/i18n/locale-select";
import useI18n from "~/i18n/use-i18n";

//------------------------------------------------------------------------------
// Home Hero
//------------------------------------------------------------------------------

export default function HomeHero() {
  const { t } = useI18n();

  return (
    <VStack
      align="stretch"
      borderBottomColor="publicSurfaceBorder"
      borderBottomWidth="1px"
      gap={6}
      pb={6}
    >
      <HStack justify="flex-end" w="full">
        <LocaleSelect css={localeSelectCss} />
      </HStack>

      <VStack align="center" gap={2} mt={{ base: 0, md: 4 }} textAlign="center">
        <Heading
          fontFamily="'Shrikhand', Georgia, serif"
          fontSize={{ base: "4xl", md: "7xl" }}
          fontWeight="light"
          lineHeight={1}
        >
          {t("page.home.heading")}
        </Heading>
        <Text color="fg.muted" fontSize={{ base: "lg", md: "xl" }} maxW="34em">
          {t("page.home.hero.description")}
        </Text>
      </VStack>
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
