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
    <VStack align="flex-end" color="fg.default" flexShrink={0} gap={0}>
      <Text
        color="fg.muted"
        fontSize="xs"
        fontWeight="bold"
        letterSpacing="0.08em"
        textTransform="uppercase"
      >
        {month}
      </Text>
      <Text fontSize="3xl" fontWeight="bold" lineHeight={0.9}>
        {day}
      </Text>
    </VStack>
  );
}
