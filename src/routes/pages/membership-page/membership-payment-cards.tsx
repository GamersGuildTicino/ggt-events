import { Box, HStack, Heading, SimpleGrid, Text } from "@chakra-ui/react";
import { Banknote, Landmark, Smartphone } from "lucide-react";
import type { ReactNode } from "react";
import useI18n from "~/i18n/use-i18n";

//------------------------------------------------------------------------------
// Membership Payment Cards
//------------------------------------------------------------------------------

export default function MembershipPaymentCards() {
  const { t } = useI18n();

  return (
    <SimpleGrid columns={{ base: 1, lg: 3 }} gap={3}>
      <PaymentMethod
        body={t("page.membership.payment.bank_transfer.body")}
        icon={<Landmark size={17} />}
        title={t("page.membership.payment.bank_transfer.title")}
      />
      <PaymentMethod
        body={t("page.membership.payment.twint.body")}
        icon={<Smartphone size={17} />}
        title={t("page.membership.payment.twint.title")}
      />
      <PaymentMethod
        body={t("page.membership.payment.cash.body")}
        icon={<Banknote size={17} />}
        title={t("page.membership.payment.cash.title")}
      />
    </SimpleGrid>
  );
}

//------------------------------------------------------------------------------
// Payment Method
//------------------------------------------------------------------------------

type PaymentMethodProps = {
  body: string;
  icon: ReactNode;
  title: string;
};

function PaymentMethod({ body, icon, title }: PaymentMethodProps) {
  return (
    <Box
      bg="white"
      borderColor="ggt.surface.border"
      borderRadius="sm"
      borderWidth="1px"
      p={4}
    >
      <HStack align="center" gap={3}>
        <Box
          alignItems="center"
          bg="bg.emphasized"
          borderRadius="full"
          color="fg"
          display="flex"
          flexShrink={0}
          h={8}
          justifyContent="center"
          w={8}
        >
          {icon}
        </Box>
        <Heading color="black" size="sm">
          {title}
        </Heading>
      </HStack>
      <Text color="black" fontSize="sm" mt={3} whiteSpace="pre-line">
        {body}
      </Text>
    </Box>
  );
}
