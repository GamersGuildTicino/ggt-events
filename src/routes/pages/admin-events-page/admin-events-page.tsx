import {
  Button,
  HStack,
  Heading,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useCallback } from "react";
import { Link as RouterLink } from "react-router";
import usePageTitle from "~/hooks/use-page-title";
import useI18n from "~/i18n/use-i18n";
import AppAlert from "~/ui/app-alert";
import { toaster } from "~/ui/toaster";
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
    deleteAdminEvent,
    deleteError,
    eventsState,
    composeAdminEventEmail,
    sortedEvents,
    statsByEventId,
    timeSlotsByEventId,
  } = useAdminEvents(locale);

  usePageTitle(t("page.admin_events.heading"));

  const confirmAdminEventDelete = useCallback(
    (eventTitle: string) =>
      window.confirm(ti("page.admin_events.delete.confirm", eventTitle)),
    [ti],
  );

  const composeAdminEventEmailForCard = useCallback(
    (targetEvent: Parameters<typeof composeAdminEventEmail>[0]) => {
      let composed = false;

      try {
        composed = composeAdminEventEmail(
          targetEvent,
          ti("page.admin_events.compose_email_body", targetEvent.title),
          ti("page.admin_events.compose_email_subject", targetEvent.title),
        );
      } catch {
        composed = false;
      }

      if (composed) return;

      toaster.error({
        description: t("page.admin_events.compose_email_error"),
        id: `compose-admin-event-email-error-${targetEvent.id}`,
      });
    },
    [composeAdminEventEmail, t, ti],
  );

  const copyAdminEventEmailsForCard = useCallback(
    async (targetEvent: Parameters<typeof copyAdminEventEmails>[0]) => {
      let copied = false;

      try {
        copied = await copyAdminEventEmails(targetEvent);
      } catch {
        copied = false;
      }

      if (copied) {
        toaster.success({
          description: ti(
            "page.admin_events.copy_emails_success",
            targetEvent.title,
          ),
          id: `copy-admin-event-emails-success-${targetEvent.id}`,
        });
        return;
      }

      toaster.error({
        description: t("page.admin_events.copy_emails_error"),
        id: `copy-admin-event-emails-error-${targetEvent.id}`,
      });
    },
    [copyAdminEventEmails, t, ti],
  );

  const copyAdminEventEmailsForCardAction = useCallback(
    (targetEvent: Parameters<typeof copyAdminEventEmails>[0]) =>
      void copyAdminEventEmailsForCard(targetEvent),
    [copyAdminEventEmailsForCard],
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
        <AppAlert status="error">
          {eventsState.error || t("page.admin_events.error")}
        </AppAlert>
      )}

      {deleteError && (
        <AppAlert dismissible status="error">
          {t(deleteError)}
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
              onCopyEmails={copyAdminEventEmailsForCardAction}
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
