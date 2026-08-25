import { Text } from "@chakra-ui/react";
import useI18n from "~/i18n/use-i18n";

//------------------------------------------------------------------------------
// Home Upcoming Events Empty
//------------------------------------------------------------------------------

type HomeUpcomingEventsEmptyProps = {
  customBody?: string;
  hasCustomTitle: boolean;
};

export default function HomeUpcomingEventsEmpty({
  customBody,
  hasCustomTitle,
}: HomeUpcomingEventsEmptyProps) {
  const { t } = useI18n();

  if (!customBody && !hasCustomTitle)
    return (
      <Text fontSize={{ base: "lg", md: "xl" }} fontWeight="semibold">
        {t("page.home.events.empty")}
      </Text>
    );

  if (!customBody) return null;

  return (
    <Text
      fontSize={{ base: "lg", md: "xl" }}
      lineHeight={1.4}
      maxW="42rem"
      textAlign="center"
      whiteSpace="pre-line"
    >
      {customBody}
    </Text>
  );
}
