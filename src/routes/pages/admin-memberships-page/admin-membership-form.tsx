import {
  Button,
  Card,
  Field,
  HStack,
  Heading,
  Input,
  SimpleGrid,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useCallback } from "react";
import {
  type MembershipPaymentMethod,
  useMembershipPaymentMethodOptions,
} from "~/domain/enums/membership-payment-method";
import type {
  AdminMembershipCreateInput,
  AdminMembershipInput,
} from "~/domain/memberships";
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
  onSubmit: (value: AdminMembershipCreateInput | AdminMembershipInput) => void;
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
      onSubmit(adminMembershipFormValueFromForm(e.currentTarget, !editing));
    },
    [editing, onSubmit],
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

        <SimpleGrid columns={{ base: 1, md: 2 }} gap={3}>
          <Field.Root disabled={disabled} required>
            <Field.Label>
              {t("page.admin_memberships.form.first_name")}
              <Field.RequiredIndicator />
            </Field.Label>
            <Input
              defaultValue={initialValue?.firstName}
              name="first-name"
              pattern="\s*\S.*"
              size="sm"
            />
          </Field.Root>

          <Field.Root disabled={disabled} required>
            <Field.Label>
              {t("page.admin_memberships.form.last_name")}
              <Field.RequiredIndicator />
            </Field.Label>
            <Input
              defaultValue={initialValue?.lastName}
              name="last-name"
              pattern="\s*\S.*"
              size="sm"
            />
          </Field.Root>
        </SimpleGrid>

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
            {t("page.admin_memberships.form.street")}
            <Field.RequiredIndicator />
          </Field.Label>
          <Input
            defaultValue={initialValue?.street}
            name="street"
            pattern="\s*\S.*"
            size="sm"
          />
        </Field.Root>

        <SimpleGrid columns={{ base: 1, md: 2 }} gap={3}>
          <Field.Root disabled={disabled} required>
            <Field.Label>
              {t("page.admin_memberships.form.postal_code")}
              <Field.RequiredIndicator />
            </Field.Label>
            <Input
              defaultValue={initialValue?.postalCode}
              name="postal-code"
              pattern="\s*\S.*"
              size="sm"
            />
          </Field.Root>

          <Field.Root disabled={disabled} required>
            <Field.Label>
              {t("page.admin_memberships.form.city")}
              <Field.RequiredIndicator />
            </Field.Label>
            <Input
              defaultValue={initialValue?.city}
              name="city"
              pattern="\s*\S.*"
              size="sm"
            />
          </Field.Root>
        </SimpleGrid>

        {!editing && (
          <Field.Root disabled={disabled} required>
            <Field.Label>
              {t("page.admin_memberships.form.payment_method")}
              <Field.RequiredIndicator />
            </Field.Label>
            <SelectEnum<MembershipPaymentMethod>
              defaultValue="twint"
              name="payment-method"
              options={paymentMethodOptions}
              size="sm"
              withinDialog={withinDialog}
            />
          </Field.Root>
        )}

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
  includePaymentMethod: boolean,
): AdminMembershipCreateInput | AdminMembershipInput {
  const formData = new FormData(form);
  const getString = (key: string) => String(formData.get(key) ?? "").trim();

  const membership = {
    city: getString("city"),
    email: getString("email"),
    firstName: getString("first-name"),
    lastName: getString("last-name"),
    newsletterAccepted: formData.has("newsletter-accepted"),
    phoneNumber: getString("phone-number"),
    postalCode: getString("postal-code"),
    street: getString("street"),
  };

  if (!includePaymentMethod) return membership;

  return {
    ...membership,
    paymentMethod: getString("payment-method") as MembershipPaymentMethod,
  };
}
