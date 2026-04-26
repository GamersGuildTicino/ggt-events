import {
  Badge,
  Button,
  Card,
  HStack,
  Link,
  Text,
  VStack,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router";
import type { EventTimeSlot } from "~/domain/event-time-slots";
import { isEventOver } from "~/domain/event-time-slots";
import type { Event } from "~/domain/events";
import useI18n from "~/i18n/use-i18n";
import AdminEventCardMenu from "./admin-event-card-menu";
import { formatAdminEventTimeRange } from "./admin-events-page-format";
import type { EventSummaryStats } from "./use-admin-events";

//------------------------------------------------------------------------------
// Admin Event Card
//------------------------------------------------------------------------------

type AdminEventCardProps = {
  event: Event;
  locale: string;
  onComposeEmail: (event: Event) => void;
  onCopyEmails: (event: Event) => void;
  onDelete: (event: Event) => void;
  stats?: EventSummaryStats;
  timeSlots: EventTimeSlot[];
};

export default function AdminEventCard({
  event,
  locale,
  onComposeEmail,
  onCopyEmails,
  onDelete,
  stats,
  timeSlots,
}: AdminEventCardProps) {
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
              {formatAdminEventTimeRange(timeSlots, locale)}
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

              <AdminEventCardMenu
                canEmail={Boolean(stats && stats.emails.length > 0)}
                event={event}
                onComposeEmail={onComposeEmail}
                onCopyEmails={onCopyEmails}
                onDelete={onDelete}
              />
            </HStack>
          </VStack>
        </HStack>
      </Card.Body>
    </Card.Root>
  );
}
