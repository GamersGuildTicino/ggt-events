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
        linear-gradient(180deg, rgba(173, 220, 249, 0.86), rgba(173, 220, 249, 0.62)),
        radial-gradient(circle at 18% 24%, rgba(255, 255, 255, 0.9), transparent 18%),
        radial-gradient(circle at 78% 18%, rgba(230, 139, 182, 0.42), transparent 22%),
        radial-gradient(circle at 72% 76%, rgba(101, 191, 247, 0.72), transparent 28%),
        linear-gradient(135deg, #addcf9 0%, #f7fbff 48%, #c9ecff 100%)
      `}
      color="fg"
      minH={{ base: "23rem", md: "30rem" }}
      overflow="hidden"
      position="relative"
      w="full"
    >
      <Box
        bgImage="linear-gradient(135deg, rgba(255,255,255,0.26) 0 10%, transparent 10% 20%, rgba(255,255,255,0.2) 20% 30%, transparent 30% 100%)"
        inset={0}
        opacity={0.38}
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
            >
              <Span color="ggt.fg.secondary">G</Span>amers{" "}
              <Span color="ggt.fg.secondary">G</Span>uild{" "}
              <Span color="ggt.fg.secondary">T</Span>icino
            </Heading>

            <Text fontSize={{ base: "lg", md: "xl" }} maxW="34em">
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
