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
  Textarea,
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
      const fullName = String(formData.get("full-name") ?? "").trim();
      const email = String(formData.get("email") ?? "").trim();
      const phoneNumber = String(formData.get("phone-number") ?? "").trim();
      const homeAddress = String(formData.get("home-address") ?? "").trim();
      const paymentMethod = String(
        formData.get("payment-method") ?? "twint",
      ) as MembershipPaymentMethod;
      const newsletterAccepted = formData.has("newsletter-accepted");

      setMembershipState(loading());

      const error = await createMembership({
        email,
        fullName,
        homeAddress,
        locale,
        newsletterAccepted,
        paymentMethod,
        phoneNumber,
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
        <Text color="fg.muted">{t("page.membership.description")}</Text>
      </VStack>

      <Card.Root bg="ggt.surface.bg" borderColor="ggt.surface.border">
        <Card.Body gap={5}>
          <VStack align="stretch" gap={3}>
            <Text>{t("page.membership.info")}</Text>

            <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} gap={3}>
              <MembershipInfoCard
                body={t("page.membership.donation.chf_5.body")}
                title={t("page.membership.donation.chf_5.title")}
              />
              <MembershipInfoCard
                body={t("page.membership.donation.chf_10.body")}
                title={t("page.membership.donation.chf_10.title")}
              />
              <MembershipInfoCard
                body={t("page.membership.donation.chf_20.body")}
                title={t("page.membership.donation.chf_20.title")}
              />
              <MembershipInfoCard
                body={t("page.membership.donation.chf_50.body")}
                title={t("page.membership.donation.chf_50.title")}
              />
            </SimpleGrid>

            <Text whiteSpace="pre-line">{t("page.membership.card_info")}</Text>
          </VStack>

          <VStack align="stretch" gap={3}>
            <Heading size="sm">{t("page.membership.payment.heading")}</Heading>

            <SimpleGrid columns={{ base: 1, md: 3 }} gap={3}>
              <MembershipInfoCard
                body={t("page.membership.payment.bank_transfer.body")}
                title={t("page.membership.payment.bank_transfer.title")}
              />
              <MembershipInfoCard
                body={t("page.membership.payment.twint.body")}
                title={t("page.membership.payment.twint.title")}
              />
              <MembershipInfoCard
                body={t("page.membership.payment.cash.body")}
                title={t("page.membership.payment.cash.title")}
              />
            </SimpleGrid>
          </VStack>
        </Card.Body>
      </Card.Root>

      <Card.Root bg="white" borderColor="ggt.surface.border">
        <Card.Body>
          <form onSubmit={submitMembership}>
            <VStack align="stretch" gap={4}>
              <Heading size="md">{t("page.membership.form.heading")}</Heading>

              <Field.Root required>
                <Field.Label>
                  {t("page.membership.form.full_name")}
                  <Field.RequiredIndicator />
                </Field.Label>
                <Input
                  name="full-name"
                  pattern="\s*\S.*"
                  placeholder={t("page.membership.form.full_name.placeholder")}
                  size="sm"
                />
              </Field.Root>

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
                  {t("page.membership.form.home_address")}
                  <Field.RequiredIndicator />
                </Field.Label>
                <Textarea
                  name="home-address"
                  placeholder={t(
                    "page.membership.form.home_address.placeholder",
                  )}
                  size="sm"
                />
              </Field.Root>

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
// Membership Info Card
//------------------------------------------------------------------------------

type MembershipInfoCardProps = {
  body: string;
  title: string;
};

function MembershipInfoCard({ body, title }: MembershipInfoCardProps) {
  return (
    <Card.Root bg="transparent" borderColor="ggt.surface.border">
      <Card.Body gap={2}>
        <Heading size="sm">{title}</Heading>
        <Text fontSize="sm" whiteSpace="pre-line">
          {body}
        </Text>
      </Card.Body>
    </Card.Root>
  );
}
