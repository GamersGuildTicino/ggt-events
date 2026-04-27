import {
  Button,
  Card,
  Field,
  HStack,
  Input,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useCallback, useState } from "react";
import { registerForEventTable } from "~/domain/event-registrations";
import type { PublicEventTable } from "~/domain/event-tables";
import useI18n from "~/i18n/use-i18n";
import AppAlert from "~/ui/app-alert";
import Checkbox from "~/ui/checkbox";
import {
  type AsyncState,
  failure,
  initial,
  loading,
  success,
} from "~/utils/async-state";

//------------------------------------------------------------------------------
// Event Registration Section
//------------------------------------------------------------------------------

type EventRegistrationSectionProps = {
  eventTableId: PublicEventTable["id"];
  onCancel: () => void;
  onSuccess: () => void;
  registrationsOpen: boolean;
  visible: boolean;
};

export default function EventRegistrationSection({
  eventTableId,
  onCancel,
  onSuccess,
  registrationsOpen,
  visible,
}: EventRegistrationSectionProps) {
  const { locale, t } = useI18n();
  const [registrationState, setRegistrationState] =
    useState<AsyncState>(initial());

  const registerToEventTable = useCallback(
    async (e: React.SubmitEvent<HTMLFormElement>) => {
      e.preventDefault();
      const form = e.currentTarget;

      const formData = new FormData(form);
      const playerName = String(formData.get("player-name") ?? "").trim();
      const email = String(formData.get("email") ?? "").trim();
      const phoneNumber = String(formData.get("phone-number") ?? "").trim();

      setRegistrationState(loading());

      const error = await registerForEventTable({
        email,
        eventTableId,
        locale,
        phoneNumber,
        playerName,
      });

      if (error) return setRegistrationState(failure(error));

      form.reset();
      setRegistrationState(success(undefined));
      onSuccess();
    },
    [eventTableId, locale, onSuccess],
  );

  if (!registrationsOpen) return null;
  if (!visible && !registrationState.hasError) return null;

  return (
    <Card.Footer bg="bg.panel" borderRadius="md" borderWidth="1px" pt={4}>
      <VStack align="stretch" gap={3} w="full">
        {visible && (
          <form onSubmit={registerToEventTable}>
            <VStack align="stretch" gap={3}>
              <Field.Root required>
                <Field.Label>
                  {t("page.event.registration.email")}
                  <Field.RequiredIndicator />
                </Field.Label>
                <Input name="email" size="sm" type="email" />
              </Field.Root>

              <HStack align="flex-start" flexWrap="wrap" w="full">
                <Field.Root flex="1 1 14rem" minW={0} required>
                  <Field.Label>
                    {t("page.event.registration.name")}
                    <Field.RequiredIndicator />
                  </Field.Label>
                  <Input name="player-name" pattern="\s*\S.*" size="sm" />
                </Field.Root>

                <Field.Root flex="1 1 12rem" minW={0}>
                  <Field.Label>
                    {t("page.event.registration.phone_number")}
                  </Field.Label>
                  <Input name="phone-number" size="sm" type="tel" />
                </Field.Root>
              </HStack>

              <Field.Root required>
                <Checkbox name="accept-terms" required size="sm">
                  <Text fontSize="sm">
                    {t("page.event.registration.accept_terms")}
                  </Text>
                </Checkbox>
              </Field.Root>

              {registrationState.hasError && (
                <AppAlert dismissible status="error">
                  {t(registrationState.error)}
                </AppAlert>
              )}

              <HStack>
                <Button
                  loading={registrationState.isLoading}
                  size="sm"
                  type="submit"
                >
                  {t("page.event.registration.submit")}
                </Button>
                <Button
                  onClick={onCancel}
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  {t("page.event.registration.cancel")}
                </Button>
              </HStack>
            </VStack>
          </form>
        )}
      </VStack>
    </Card.Footer>
  );
}
