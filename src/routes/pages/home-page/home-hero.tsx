import {
  Box,
  HStack,
  Heading,
  Image,
  Span,
  Text,
  VStack,
} from "@chakra-ui/react";
import type { PropsWithChildren } from "react";
import LocaleSelect from "~/i18n/locale-select";
import useI18n from "~/i18n/use-i18n";

//------------------------------------------------------------------------------
// Home Hero
//------------------------------------------------------------------------------

export default function HomeHero() {
  const { t } = useI18n();

  return (
    <Box
      bg="ggt.page.bg"
      color="fg"
      minH={{ base: "23rem", md: "30rem" }}
      overflow="hidden"
      position="relative"
      w="full"
    >
      <VStack
        align="stretch"
        h="full"
        minH={{ base: "23rem", md: "30rem" }}
        p={{ base: 5, md: 8 }}
        position="relative"
        zIndex={1}
      >
        <HStack justify="flex-end" w="full">
          <LocaleSelect css={localeSelectCss} />
        </HStack>

        <VStack
          align="center"
          flex={1}
          gap={3}
          justify="center"
          textAlign="center"
        >
          <Image
            alt="Gamers Guild Ticino"
            boxSize={{ base: "4.5rem", md: "7.5rem" }}
            mb={2}
            objectFit="contain"
            src="/favicon.ico"
          />

          <VStack align="center" gap={2}>
            <Heading
              color="black"
              fontFamily="'Shrikhand', Georgia, serif"
              fontSize={{ base: "6xl", md: "7xl" }}
              fontWeight="light"
              lineHeight={1}
            >
              <Capital>G</Capital>amers <Capital>G</Capital>uild{" "}
              <Capital>T</Capital>icino
            </Heading>

            <Text fontSize={{ base: "lg", md: "xl" }} maxW="42rem">
              {t("page.home.hero.description")}
            </Text>
          </VStack>
        </VStack>
      </VStack>
    </Box>
  );
}

//------------------------------------------------------------------------------
// Capital
//------------------------------------------------------------------------------

function Capital({ children }: PropsWithChildren) {
  return (
    <Span
      WebkitTextStrokeColor="black"
      WebkitTextStrokeWidth={3}
      color="ggt.fg.secondary"
    >
      {children}
    </Span>
  );
}

//------------------------------------------------------------------------------
// Locale Select CSS
//------------------------------------------------------------------------------

const localeSelectCss = {
  "& [data-part='trigger']": {
    backgroundColor: "white",
    borderColor: "black",
    color: "black",
  },
};
