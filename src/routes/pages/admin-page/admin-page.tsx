import { Button, Card, Heading, Text, VStack } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router";
import useI18n from "~/i18n/use-i18n";
import AdminContentColumns from "../../components/admin-content-columns";

//------------------------------------------------------------------------------
// Admin Page
//------------------------------------------------------------------------------

export default function AdminPage() {
  const { t } = useI18n();

  return (
    <VStack align="stretch" gap={6} w="full">
      <VStack align="flex-start" gap={1}>
        <Heading size="3xl">{t("page.admin.heading")}</Heading>
        <Text color="fg.muted">{t("page.admin.description")}</Text>
      </VStack>

      <AdminContentColumns maxColumns={3}>
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

        <Card.Root>
          <Card.Body gap={4}>
            <VStack align="flex-start" gap={2}>
              <Heading size="md">
                {t("page.admin.game_systems.heading")}
              </Heading>
              <Text color="fg.muted" fontSize="sm">
                {t("page.admin.game_systems.description")}
              </Text>
            </VStack>
            <Button asChild size="sm" variant="outline">
              <RouterLink to="/admin/game-systems">
                {t("page.admin.game_systems.open")}
              </RouterLink>
            </Button>
          </Card.Body>
        </Card.Root>
      </AdminContentColumns>
    </VStack>
  );
}
