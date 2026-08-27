import { Heading, Text, VStack } from "@chakra-ui/react";
import useI18n from "~/i18n/use-i18n";

//------------------------------------------------------------------------------
// Home Upcoming Events Error
//------------------------------------------------------------------------------

export default function HomeUpcomingEventsError() {
  const { t } = useI18n();

  return (
    <VStack align="center" gap={2} maxW="38rem" textAlign="center" w="full">
      <Heading color="red.fg" size="lg">
        {t("page.home.events.error.heading")}
      </Heading>
      <Text fontSize={{ base: "md", md: "lg" }}>
        {t("page.home.events.error.description")}
      </Text>
    </VStack>
  );
}
