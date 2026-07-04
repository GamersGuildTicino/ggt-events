import { Heading, Text, VStack } from "@chakra-ui/react";
import { useState } from "react";
import {
  type HomeMessage,
  fetchHomeNoUpcomingEventsMessage,
} from "~/domain/home-messages";
import { useAsyncEffect } from "~/hooks/use-async-effect";
import useI18n from "~/i18n/use-i18n";
import { type AsyncState, initial, loading } from "~/utils/async-state";

//------------------------------------------------------------------------------
// Home Upcoming Events Empty
//------------------------------------------------------------------------------

export default function HomeUpcomingEventsEmpty() {
  const { locale, t } = useI18n();
  const [homeMessageState, setHomeMessageState] =
    useState<AsyncState<HomeMessage | null>>(initial());

  useAsyncEffect(async (isActive) => {
    setHomeMessageState(loading());
    const homeMessage = await fetchHomeNoUpcomingEventsMessage();
    if (!isActive()) return;
    setHomeMessageState(homeMessage);
  }, []);

  const homeMessage = homeMessageState.isSuccess ? homeMessageState.data : null;
  const title = homeMessage?.title[locale].trim();
  const body = homeMessage?.body[locale].trim();

  if (!title && !body) {
    return <Text color="fg.muted">{t("page.home.events.empty")}</Text>;
  }

  return (
    <VStack align="flex-start" gap={2}>
      {title && <Heading size="md">{title}</Heading>}
      {body && (
        <Text color="fg.muted" whiteSpace="pre-line">
          {body}
        </Text>
      )}
    </VStack>
  );
}
