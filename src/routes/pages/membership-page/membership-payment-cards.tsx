import { SimpleGrid } from "@chakra-ui/react";
import useI18n from "~/i18n/use-i18n";
import MembershipInfoCard from "./membership-info-card";

//------------------------------------------------------------------------------
// Membership Payment Cards
//------------------------------------------------------------------------------

export default function MembershipPaymentCards() {
  const { t } = useI18n();

  return (
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
  );
}
