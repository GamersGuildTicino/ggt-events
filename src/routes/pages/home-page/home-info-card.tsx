import { Card, Heading, Text } from "@chakra-ui/react";

//------------------------------------------------------------------------------
// Home Info Card
//------------------------------------------------------------------------------

type HomeInfoCardProps = {
  description: string;
  title: string;
};

export default function HomeInfoCard({
  description,
  title,
}: HomeInfoCardProps) {
  return (
    <Card.Root bg="bg.subtle">
      <Card.Body gap={2}>
        <Heading size="md">{title}</Heading>
        <Text color="fg.muted" fontSize="sm">
          {description}
        </Text>
      </Card.Body>
    </Card.Root>
  );
}
