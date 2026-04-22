import { Alert, Button, HStack, Heading, VStack } from "@chakra-ui/react";
import { useCallback, useState } from "react";
import { useNavigate } from "react-router";
import { Link as RouterLink } from "react-router";
import { useAuth } from "~/auth/use-auth";
import { createEvent } from "~/domain/events";
import useI18n from "~/i18n/use-i18n";
import {
  type AsyncState,
  failure,
  initial,
  loading,
  success,
} from "~/utils/async-state";
import AdminBreadcrumb from "../components/admin-breadcrumb";
import AdminContentColumns from "../components/admin-content-columns";
import EventDetailsForm, {
  type EventDetailsFormValue,
} from "../components/event-details-form";

//------------------------------------------------------------------------------
// Admin Events New Page
//------------------------------------------------------------------------------

export default function AdminEventsNewPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [createEventState, setCreateEventState] =
    useState<AsyncState>(initial());

  const handleCreateEvent = useCallback(
    async (eventDetails: EventDetailsFormValue) => {
      try {
        if (user === null)
          return setCreateEventState(
            failure("page.admin_events_new.error.missing_user"),
          );

        setCreateEventState(loading());

        const error = await createEvent({
          createdBy: user.id,
          ...eventDetails,
        });

        if (error) return setCreateEventState(failure(error));

        setCreateEventState(success(undefined));
        navigate("/admin/events");
      } catch (e) {
        console.error(e);
        setCreateEventState(failure("page.admin_events_new.error.generic"));
      }
    },
    [navigate, user],
  );

  return (
    <VStack align="stretch" gap={3} w="full">
      <AdminBreadcrumb
        items={[
          {
            label: t("page.admin_events_new.breadcrumb.admin"),
            to: "/admin",
          },
          {
            label: t("page.admin_events_new.breadcrumb.events"),
            to: "/admin/events",
          },
          { label: t("page.admin_events_new.breadcrumb.new") },
        ]}
      />

      <Heading size="3xl">{t("page.admin_events_new.heading")}</Heading>

      <AdminContentColumns maxColumns={2}>
        <EventDetailsForm
          actions={
            <HStack>
              <Button
                loading={createEventState.isLoading}
                size="sm"
                type="submit"
              >
                {t("page.admin_events_new.create")}
              </Button>

              <Button asChild size="sm" variant="outline">
                <RouterLink to="/admin/events">
                  {t("page.admin_events_new.cancel")}
                </RouterLink>
              </Button>
            </HStack>
          }
          disabled={createEventState.isLoading}
          message={
            createEventState.hasError ?
              <Alert.Root status="error">
                <Alert.Description>
                  {t(createEventState.error)}
                </Alert.Description>
              </Alert.Root>
            : undefined
          }
          onSubmit={handleCreateEvent}
        />
      </AdminContentColumns>
    </VStack>
  );
}
