import {
  Button,
  Card,
  Center,
  Heading,
  SimpleGrid,
  Text,
  VStack,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router";
import useI18n from "~/i18n/use-i18n";

//------------------------------------------------------------------------------
// Admin Page
//------------------------------------------------------------------------------

export default function AdminPage() {
  const { t } = useI18n();

  return (
    <Center px={8} py={4} w="full">
      <VStack align="stretch" gap={6} maxW="40em" w="full">
        <VStack align="flex-start" gap={1}>
          <Heading size="3xl">{t("page.admin.heading")}</Heading>
          <Text color="fg.muted">{t("page.admin.description")}</Text>
        </VStack>

        <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
          <Card.Root>
            <Card.Body gap={4}>
              <VStack align="flex-start" gap={2}>
                <Heading size="md">{t("page.admin.events.heading")}</Heading>
                <Text color="fg.muted" fontSize="sm">
                  {t("page.admin.events.description")}
                </Text>
              </VStack>
              <Button asChild size="sm">
                <RouterLink to="/admin/events">
                  {t("page.admin.events.open")}
                </RouterLink>
              </Button>
            </Card.Body>
          </Card.Root>

          <Card.Root>
            <Card.Body gap={4}>
              <VStack align="flex-start" gap={2}>
                <Heading size="md">
                  {t("page.admin.create_event.heading")}
                </Heading>
                <Text color="fg.muted" fontSize="sm">
                  {t("page.admin.create_event.description")}
                </Text>
              </VStack>
              <Button asChild size="sm" variant="outline">
                <RouterLink to="/admin/events/new">
                  {t("page.admin.create_event.open")}
                </RouterLink>
              </Button>
            </Card.Body>
          </Card.Root>
        </SimpleGrid>
      </VStack>
    </Center>
  );
}
