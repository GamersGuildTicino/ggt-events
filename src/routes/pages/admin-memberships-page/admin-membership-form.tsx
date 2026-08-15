import {
  Button,
  Card,
  Field,
  HStack,
  Heading,
  Input,
  Text,
  Textarea,
  VStack,
} from "@chakra-ui/react";
import { useCallback } from "react";
import {
  type MembershipPaymentMethod,
  useMembershipPaymentMethodOptions,
} from "~/domain/enums/membership-payment-method";
import type { AdminMembershipInput } from "~/domain/memberships";
import useI18n from "~/i18n/use-i18n";
import AppAlert from "~/ui/app-alert";
import Checkbox from "~/ui/checkbox";
import SelectEnum from "~/ui/select-enum";

//------------------------------------------------------------------------------
// Admin Membership Form
//------------------------------------------------------------------------------

type AdminMembershipFormProps = {
  disabled?: boolean;
  error?: string;
  initialValue?: AdminMembershipInput;
  showHeading?: boolean;
  surface?: "card" | "plain";
  withinDialog?: boolean;
  onCancelEdit: () => void;
  onSubmit: (value: AdminMembershipInput) => void;
};

export default function AdminMembershipForm({
  disabled,
  error,
  initialValue,
  showHeading = true,
  surface = "card",
  withinDialog,
  onCancelEdit,
  onSubmit,
}: AdminMembershipFormProps) {
  const { t } = useI18n();
  const paymentMethodOptions = useMembershipPaymentMethodOptions();
  const editing = Boolean(initialValue);

  const submitMembershipForm = useCallback(
    (e: React.SubmitEvent<HTMLFormElement>) => {
      e.preventDefault();
      onSubmit(adminMembershipFormValueFromForm(e.currentTarget));
    },
    [onSubmit],
  );

  const form = (
    <form onSubmit={submitMembershipForm}>
      <VStack align="stretch" gap={3}>
        {showHeading && (
          <Heading size="md">
            {editing ?
              t("page.admin_memberships.form.edit_heading")
            : t("page.admin_memberships.form.create_heading")}
          </Heading>
        )}

        <Field.Root disabled={disabled} required>
          <Field.Label>
            {t("page.admin_memberships.form.full_name")}
            <Field.RequiredIndicator />
          </Field.Label>
          <Input
            defaultValue={initialValue?.fullName}
            name="full-name"
            pattern="\s*\S.*"
            size="sm"
          />
        </Field.Root>

        <Field.Root disabled={disabled} required>
          <Field.Label>
            {t("page.admin_memberships.form.email")}
            <Field.RequiredIndicator />
          </Field.Label>
          <Input
            defaultValue={initialValue?.email}
            name="email"
            pattern="[^@\s]+@[^@\s]+\.[^@\s]+"
            size="sm"
            type="email"
          />
        </Field.Root>

        <Field.Root disabled={disabled}>
          <Field.Label>
            {t("page.admin_memberships.form.phone_number")}
          </Field.Label>
          <Input
            defaultValue={initialValue?.phoneNumber ?? ""}
            name="phone-number"
            size="sm"
            type="tel"
          />
        </Field.Root>

        <Field.Root disabled={disabled} required>
          <Field.Label>
            {t("page.admin_memberships.form.home_address")}
            <Field.RequiredIndicator />
          </Field.Label>
          <Textarea
            defaultValue={initialValue?.homeAddress}
            name="home-address"
            size="sm"
          />
        </Field.Root>

        <Field.Root disabled={disabled} required>
          <Field.Label>
            {t("page.admin_memberships.form.payment_method")}
            <Field.RequiredIndicator />
          </Field.Label>
          <SelectEnum<MembershipPaymentMethod>
            defaultValue={initialValue?.paymentMethod ?? "twint"}
            name="payment-method"
            options={paymentMethodOptions}
            size="sm"
            withinDialog={withinDialog}
          />
        </Field.Root>

        <Field.Root disabled={disabled}>
          <Checkbox
            defaultChecked={initialValue?.newsletterAccepted}
            name="newsletter-accepted"
            size="sm"
          >
            <Text fontSize="sm">
              {t("page.admin_memberships.form.newsletter")}
            </Text>
          </Checkbox>
        </Field.Root>

        {error && (
          <AppAlert dismissible status="error">
            {t(error)}
          </AppAlert>
        )}

        <HStack wrap="wrap">
          <Button loading={disabled} size="sm" type="submit">
            {editing ?
              t("page.admin_memberships.form.save")
            : t("page.admin_memberships.form.create")}
          </Button>

          {editing && (
            <Button
              disabled={disabled}
              onClick={onCancelEdit}
              size="sm"
              type="button"
              variant="outline"
            >
              {t("page.admin_memberships.form.cancel")}
            </Button>
          )}
        </HStack>
      </VStack>
    </form>
  );

  if (surface === "plain") return form;

  return (
    <Card.Root>
      <Card.Body>{form}</Card.Body>
    </Card.Root>
  );
}

//------------------------------------------------------------------------------
// Admin Membership Form Value From Form
//------------------------------------------------------------------------------

function adminMembershipFormValueFromForm(
  form: HTMLFormElement,
): AdminMembershipInput {
  const formData = new FormData(form);
  const getString = (key: string) => String(formData.get(key) ?? "").trim();

  return {
    email: getString("email"),
    fullName: getString("full-name"),
    homeAddress: getString("home-address"),
    newsletterAccepted: formData.has("newsletter-accepted"),
    paymentMethod: getString("payment-method") as MembershipPaymentMethod,
    phoneNumber: getString("phone-number"),
  };
}
