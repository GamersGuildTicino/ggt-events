import { Text, VStack } from "@chakra-ui/react";

//------------------------------------------------------------------------------
// Home Date Badge
//------------------------------------------------------------------------------

type HomeDateBadgeProps = {
  date: Date;
  locale: string;
};

export default function HomeDateBadge({ date, locale }: HomeDateBadgeProps) {
  const month = new Intl.DateTimeFormat(locale, { month: "short" }).format(
    date,
  );
  const day = new Intl.DateTimeFormat(locale, { day: "2-digit" }).format(date);

  return (
    <VStack
      bg="orange.50"
      borderColor="orange.200"
      borderRadius="xl"
      borderWidth="1px"
      color="orange.950"
      flexShrink={0}
      gap={0}
      minW="4.5rem"
      px={3}
      py={2}
    >
      <Text fontSize="xs" fontWeight="bold" textTransform="uppercase">
        {month}
      </Text>
      <Text fontSize="2xl" fontWeight="bold" lineHeight={1}>
        {day}
      </Text>
    </VStack>
  );
}
