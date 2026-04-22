import {
  Alert,
  Badge,
  Button,
  Card,
  HStack,
  Heading,
  Link,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useState } from "react";
import { Link as RouterLink } from "react-router";
import { type Event, fetchPublicEvents } from "~/domain/events";
import { useAsyncEffect } from "~/hooks/use-async-effect";
import useI18n from "~/i18n/use-i18n";
import { type AsyncState, initial, loading } from "~/utils/async-state";
import AdminContentColumns from "../components/admin-content-columns";

//------------------------------------------------------------------------------
// Home Page
//------------------------------------------------------------------------------

export default function HomePage() {
  const { t } = useI18n();
  const [eventsState, setEventsState] =
    useState<AsyncState<Event[]>>(initial());

  useAsyncEffect(async (isActive) => {
    setEventsState(loading());
    const events = await fetchPublicEvents();
    if (!isActive()) return;
    setEventsState(events);
  }, []);

  return (
    <VStack align="stretch" gap={6} w="full">
      <VStack align="flex-start" gap={2}>
        <Heading size="3xl">{t("page.home.heading")}</Heading>
        <Text color="fg.muted">{t("page.home.description")}</Text>
      </VStack>

      <VStack align="stretch" gap={3}>
        <Heading size="xl">{t("page.home.events.heading")}</Heading>

        {eventsState.isLoading && <Spinner />}

        {eventsState.hasError && (
          <Alert.Root status="error">
            <Alert.Description>{t(eventsState.error)}</Alert.Description>
          </Alert.Root>
        )}

        {eventsState.isSuccess && eventsState.data.length === 0 && (
          <Text color="fg.muted">{t("page.home.events.empty")}</Text>
        )}

        {eventsState.isSuccess && eventsState.data.length > 0 && (
          <AdminContentColumns>
            {eventsState.data.map((event) => (
              <EventCard event={event} key={event.id} />
            ))}
          </AdminContentColumns>
        )}
      </VStack>
    </VStack>
  );
}

//------------------------------------------------------------------------------
// Event Card
//------------------------------------------------------------------------------

function EventCard({ event }: { event: Event }) {
  const { locale, t } = useI18n();

  return (
    <Card.Root>
      <Card.Body gap={3}>
        <VStack align="flex-start" gap={2}>
          <HStack justify="space-between" w="full">
            <Link asChild fontWeight="medium">
              <RouterLink to={`/events/${event.id}`}>{event.title}</RouterLink>
            </Link>
            <Badge colorPalette={event.registrationsOpen ? "green" : "gray"}>
              {event.registrationsOpen ?
                t("page.home.events.registrations_open")
              : t("page.home.events.registrations_closed")}
            </Badge>
          </HStack>

          <Text color="fg.muted" fontSize="sm">
            {formatDateTime(event.startsAt, locale)}
          </Text>

          <Text fontSize="sm">
            {[event.locationName, event.locationAddress]
              .filter(Boolean)
              .join(", ")}
          </Text>

          <Button asChild size="sm" variant="outline">
            <RouterLink to={`/events/${event.id}`}>
              {t("page.home.events.open")}
            </RouterLink>
          </Button>
        </VStack>
      </Card.Body>
    </Card.Root>
  );
}

//------------------------------------------------------------------------------
// Format Date Time
//------------------------------------------------------------------------------

function formatDateTime(date: Date, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "long",
    timeStyle: "short",
  }).format(date);
}
