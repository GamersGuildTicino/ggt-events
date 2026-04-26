import { Text, VStack } from "@chakra-ui/react";

//------------------------------------------------------------------------------
// Event Detail Row
//------------------------------------------------------------------------------

type EventDetailRowProps = {
  label: string;
  value: string;
};

export default function EventDetailRow({ label, value }: EventDetailRowProps) {
  return (
    <VStack align="flex-start" gap={1}>
      <Text color="cyan.100" fontSize="xs" fontWeight="bold">
        {label}
      </Text>
      <Text fontSize="md" fontWeight="semibold">
        {value}
      </Text>
    </VStack>
  );
}
