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
import { type Event, deleteEvent, fetchEvents } from "~/domain/events";
import { useAsyncEffect } from "~/hooks/use-async-effect";
import useI18n from "~/i18n/use-i18n";
import { type AsyncState, initial, loading } from "~/utils/async-state";
import AdminBreadcrumb from "../components/admin-breadcrumb";

//------------------------------------------------------------------------------
// Admin Events Page
//------------------------------------------------------------------------------

export default function AdminEventsPage() {
  const { locale, t, ti } = useI18n();
  const [deleteError, setDeleteError] = useState("");
  const [deletingEventId, setDeletingEventId] = useState<Event["id"] | null>(
    null,
  );
  const [eventsState, setEventsState] =
    useState<AsyncState<Event[]>>(initial());

  const loadEvents = async () => {
    setEventsState(loading());
    const events = await fetchEvents();
    setEventsState(events);
  };

  useAsyncEffect(async (isActive) => {
    setEventsState(loading());
    const events = await fetchEvents();
    if (!isActive()) return;
    setEventsState(events);
  }, []);

  const handleDeleteEvent = async (event: Event) => {
    const message = ti("page.admin_events.delete.confirm", event.title);
    const confirmed = window.confirm(message);
    if (!confirmed) return;

    setDeleteError("");
    setDeletingEventId(event.id);
    const error = await deleteEvent(event.id);
    setDeletingEventId(null);

    if (error) return setDeleteError(error);
    await loadEvents();
  };

  return (
    <VStack align="stretch" gap={3} w="full">
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

      {deleteError && (
        <Alert.Root status="error">
          <Alert.Description>{t(deleteError)}</Alert.Description>
        </Alert.Root>
      )}

      {eventsState.isSuccess && eventsState.data.length === 0 && (
        <Text color="fg.muted">{t("page.admin_events.empty")}</Text>
      )}

      {eventsState.isSuccess && eventsState.data.length > 0 && (
        <VStack align="stretch" gap={3}>
          {eventsState.data.map((event) => (
            <EventCard
              deleting={deletingEventId === event.id}
              event={event}
              key={event.id}
              locale={locale}
              onDelete={handleDeleteEvent}
            />
          ))}
        </VStack>
      )}
    </VStack>
  );
}

//------------------------------------------------------------------------------
// Event Card
//------------------------------------------------------------------------------

function EventCard({
  deleting,
  event,
  locale,
  onDelete,
}: {
  deleting: boolean;
  event: Event;
  locale: string;
  onDelete: (event: Event) => void;
}) {
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
            <HStack gap={2} pt={2}>
              <Button asChild size="xs" variant="outline">
                <RouterLink to={`/admin/events/${event.id}`}>
                  {t("page.admin_events.manage")}
                </RouterLink>
              </Button>
              <Button
                colorPalette="red"
                loading={deleting}
                onClick={() => onDelete(event)}
                size="xs"
                variant="outline"
              >
                {t("page.admin_events.delete")}
              </Button>
            </HStack>
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
