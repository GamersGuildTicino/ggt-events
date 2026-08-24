import { Button, HStack, Heading, Text, VStack } from "@chakra-ui/react";
import { ChevronLeft } from "lucide-react";
import { Link as RouterLink } from "react-router";
import usePageTitle from "~/hooks/use-page-title";
import LocaleSelect from "~/i18n/locale-select";
import useI18n from "~/i18n/use-i18n";
import MembershipDonationCards from "../membership-page/membership-donation-cards";
import MembershipPaymentCards from "../membership-page/membership-payment-cards";

//------------------------------------------------------------------------------
// Donation Page
//------------------------------------------------------------------------------

export default function DonationPage() {
  const { t } = useI18n();

  usePageTitle(t("page.donation.heading"));

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
        <Heading size="3xl">{t("page.donation.heading")}</Heading>
        <Text>{t("page.donation.description")}</Text>
      </VStack>

      <VStack align="stretch" gap={6}>
        <VStack align="stretch" gap={4}>
          <Text whiteSpace="pre-line">{t("page.donation.info")}</Text>
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
