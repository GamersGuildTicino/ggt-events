import {
  Badge,
  Box,
  Card,
  HStack,
  Heading,
  Text,
  VStack,
} from "@chakra-ui/react";
import LocaleSelect from "~/i18n/locale-select";
import useI18n from "~/i18n/use-i18n";

//------------------------------------------------------------------------------
// Home Hero
//------------------------------------------------------------------------------

export default function HomeHero() {
  const { t } = useI18n();

  return (
    <Box
      bg="linear-gradient(135deg, #332113 0%, #6f2d1e 48%, #d08632 100%)"
      borderRadius="3xl"
      color="white"
      overflow="hidden"
      position="relative"
      px={{ base: 6, md: 10 }}
      py={{ base: 8, md: 12 }}
    >
      <Box
        bg="whiteAlpha.200"
        borderRadius="full"
        filter="blur(8px)"
        h="14rem"
        position="absolute"
        right="-4rem"
        top="-5rem"
        w="14rem"
      />
      <Box
        bg="blackAlpha.200"
        borderRadius="full"
        bottom="-6rem"
        h="18rem"
        left="35%"
        position="absolute"
        w="18rem"
      />

      <VStack align="stretch" gap={8} position="relative" zIndex={1}>
        <HStack justify="space-between" w="full">
          <Badge
            bg="whiteAlpha.300"
            borderColor="whiteAlpha.400"
            borderWidth="1px"
            color="white"
            px={3}
            py={1}
            rounded="full"
          >
            {t("page.home.hero.eyebrow")}
          </Badge>

          <LocaleSelect css={localeSelectCss} />
        </HStack>

        <HStack align="flex-start" gap={8} justify="space-between">
          <VStack align="flex-start" flex="1" gap={3}>
            <Heading
              fontSize={{ base: "4xl", md: "6xl" }}
              letterSpacing="-0.06em"
              lineHeight="0.95"
              maxW="9em"
            >
              {t("page.home.heading")}
            </Heading>
            <Text
              color="whiteAlpha.900"
              fontSize={{ base: "lg", md: "xl" }}
              maxW="34em"
            >
              {t("page.home.hero.description")}
            </Text>
          </VStack>

          <Card.Root
            bg="blackAlpha.300"
            borderColor="whiteAlpha.300"
            color="white"
            display={{ base: "none", xl: "block" }}
            flexShrink={0}
            maxW="22rem"
            transform="rotate(2deg)"
          >
            <Card.Body gap={5}>
              <Text color="orange.100" fontSize="sm" fontWeight="semibold">
                {t("page.home.hero.card.label")}
              </Text>
              <Heading size="2xl">{t("page.home.hero.card.heading")}</Heading>
              <Text color="whiteAlpha.800">
                {t("page.home.hero.card.description")}
              </Text>
            </Card.Body>
          </Card.Root>
        </HStack>
      </VStack>
    </Box>
  );
}

//------------------------------------------------------------------------------
// Locale Select CSS
//------------------------------------------------------------------------------

const localeSelectCss = {
  "& [data-part='indicator']": {
    color: "white",
  },
  "& [data-part='trigger']": {
    backdropFilter: "blur(8px)",
    background: "rgba(255, 255, 255, 0.08)",
    borderColor: "rgba(255, 255, 255, 0.5)",
    color: "white",
  },
};
