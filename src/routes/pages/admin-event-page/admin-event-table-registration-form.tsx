import { Button, Field, HStack, Input } from "@chakra-ui/react";
import useI18n from "~/i18n/use-i18n";

//------------------------------------------------------------------------------
// Admin Event Table Registration Form Value
//------------------------------------------------------------------------------

export type EventTableRegistrationFormValue = {
  email: string;
  phoneNumber: string;
  playerName: string;
};

//------------------------------------------------------------------------------
// Admin Event Table Registration Form
//------------------------------------------------------------------------------

type AdminEventTableRegistrationFormProps = {
  onSubmit: (value: EventTableRegistrationFormValue) => Promise<string | void>;
  submitting: boolean;
};

export default function AdminEventTableRegistrationForm({
  onSubmit,
  submitting,
}: AdminEventTableRegistrationFormProps) {
  const { t } = useI18n();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(e.currentTarget);

    const error = await onSubmit({
      email: String(formData.get("email") ?? "").trim(),
      phoneNumber: String(formData.get("phone-number") ?? "").trim(),
      playerName: String(formData.get("player-name") ?? "").trim(),
    });

    if (error) return;
    form.reset();
  };

  return (
    <form onSubmit={handleSubmit}>
      <HStack align="flex-end">
        <Field.Root required>
          <Input
            name="email"
            placeholder={t("page.admin_event.tables.registrations.email")}
            size="xs"
            type="email"
          />
        </Field.Root>

        <Field.Root required>
          <Input
            name="player-name"
            pattern="\s*\S.*"
            placeholder={t("page.admin_event.tables.registrations.player_name")}
            size="xs"
          />
        </Field.Root>

        <Field.Root>
          <Input
            name="phone-number"
            placeholder={t(
              "page.admin_event.tables.registrations.phone_number",
            )}
            size="xs"
            type="tel"
          />
        </Field.Root>

        <Button loading={submitting} size="xs" type="submit">
          {t("page.admin_event.tables.registrations.add")}
        </Button>
      </HStack>
    </form>
  );
}
