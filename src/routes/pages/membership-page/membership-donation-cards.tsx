import { SimpleGrid } from "@chakra-ui/react";
import useI18n from "~/i18n/use-i18n";
import MembershipInfoCard from "./membership-info-card";

//------------------------------------------------------------------------------
// Membership Donation Cards
//------------------------------------------------------------------------------

export default function MembershipDonationCards() {
  const { t } = useI18n();

  return (
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
  );
}
