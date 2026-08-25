import { Box, HStack, Heading, Image, Span, VStack } from "@chakra-ui/react";
import LocaleSelect from "~/i18n/locale-select";

//------------------------------------------------------------------------------
// Home Hero
//------------------------------------------------------------------------------

export default function HomeHero() {
  return (
    <Box
      backgroundPosition="center"
      backgroundSize="cover"
      bgImage='url("/images/banner.jpg")'
      color="fg"
      minH={{ base: "23rem", md: "30rem" }}
      overflow="hidden"
      position="relative"
      w="full"
    >
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
    backgroundColor: "white",
    borderColor: "black",
    color: "black",
  },
};
