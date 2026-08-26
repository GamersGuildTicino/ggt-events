import {
  Button,
  Card,
  Field,
  HStack,
  Heading,
  Input,
  Link,
  SimpleGrid,
  Text,
  VStack,
} from "@chakra-ui/react";
import { ChevronLeft } from "lucide-react";
import { useCallback, useState } from "react";
import { Link as RouterLink } from "react-router";
import {
  type MembershipPaymentMethod,
  useMembershipPaymentMethodOptions,
} from "~/domain/enums/membership-payment-method";
import { createMembership } from "~/domain/memberships";
import usePageTitle from "~/hooks/use-page-title";
import LocaleSelect from "~/i18n/locale-select";
import useI18n from "~/i18n/use-i18n";
import AppAlert from "~/ui/app-alert";
import Checkbox from "~/ui/checkbox";
import SelectEnum from "~/ui/select-enum";
import {
  type AsyncState,
  failure,
  initial,
  loading,
  success,
} from "~/utils/async-state";
import MembershipDonationCards from "./membership-donation-cards";
import MembershipPaymentCards from "./membership-payment-cards";

//------------------------------------------------------------------------------
// Membership Page
//------------------------------------------------------------------------------

export default function MembershipPage() {
  const { locale, t } = useI18n();
  const paymentMethodOptions = useMembershipPaymentMethodOptions();
  const [membershipState, setMembershipState] = useState<AsyncState>(initial());

  usePageTitle(t("page.membership.heading"));

  const submitMembership = useCallback(
    async (e: React.SubmitEvent<HTMLFormElement>) => {
      e.preventDefault();

      const form = e.currentTarget;
      const formData = new FormData(form);
      const firstName = String(formData.get("first-name") ?? "").trim();
      const lastName = String(formData.get("last-name") ?? "").trim();
      const email = String(formData.get("email") ?? "").trim();
      const phoneNumber = String(formData.get("phone-number") ?? "").trim();
      const street = String(formData.get("street") ?? "").trim();
      const postalCode = String(formData.get("postal-code") ?? "").trim();
      const city = String(formData.get("city") ?? "").trim();
      const paymentMethod = String(
        formData.get("payment-method") ?? "twint",
      ) as MembershipPaymentMethod;
      const paymentAmount = paymentAmountFromFormData(formData);
      const newsletterAccepted = formData.has("newsletter-accepted");

      setMembershipState(loading());

      const error = await createMembership({
        city,
        email,
        firstName,
        lastName,
        locale,
        newsletterAccepted,
        paymentAmount,
        paymentMethod,
        phoneNumber,
        postalCode,
        street,
      });

      if (error) return setMembershipState(failure(error));

      form.reset();
      setMembershipState(success(undefined));
    },
    [locale],
  );

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
        <Heading size="3xl">{t("page.membership.heading")}</Heading>
        <Text>{t("page.membership.description")}</Text>
      </VStack>

      <Text whiteSpace="pre-line">{t("page.membership.card_info")}</Text>

      <Text>{t("page.membership.info")}</Text>

      <Card.Root bg="white" borderColor="ggt.surface.border">
        <Card.Body>
          <form onSubmit={submitMembership}>
            <VStack align="stretch" gap={4}>
              <Heading size="md">{t("page.membership.form.heading")}</Heading>

              <SimpleGrid columns={{ base: 1, md: 2 }} gap={3}>
                <Field.Root required>
                  <Field.Label>
                    {t("page.membership.form.first_name")}
                    <Field.RequiredIndicator />
                  </Field.Label>
                  <Input
                    name="first-name"
                    pattern="\s*\S.*"
                    placeholder={t(
                      "page.membership.form.first_name.placeholder",
                    )}
                    size="sm"
                  />
                </Field.Root>

                <Field.Root required>
                  <Field.Label>
                    {t("page.membership.form.last_name")}
                    <Field.RequiredIndicator />
                  </Field.Label>
                  <Input
                    name="last-name"
                    pattern="\s*\S.*"
                    placeholder={t(
                      "page.membership.form.last_name.placeholder",
                    )}
                    size="sm"
                  />
                </Field.Root>
              </SimpleGrid>

              <Field.Root required>
                <Field.Label>
                  {t("page.membership.form.email")}
                  <Field.RequiredIndicator />
                </Field.Label>
                <Input
                  name="email"
                  pattern="[^@\s]+@[^@\s]+\.[^@\s]+"
                  placeholder={t("page.membership.form.email.placeholder")}
                  size="sm"
                  type="email"
                />
              </Field.Root>

              <Field.Root>
                <Field.Label>
                  {t("page.membership.form.phone_number")}
                </Field.Label>
                <Input
                  name="phone-number"
                  placeholder={t(
                    "page.membership.form.phone_number.placeholder",
                  )}
                  size="sm"
                  type="tel"
                />
              </Field.Root>

              <Field.Root required>
                <Field.Label>
                  {t("page.membership.form.street")}
                  <Field.RequiredIndicator />
                </Field.Label>
                <Input
                  name="street"
                  pattern="\s*\S.*"
                  placeholder={t("page.membership.form.street.placeholder")}
                  size="sm"
                />
              </Field.Root>

              <SimpleGrid columns={{ base: 1, md: 2 }} gap={3}>
                <Field.Root required>
                  <Field.Label>
                    {t("page.membership.form.postal_code")}
                    <Field.RequiredIndicator />
                  </Field.Label>
                  <Input
                    name="postal-code"
                    pattern="\s*\S.*"
                    placeholder={t(
                      "page.membership.form.postal_code.placeholder",
                    )}
                    size="sm"
                  />
                </Field.Root>

                <Field.Root required>
                  <Field.Label>
                    {t("page.membership.form.city")}
                    <Field.RequiredIndicator />
                  </Field.Label>
                  <Input
                    name="city"
                    pattern="\s*\S.*"
                    placeholder={t("page.membership.form.city.placeholder")}
                    size="sm"
                  />
                </Field.Root>
              </SimpleGrid>

              <SimpleGrid columns={{ base: 1, md: 2 }} gap={3}>
                <Field.Root required>
                  <Field.Label>
                    {t("page.membership.form.payment_method")}
                    <Field.RequiredIndicator />
                  </Field.Label>
                  <SelectEnum<MembershipPaymentMethod>
                    defaultValue="twint"
                    name="payment-method"
                    options={paymentMethodOptions}
                    size="sm"
                  />
                </Field.Root>

                <Field.Root>
                  <Field.Label>{t("page.membership.form.amount")}</Field.Label>
                  <Input
                    min={0}
                    name="payment-amount"
                    placeholder={t("page.membership.form.amount.placeholder")}
                    size="sm"
                    step="0.05"
                    type="number"
                  />
                </Field.Root>
              </SimpleGrid>

              <VStack gap={2}>
                <Field.Root>
                  <Checkbox name="newsletter-accepted" size="sm">
                    <Text fontSize="sm">
                      {t("page.membership.form.newsletter")}
                    </Text>
                  </Checkbox>
                </Field.Root>

                <Field.Root required>
                  <Checkbox name="accept-terms" required size="sm">
                    <Text fontSize="sm">
                      {t("page.membership.form.accept_terms")}
                      <Link asChild color="ggt.fg.primary" fontSize="sm">
                        <RouterLink
                          target="_blank"
                          to={t("page.data_and_terms.url")}
                        >
                          {t("page.membership.form.terms_link")}
                        </RouterLink>
                      </Link>
                    </Text>
                  </Checkbox>
                </Field.Root>
              </VStack>

              {membershipState.hasError && (
                <AppAlert dismissible status="error">
                  {t(membershipState.error)}
                </AppAlert>
              )}

              {membershipState.isSuccess && (
                <AppAlert dismissible status="success">
                  {t("page.membership.success")}
                </AppAlert>
              )}

              <HStack>
                <Button
                  loading={membershipState.isLoading}
                  size="sm"
                  type="submit"
                >
                  {t("page.membership.form.submit")}
                </Button>
              </HStack>
            </VStack>
          </form>
        </Card.Body>
      </Card.Root>

      <VStack align="stretch" gap={6}>
        <VStack align="stretch" gap={4}>
          <Text>{t("page.membership.donation.info")}</Text>

          <MembershipDonationCards />
        </VStack>

        <VStack align="stretch" gap={4}>
          <Heading size="md">{t("page.membership.payment.heading")}</Heading>

          <MembershipPaymentCards />
        </VStack>
      </VStack>
    </VStack>
  );
}

//------------------------------------------------------------------------------
// Locale Select CSS
//------------------------------------------------------------------------------

const localeSelectCss = {
  "& [data-part='trigger']": {
    borderColor: "black",
  },
};

//------------------------------------------------------------------------------
// Payment Amount From Form Data
//------------------------------------------------------------------------------

function paymentAmountFromFormData(formData: FormData) {
  const value = String(formData.get("payment-amount") ?? "").trim();
  return value ? Number(value) : 0;
}
