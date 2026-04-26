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
import { useMemo, useState } from "react";
import { Link as RouterLink } from "react-router";
import { fetchEventRegistrations } from "~/domain/event-registrations";
import { fetchEventTables } from "~/domain/event-tables";
import {
  type EventTimeSlot,
  fetchEventTimeSlots,
  isEventOver,
} from "~/domain/event-time-slots";
import { type Event, deleteEvent, fetchEvents } from "~/domain/events";
import { useAsyncEffect } from "~/hooks/use-async-effect";
import useI18n from "~/i18n/use-i18n";
import { type AsyncState, initial, loading } from "~/utils/async-state";
import AdminBreadcrumb from "../components/admin-breadcrumb";
import AdminContentColumns from "../components/admin-content-columns";

//------------------------------------------------------------------------------
// Admin Events Page
//------------------------------------------------------------------------------

type EventSummaryStats = {
  occupiedSeats: number;
  occupiedTables: number;
  totalSeats: number;
  totalTables: number;
};

export default function AdminEventsPage() {
  const { locale, t, ti } = useI18n();
  const [deleteError, setDeleteError] = useState("");
  const [deletingEventId, setDeletingEventId] = useState<Event["id"] | null>(
    null,
  );
  const [eventsState, setEventsState] =
    useState<AsyncState<Event[]>>(initial());
  const [timeSlotsByEventId, setTimeSlotsByEventId] = useState<
    Record<Event["id"], EventTimeSlot[]>
  >({});
  const [statsByEventId, setStatsByEventId] = useState<
    Record<Event["id"], EventSummaryStats>
  >({});
  const sortedEvents = useMemo(() => {
    if (!eventsState.isSuccess) return [];

    return [...eventsState.data].sort((a, b) => {
      const aTimeSlots = timeSlotsByEventId[a.id] ?? [];
      const bTimeSlots = timeSlotsByEventId[b.id] ?? [];
      const aHasTimeSlots = aTimeSlots.length > 0;
      const bHasTimeSlots = bTimeSlots.length > 0;

      if (!aHasTimeSlots && !bHasTimeSlots) return 0;
      if (!aHasTimeSlots) return -1;
      if (!bHasTimeSlots) return 1;

      const aLatestStartsAt = Math.max(
        ...aTimeSlots.map((timeSlot) => timeSlot.startsAt.getTime()),
      );
      const bLatestStartsAt = Math.max(
        ...bTimeSlots.map((timeSlot) => timeSlot.startsAt.getTime()),
      );

      return bLatestStartsAt - aLatestStartsAt;
    });
  }, [eventsState, timeSlotsByEventId]);

  const loadEventMeta = async (events: Event[]) => {
    const entries = await Promise.all(
      events.map(async (event) => {
        const [timeSlots, eventTables] = await Promise.all([
          fetchEventTimeSlots(event.id),
          fetchEventTables(event.id),
        ]);

        const timeSlotsData = timeSlots.isSuccess ? timeSlots.data : [];
        if (!eventTables.isSuccess) {
          return [event.id, { stats: null, timeSlots: timeSlotsData }] as const;
        }

        const registrations = await fetchEventRegistrations(
          eventTables.data.map((eventTable) => eventTable.id),
        );

        const registrationsByTableId = new Map<string, number>();
        if (registrations.isSuccess) {
          for (const registration of registrations.data) {
            registrationsByTableId.set(
              registration.eventTableId,
              (registrationsByTableId.get(registration.eventTableId) ?? 0) + 1,
            );
          }
        }

        const occupiedSeats =
          registrations.isSuccess ? registrations.data.length : 0;
        const occupiedTables = eventTables.data.filter(
          (eventTable) => (registrationsByTableId.get(eventTable.id) ?? 0) > 0,
        ).length;
        const totalSeats = eventTables.data.reduce(
          (sum, eventTable) => sum + eventTable.maxPlayers,
          0,
        );
        const totalTables = eventTables.data.length;

        return [
          event.id,
          {
            stats: {
              occupiedSeats,
              occupiedTables,
              totalSeats,
              totalTables,
            },
            timeSlots: timeSlotsData,
          },
        ] as const;
      }),
    );

    setTimeSlotsByEventId(
      Object.fromEntries(
        entries.map(([eventId, data]) => [eventId, data.timeSlots]),
      ),
    );
    setStatsByEventId(
      Object.fromEntries(
        entries.flatMap(([eventId, data]) =>
          data.stats ? [[eventId, data.stats] as const] : [],
        ),
      ),
    );
  };

  const loadEvents = async () => {
    setEventsState(loading());
    const events = await fetchEvents();
    setEventsState(events);
    if (events.isSuccess) await loadEventMeta(events.data);
  };

  useAsyncEffect(async (isActive) => {
    setEventsState(loading());
    const events = await fetchEvents();
    if (!isActive()) return;
    setEventsState(events);
    if (!events.isSuccess) return;
    await loadEventMeta(events.data);
    if (!isActive()) return;
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

      {eventsState.isSuccess && sortedEvents.length > 0 && (
        <AdminContentColumns>
          {sortedEvents.map((event) => (
            <EventCard
              deleting={deletingEventId === event.id}
              event={event}
              key={event.id}
              locale={locale}
              onDelete={handleDeleteEvent}
              stats={statsByEventId[event.id]}
              timeSlots={timeSlotsByEventId[event.id] ?? []}
            />
          ))}
        </AdminContentColumns>
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
  stats,
  timeSlots,
}: {
  deleting: boolean;
  event: Event;
  locale: string;
  onDelete: (event: Event) => void;
  stats?: EventSummaryStats;
  timeSlots: EventTimeSlot[];
}) {
  const { t, ti } = useI18n();
  const eventOver = isEventOver(timeSlots);
  const registrationStatus =
    eventOver ? t("page.admin_events.event_over")
    : event.registrationsOpen ? t("page.admin_events.registrations_open")
    : t("page.admin_events.registrations_closed");
  const registrationColor =
    eventOver ? "orange"
    : event.registrationsOpen ? "green"
    : "gray";

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
              {formatEventTimeRange(timeSlots, locale)}
            </Text>
            <Text fontSize="sm">
              {[event.locationName, event.locationAddress]
                .filter(Boolean)
                .join(", ")}
            </Text>
            {stats && stats.totalTables > 0 && (
              <Text color="fg.muted" fontSize="sm">
                {ti(
                  "page.admin_events.stats.seats",
                  String(stats.occupiedSeats),
                  String(stats.totalSeats),
                )}
                {" • "}
                {ti(
                  "page.admin_events.stats.tables",
                  String(stats.occupiedTables),
                  String(stats.totalTables),
                )}
              </Text>
            )}
          </VStack>

          <VStack align="flex-end" gap={2}>
            <Badge>{t(`enum.event_visibility.${event.visibility}`)}</Badge>
            <Badge colorPalette={registrationColor}>{registrationStatus}</Badge>
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

function formatEventTimeRange(timeSlots: EventTimeSlot[], locale: string) {
  if (timeSlots.length === 0) return "";

  const startsAt = timeSlots[0]?.startsAt;
  const endsAt = timeSlots.at(-1)?.endsAt;
  if (!startsAt || !endsAt) return "";

  const date = new Intl.DateTimeFormat(locale, { dateStyle: "medium" });
  if (startsAt.toDateString() === endsAt.toDateString()) {
    return date.format(startsAt);
  }

  return `${date.format(startsAt)} - ${date.format(endsAt)}`;
}
