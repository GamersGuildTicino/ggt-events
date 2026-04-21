import {
  Alert,
  Badge,
  Button,
  Card,
  Center,
  HStack,
  Heading,
  Link,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { Link as RouterLink } from "react-router";
import { type Event, fetchEvents } from "~/domain/events";
import useI18n from "~/i18n/use-i18n";
import { type AsyncState, initial, loading } from "~/utils/async-state";
import AdminBreadcrumb from "../components/admin-breadcrumb";

//------------------------------------------------------------------------------
// Admin Events Page
//------------------------------------------------------------------------------

export default function AdminEventsPage() {
  const { locale, t } = useI18n();
  const [eventsState, setEventsState] =
    useState<AsyncState<Event[]>>(initial());

  useEffect(() => {
    let active = true;

    const loadEvents = async () => {
      setEventsState(loading());
      const events = await fetchEvents();
      if (!active) return;
      setEventsState(events);
    };

    void loadEvents();

    return () => {
      active = false;
    };
  }, []);

  return (
    <Center px={8} py={4} w="full">
      <VStack align="stretch" gap={3} maxW="40em" mx="auto" w="full">
        <AdminBreadcrumb
          items={[
            { label: t("page.admin_events.breadcrumb.admin"), to: "/admin" },
            { label: t("page.admin_events.breadcrumb.events") },
          ]}
        />

        <HStack justify="space-between">
          <Heading size="3xl">{t("page.admin_events.heading")}</Heading>
          <Button asChild size="xs">
            <RouterLink to="/admin/events/new">
              {t("page.admin_events.new")}
            </RouterLink>
          </Button>
        </HStack>

        {eventsState.isLoading && <Spinner />}

        {eventsState.hasError && (
          <Alert.Root status="error">
            <Alert.Description>
              {eventsState.error || t("page.admin_events.error")}
            </Alert.Description>
          </Alert.Root>
        )}

        {eventsState.isSuccess && eventsState.data.length === 0 && (
          <Text color="fg.muted">{t("page.admin_events.empty")}</Text>
        )}

        {eventsState.isSuccess && eventsState.data.length > 0 && (
          <VStack align="stretch" gap={3}>
            {eventsState.data.map((event) => (
              <EventCard event={event} key={event.id} locale={locale} />
            ))}
          </VStack>
        )}
      </VStack>
    </Center>
  );
}

//------------------------------------------------------------------------------
// Event Card
//------------------------------------------------------------------------------

function EventCard({ event, locale }: { event: Event; locale: string }) {
  const { t } = useI18n();

  return (
    <Card.Root>
      <Card.Body>
        <HStack align="flex-start" justify="space-between">
          <VStack align="flex-start" gap={1}>
            <Link asChild fontWeight="medium">
              <RouterLink to={`/admin/events/${event.id}`}>
                {event.title}
              </RouterLink>
            </Link>
            <Text color="fg.muted" fontSize="sm">
              {formatDateTime(event.startsAt, locale)}
            </Text>
            <Text fontSize="sm">
              {[event.locationName, event.locationAddress]
                .filter(Boolean)
                .join(", ")}
            </Text>
          </VStack>

          <VStack align="flex-end" gap={2}>
            <Badge>{t(`enum.event_visibility.${event.visibility}`)}</Badge>
            <Badge colorPalette={event.registrationsOpen ? "green" : "gray"}>
              {event.registrationsOpen ?
                t("page.admin_events.registrations_open")
              : t("page.admin_events.registrations_closed")}
            </Badge>
          </VStack>
        </HStack>
      </Card.Body>
    </Card.Root>
  );
}

//------------------------------------------------------------------------------
// Format Date Time
//------------------------------------------------------------------------------

function formatDateTime(date: Date, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
