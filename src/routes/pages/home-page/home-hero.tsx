import {
  Box,
  HStack,
  Heading,
  Image,
  Span,
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
      backgroundPosition="center"
      backgroundSize="cover"
      bgImage={`
        linear-gradient(180deg, rgba(255, 255, 255, 0.72), rgba(255, 255, 255, 0.54)),
        url("/images/banner.jpg")
      `}
      color="fg"
      minH={{ base: "23rem", md: "30rem" }}
      overflow="hidden"
      position="relative"
      w="full"
    >
      <Box
        bgImage="linear-gradient(180deg, transparent 0%, rgba(173, 220, 249, 0.45) 100%)"
        inset={0}
        position="absolute"
      />

      <VStack
        align="stretch"
        h="full"
        justify="space-between"
        minH={{ base: "23rem", md: "30rem" }}
        p={{ base: 5, md: 8 }}
        position="relative"
        zIndex={1}
      >
        <HStack justify="flex-end" w="full">
          <LocaleSelect css={localeSelectCss} />
        </HStack>

        <VStack align="center" gap={3} textAlign="center">
          <Image
            alt="Gamers Guild Ticino"
            boxSize={{ base: "4.5rem", md: "7.5rem" }}
            mb={2}
            objectFit="contain"
            src="/favicon.ico"
          />

          <VStack align="center" gap={2}>
            <Heading
              fontFamily="'Shrikhand', Georgia, serif"
              fontSize={{ base: "4xl", md: "7xl" }}
              fontWeight="light"
              lineHeight={1}
              textShadow="
                -2px -2px 0 white,
                0 -2px 0 white,
                2px -2px 0 white,
                -2px 0 0 white,
                2px 0 0 white,
                -2px 2px 0 white,
                0 2px 0 white,
                2px 2px 0 white,
                -1px -1px 0 white,
                1px -1px 0 white,
                -1px 1px 0 white,
                1px 1px 0 white,
                0 0 0.45rem white
              "
            >
              <Span color="ggt.fg.secondary">G</Span>amers{" "}
              <Span color="ggt.fg.secondary">G</Span>uild{" "}
              <Span color="ggt.fg.secondary">T</Span>icino
            </Heading>

            <Text
              fontSize={{ base: "lg", md: "xl" }}
              maxW="34em"
              textShadow="
                -2px -2px 0 white,
                0 -2px 0 white,
                2px -2px 0 white,
                -2px 0 0 white,
                2px 0 0 white,
                -2px 2px 0 white,
                0 2px 0 white,
                2px 2px 0 white,
                -1px -1px 0 white,
                1px -1px 0 white,
                -1px 1px 0 white,
                1px 1px 0 white,
                0 0 0.35rem white
              "
            >
              {t("page.home.hero.description")}
            </Text>
          </VStack>
        </VStack>

        <Box />
      </VStack>
    </Box>
  );
}

//------------------------------------------------------------------------------
// Locale Select CSS
//------------------------------------------------------------------------------

const localeSelectCss = {
  "& [data-part='trigger']": {
    backgroundColor: "rgba(255, 255, 255, 0.84)",
    borderColor: "black",
    color: "black",
  },
};
