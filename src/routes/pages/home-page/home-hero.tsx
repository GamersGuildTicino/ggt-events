import { Box, HStack, Heading, Image, Span, VStack } from "@chakra-ui/react";
import type { PropsWithChildren } from "react";
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
            <Box
              bgColor="rgba(255, 255, 255, 0.75)"
              borderColor="black"
              borderWidth={2.5}
              px={8}
              py={3}
            >
              <Heading
                WebkitTextStrokeColor="black"
                WebkitTextStrokeWidth={2.5}
                color="ggt.fg.primary"
                fontFamily="'Shrikhand', Georgia, serif"
                fontSize={{ base: "6xl", md: "7xl" }}
                fontWeight="light"
                lineHeight={1}
              >
                <Capital>G</Capital>amers <Capital>G</Capital>uild{" "}
                <Capital>T</Capital>icino
              </Heading>
            </Box>
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
  return <Span color="ggt.fg.secondary">{children}</Span>;
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
