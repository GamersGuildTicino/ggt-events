import {
  Button,
  Card,
  Field,
  HStack,
  Input,
  Link,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useCallback, useState } from "react";
import { Link as RouterLink } from "react-router";
import type { EventTableAgeRequirement } from "~/domain/enums/event-table-age-requirement";
import {
  isKidsAgeRequirement,
  requiresMinorGuardianContact,
} from "~/domain/enums/event-table-age-requirement";
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
  ageRequirement: EventTableAgeRequirement;
  eventTableId: PublicEventTable["id"];
  onCancel: () => void;
  onSuccess: () => void;
  registrationsOpen: boolean;
  visible: boolean;
};

export default function EventRegistrationSection({
  ageRequirement,
  eventTableId,
  onCancel,
  onSuccess,
  registrationsOpen,
  visible,
}: EventRegistrationSectionProps) {
  const { locale, t } = useI18n();
  const [participantIsMinor, setParticipantIsMinor] = useState(false);
  const [registrationState, setRegistrationState] =
    useState<AsyncState>(initial());
  const guardianContactRequired = requiresMinorGuardianContact(ageRequirement);

  const registerToEventTable = useCallback(
    async (e: React.SubmitEvent<HTMLFormElement>) => {
      e.preventDefault();
      const form = e.currentTarget;

      const formData = new FormData(form);
      const playerName = String(formData.get("player-name") ?? "").trim();
      const email = String(formData.get("email") ?? "").trim();
      const phoneNumber = String(formData.get("phone-number") ?? "").trim();
      const guardianName = String(formData.get("guardian-name") ?? "").trim();
      const guardianPhoneNumber = String(
        formData.get("guardian-phone-number") ?? "",
      ).trim();

      setRegistrationState(loading());

      const error = await registerForEventTable({
        email,
        eventTableId,
        guardianName,
        guardianPhoneNumber,
        locale,
        participantIsMinor: guardianContactRequired && participantIsMinor,
        phoneNumber,
        playerName,
      });

      if (error) return setRegistrationState(failure(error));

      form.reset();
      setParticipantIsMinor(false);
      setRegistrationState(success(undefined));
      onSuccess();
    },
    [
      eventTableId,
      guardianContactRequired,
      locale,
      onSuccess,
      participantIsMinor,
    ],
  );

  if (!registrationsOpen) return null;
  if (!visible && !registrationState.hasError) return null;

  return (
    <Card.Footer bg="bg.panel" borderRadius="md" borderWidth="1px" pt={4}>
      <VStack align="stretch" gap={3} w="full">
        {visible && (
          <form onSubmit={registerToEventTable}>
            <VStack align="stretch">
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

              <VStack my={2}>
                {guardianContactRequired && (
                  <VStack align="stretch" gap={3} w="full">
                    <Field.Root>
                      <Checkbox
                        checked={participantIsMinor}
                        name="participant-is-minor"
                        onCheckedChange={(details) =>
                          setParticipantIsMinor(details.checked === true)
                        }
                        size="sm"
                      >
                        <Text fontSize="sm">
                          {t("page.event.registration.participant_is_minor")}
                        </Text>
                      </Checkbox>
                    </Field.Root>

                    {participantIsMinor && (
                      <HStack align="flex-start" flexWrap="wrap" w="full">
                        <Field.Root flex="1 1 14rem" minW={0} required>
                          <Field.Label>
                            {t("page.event.registration.guardian_name")}
                            <Field.RequiredIndicator />
                          </Field.Label>
                          <Input
                            name="guardian-name"
                            pattern="\s*\S.*"
                            size="sm"
                          />
                        </Field.Root>

                        <Field.Root flex="1 1 12rem" minW={0} required>
                          <Field.Label>
                            {t("page.event.registration.guardian_phone_number")}
                            <Field.RequiredIndicator />
                          </Field.Label>
                          <Input
                            name="guardian-phone-number"
                            pattern="\s*\S.*"
                            size="sm"
                            type="tel"
                          />
                        </Field.Root>
                      </HStack>
                    )}
                  </VStack>
                )}

                <Field.Root required>
                  <Checkbox name="accept-terms" required size="sm">
                    <Text fontSize="sm">
                      {t("page.event.registration.accept_terms")}
                      <Link asChild color="ggt.fg.primary" fontSize="sm">
                        <RouterLink
                          target="_blank"
                          to={t("page.data_and_terms.url")}
                        >
                          {t("page.event.registration.terms_link")}
                        </RouterLink>
                      </Link>
                    </Text>
                  </Checkbox>
                </Field.Root>

                {isKidsAgeRequirement(ageRequirement) && (
                  <Field.Root required>
                    <Checkbox name="guardian-confirmed" required size="sm">
                      <Text fontSize="sm">
                        {t("page.event.registration.guardian_confirmation")}
                      </Text>
                    </Checkbox>
                  </Field.Root>
                )}

                <Field.Root required>
                  <Checkbox name="accept-time" required size="sm">
                    <Text fontSize="sm">
                      {t("page.event.registration.accept_time")}
                    </Text>
                  </Checkbox>
                </Field.Root>
              </VStack>

              {registrationState.hasError && (
                <AppAlert dismissible status="error">
                  {t(registrationState.error)}
                </AppAlert>
              )}

              <HStack wrap="wrap">
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
