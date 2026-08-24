import { Box, SimpleGrid, Text } from "@chakra-ui/react";
import useI18n from "~/i18n/use-i18n";

//------------------------------------------------------------------------------
// Membership Donation Cards
//------------------------------------------------------------------------------

export default function MembershipDonationCards() {
  const { t } = useI18n();

  return (
    <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} gap={3}>
      <DonationAmount
        accentColor="ggt.fg.primary"
        body={t("page.membership.donation.chf_5.body")}
        title={t("page.membership.donation.chf_5.title")}
      />
      <DonationAmount
        accentColor="#d53f8c"
        body={t("page.membership.donation.chf_10.body")}
        title={t("page.membership.donation.chf_10.title")}
      />
      <DonationAmount
        accentColor="#38a169"
        body={t("page.membership.donation.chf_20.body")}
        title={t("page.membership.donation.chf_20.title")}
      />
      <DonationAmount
        accentColor="#d69e2e"
        body={t("page.membership.donation.chf_50.body")}
        title={t("page.membership.donation.chf_50.title")}
      />
    </SimpleGrid>
  );
}

//------------------------------------------------------------------------------
// Donation Amount
//------------------------------------------------------------------------------

type DonationAmountProps = {
  accentColor: string;
  body: string;
  title: string;
};

function DonationAmount({ accentColor, body, title }: DonationAmountProps) {
  return (
    <Box
      bg="white"
      borderColor={accentColor}
      borderRadius="sm"
      borderWidth="1px"
      minH="8.5rem"
      overflow="hidden"
    >
      <Box bg={accentColor} h={1.5} />
      <Box p={4}>
        <Text color="black" fontSize="2xl" fontWeight="bold">
          {title}
        </Text>
        <Text color="black" fontSize="sm" mt={2}>
          {body}
        </Text>
      </Box>
    </Box>
  );
}
