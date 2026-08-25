import { Heading, List, Text, VStack } from "@chakra-ui/react";
import useI18n from "~/i18n/use-i18n";

//------------------------------------------------------------------------------
// Home Events Info Panel
//------------------------------------------------------------------------------

export default function HomeEventsInfoPanel() {
  const { t } = useI18n();

  return (
    <VStack align="stretch" bg="transparent" flex={1} gap={5} w="full">
      <VStack align="stretch" gap={5} maxW="64rem" mx="auto" w="full">
        <VStack align="flex-start" gap={4}>
          <Heading
            fontFamily="'Shrikhand', Georgia, serif"
            fontWeight="light"
            size="4xl"
          >
            {t("page.home.events.info_eyebrow")}
          </Heading>

          <Text fontSize={{ base: "md", md: "lg" }} whiteSpace="pre-line">
            {t("page.home.events.info_intro")}
          </Text>
        </VStack>

        <List.Root
          fontSize={{ base: "md", md: "lg" }}
          gap={2}
          lineHeight={1.25}
          variant="plain"
        >
          <List.Item>• {t("page.home.events.info_step_1")}</List.Item>
          <List.Item>• {t("page.home.events.info_step_2")}</List.Item>
          <List.Item>• {t("page.home.events.info_step_3")}</List.Item>
        </List.Root>

        <Text fontSize={{ base: "md", md: "lg" }}>
          {t("page.home.events.info_footer")}
        </Text>
      </VStack>
    </VStack>
  );
}
