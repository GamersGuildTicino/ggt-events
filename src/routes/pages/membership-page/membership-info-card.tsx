import { Card, Heading, Text } from "@chakra-ui/react";

//------------------------------------------------------------------------------
// Membership Info Card
//------------------------------------------------------------------------------

type MembershipInfoCardProps = {
  body: string;
  title: string;
};

export default function MembershipInfoCard({
  body,
  title,
}: MembershipInfoCardProps) {
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
