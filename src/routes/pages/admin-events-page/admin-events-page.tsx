import { Button, Heading, Spinner, Text, VStack } from "@chakra-ui/react";
import { useCallback } from "react";
import { Link as RouterLink } from "react-router";
import useI18n from "~/i18n/use-i18n";
import AppAlert from "~/ui/app-alert";
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

  const confirmAdminEventDelete = useCallback(
    (eventTitle: string) =>
      window.confirm(ti("page.admin_events.delete.confirm", eventTitle)),
    [ti],
  );

  const composeAdminEventEmailForCard = useCallback(
    (targetEvent: Parameters<typeof composeAdminEventEmail>[0]) =>
      composeAdminEventEmail(
        targetEvent,
        ti("page.admin_events.compose_email_body", targetEvent.title),
        ti("page.admin_events.compose_email_subject", targetEvent.title),
      ),
    [composeAdminEventEmail, ti],
  );

  const deleteAdminEventForCard = useCallback(
    (targetEvent: Parameters<typeof deleteAdminEvent>[0]) =>
      void deleteAdminEvent(
        targetEvent,
        confirmAdminEventDelete(targetEvent.title),
      ),
    [confirmAdminEventDelete, deleteAdminEvent],
  );

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
        <AppAlert status="error">
          {eventsState.error || t("page.admin_events.error")}
        </AppAlert>
      )}

      {deleteError && (
        <AppAlert dismissible status="error">
          {t(deleteError)}
        </AppAlert>
      )}

      {copyError && (
        <AppAlert dismissible status="error">
          {t(copyError)}
        </AppAlert>
      )}

      {emailError && (
        <AppAlert dismissible status="error">
          {t(emailError)}
        </AppAlert>
      )}

      {copiedEventTitle && (
        <AppAlert dismissible status="success">
          {ti("page.admin_events.copy_emails_success", copiedEventTitle)}
        </AppAlert>
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
              onComposeEmail={composeAdminEventEmailForCard}
              onCopyEmails={copyAdminEventEmails}
              onDelete={deleteAdminEventForCard}
              stats={statsByEventId[event.id]}
              timeSlots={timeSlotsByEventId[event.id] ?? []}
            />
          ))}
        </AdminContentColumns>
      )}
    </VStack>
  );
}
