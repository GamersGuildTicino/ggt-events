import {
  Button,
  Card,
  HStack,
  Heading,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import { ChevronLeft } from "lucide-react";
import { useCallback, useState } from "react";
import { Link as RouterLink, useSearchParams } from "react-router";
import {
  type EventRegistrationCancellation,
  cancelRegistrationWithToken,
  fetchRegistrationCancellation,
} from "~/domain/event-registrations";
import { useAsyncEffect } from "~/hooks/use-async-effect";
import usePageTitle from "~/hooks/use-page-title";
import LocaleSelect from "~/i18n/locale-select";
import useI18n from "~/i18n/use-i18n";
import AppAlert from "~/ui/app-alert";
import {
  type AsyncState,
  failure,
  initial,
  loading,
} from "~/utils/async-state";

//------------------------------------------------------------------------------
// Registration Cancellation Page
//------------------------------------------------------------------------------

export default function RegistrationCancellationPage() {
  const { locale, t, ti } = useI18n();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [cancellationState, setCancellationState] =
    useState<AsyncState<EventRegistrationCancellation>>(initial());
  const [confirmState, setConfirmState] =
    useState<AsyncState<EventRegistrationCancellation>>(initial());

  usePageTitle(t("page.registration_cancellation.heading"));

  useAsyncEffect(
    async (isActive) => {
      if (!token) {
        setCancellationState(
          failure("error.event_registrations.invalid_cancellation_token"),
        );
        return;
      }

      setCancellationState(loading());
      const cancellation = await fetchRegistrationCancellation(token);
      if (!isActive()) return;
      setCancellationState(cancellation);
    },
    [token],
  );

  const cancelRegistration = useCallback(async () => {
    setConfirmState(loading());
    const cancellation = await cancelRegistrationWithToken(token);
    setConfirmState(cancellation);
  }, [token]);

  const visibleCancellation =
    confirmState.isSuccess ? confirmState.data
    : cancellationState.isSuccess ? cancellationState.data
    : null;

  return (
    <VStack align="stretch" gap={6} w="full">
      <HStack justify="space-between" w="full">
        <Button asChild size="sm" variant="ghost">
          <RouterLink to="/">
            <ChevronLeft />
            {t("page.event.back_to_home")}
          </RouterLink>
        </Button>
        <LocaleSelect css={localeSelectCss} />
      </HStack>

      <VStack align="stretch" gap={2}>
        <Heading size="3xl">
          {t("page.registration_cancellation.heading")}
        </Heading>
        <Text color="fg.muted">
          {t("page.registration_cancellation.description")}
        </Text>
      </VStack>

      {cancellationState.isLoading && <Spinner />}

      {cancellationState.hasError && (
        <AppAlert status="error">{t(cancellationState.error)}</AppAlert>
      )}

      {visibleCancellation && (
        <Card.Root bg="publicSurfaceBg" borderColor="publicSurfaceBorder">
          <Card.Body gap={4}>
            <VStack align="stretch" gap={1}>
              <Heading size="md">{visibleCancellation.eventTitle}</Heading>
              <Text color="fg.muted">
                {ti(
                  "page.registration_cancellation.table",
                  visibleCancellation.tableTitle,
                )}
              </Text>
              <Text color="fg.muted">
                {ti(
                  "page.registration_cancellation.game_master",
                  visibleCancellation.gameMasterName,
                )}
              </Text>
              <Text color="fg.muted">
                {formatCancellationTimeSlot(visibleCancellation, locale)}
              </Text>
              <Text color="fg.muted">
                {[
                  visibleCancellation.locationName,
                  visibleCancellation.locationAddress,
                ]
                  .filter(Boolean)
                  .join(", ")}
              </Text>
            </VStack>

            {confirmState.hasError && (
              <AppAlert status="error">{t(confirmState.error)}</AppAlert>
            )}

            {confirmState.isSuccess ?
              <AppAlert status="success">
                {t("page.registration_cancellation.success")}
              </AppAlert>
            : <Button
                alignSelf="flex-start"
                colorPalette="red"
                loading={confirmState.isLoading}
                onClick={cancelRegistration}
              >
                {t("page.registration_cancellation.confirm")}
              </Button>
            }
          </Card.Body>
        </Card.Root>
      )}
    </VStack>
  );
}

//------------------------------------------------------------------------------
// Format Cancellation Time Slot
//------------------------------------------------------------------------------

function formatCancellationTimeSlot(
  cancellation: EventRegistrationCancellation,
  locale: string,
) {
  const startsAt = new Intl.DateTimeFormat(locale, {
    dateStyle: "full",
    timeStyle: "short",
  }).format(cancellation.timeSlotStartsAt);
  const endsAt = new Intl.DateTimeFormat(locale, {
    timeStyle: "short",
  }).format(cancellation.timeSlotEndsAt);

  return `${startsAt} - ${endsAt}`;
}

//------------------------------------------------------------------------------
// Locale Select CSS
//------------------------------------------------------------------------------

const localeSelectCss = {
  "& [data-part='trigger']": {
    borderColor: "black",
  },
};
