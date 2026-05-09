import { Flex, Link, Text, VStack } from "@chakra-ui/react";
import useI18n from "~/i18n/use-i18n";

//------------------------------------------------------------------------------
// Public Footer
//------------------------------------------------------------------------------

export default function PublicFooter() {
  const { t } = useI18n();
  const currentYear = new Date().getFullYear();

  return (
    <Flex
      align={{ base: "flex-start", md: "flex-start" }}
      color="fg.inverted"
      direction={{ base: "column", md: "row" }}
      gap={{ base: 4, md: 12 }}
      justify="space-between"
      py={8}
      w="full"
    >
      <VStack align="flex-start" gap={1}>
        <Text fontWeight="semibold">Gamers Guild Ticino</Text>
        <Text color="whiteAlpha.700" fontSize="sm">
          © {currentYear} {t("layout.public_footer.copyright")}
        </Text>
      </VStack>

      <VStack
        align={{ base: "flex-start", md: "flex-end" }}
        gap={0}
        textAlign={{ base: "left", md: "right" }}
      >
        <Link
          _hover={{ color: "whiteAlpha.800" }}
          color="fg.inverted"
          href="mailto:info@gamersguildticino.ch"
        >
          {t("layout.public_footer.email")}
        </Link>
        <Link
          _hover={{ color: "whiteAlpha.800" }}
          color="fg.inverted"
          href="https://www.instagram.com/gg_gamersguild/"
          rel="noreferrer"
          target="_blank"
        >
          {t("layout.public_footer.instagram")}
        </Link>
      </VStack>
    </Flex>
  );
}
