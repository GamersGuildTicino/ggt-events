import {
  Alert,
  Button,
  Heading,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router";
import useI18n from "~/i18n/use-i18n";
import AdminBreadcrumb from "../../components/admin-breadcrumb";
import AdminContentColumns from "../../components/admin-content-columns";
import AdminEventCard from "./admin-event-card";
import useAdminEvents from "./use-admin-events";

//------------------------------------------------------------------------------
// Admin Events Page
//------------------------------------------------------------------------------

export default function AdminEventsPage() {
  const { locale, t, ti } = useI18n();
  const {
    copyAdminEventEmails,
    copyError,
    copiedEventTitle,
    deleteAdminEvent,
    deleteError,
    emailError,
    eventsState,
    composeAdminEventEmail,
    sortedEvents,
    statsByEventId,
    timeSlotsByEventId,
  } = useAdminEvents(locale);

  const confirmDeleteEvent = (eventTitle: string) =>
    window.confirm(ti("page.admin_events.delete.confirm", eventTitle));

  return (
    <VStack align="stretch" gap={3} w="full">
      <AdminBreadcrumb
        items={[
          { label: t("page.admin_events.breadcrumb.admin"), to: "/admin" },
          { label: t("page.admin_events.breadcrumb.events") },
        ]}
      />

      <VStack align="stretch" gap={3}>
        <Heading size="3xl">{t("page.admin_events.heading")}</Heading>
        <Button alignSelf="flex-start" asChild size="xs">
          <RouterLink to="/admin/events/new">
            {t("page.admin_events.new")}
          </RouterLink>
        </Button>
      </VStack>

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

      {copyError && (
        <Alert.Root status="error">
          <Alert.Description>{t(copyError)}</Alert.Description>
        </Alert.Root>
      )}

      {emailError && (
        <Alert.Root status="error">
          <Alert.Description>{t(emailError)}</Alert.Description>
        </Alert.Root>
      )}

      {copiedEventTitle && (
        <Alert.Root status="success">
          <Alert.Description>
            {ti("page.admin_events.copy_emails_success", copiedEventTitle)}
          </Alert.Description>
        </Alert.Root>
      )}

      {eventsState.isSuccess && eventsState.data.length === 0 && (
        <Text color="fg.muted">{t("page.admin_events.empty")}</Text>
      )}

      {eventsState.isSuccess && sortedEvents.length > 0 && (
        <AdminContentColumns>
          {sortedEvents.map((event) => (
            <AdminEventCard
              event={event}
              key={event.id}
              locale={locale}
              onComposeEmail={(targetEvent) =>
                composeAdminEventEmail(
                  targetEvent,
                  ti("page.admin_events.compose_email_body", targetEvent.title),
                  ti(
                    "page.admin_events.compose_email_subject",
                    targetEvent.title,
                  ),
                )
              }
              onCopyEmails={copyAdminEventEmails}
              onDelete={(targetEvent) =>
                void deleteAdminEvent(
                  targetEvent,
                  confirmDeleteEvent(targetEvent.title),
                )
              }
              stats={statsByEventId[event.id]}
              timeSlots={timeSlotsByEventId[event.id] ?? []}
            />
          ))}
        </AdminContentColumns>
      )}
    </VStack>
  );
}
