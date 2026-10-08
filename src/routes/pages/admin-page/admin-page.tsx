import { Button, Card, Heading, Spinner, Text, VStack } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router";
import useAdminAccess from "~/auth/use-admin-access";
import usePageTitle from "~/hooks/use-page-title";
import useI18n from "~/i18n/use-i18n";
import AppAlert from "~/ui/app-alert";
import AdminContentColumns from "../../components/admin-content-columns";

//------------------------------------------------------------------------------
// Admin Page
//------------------------------------------------------------------------------

export default function AdminPage() {
  const { t } = useI18n();
  const access = useAdminAccess();

  usePageTitle(t("page.admin.heading"));

  if (access.isLoading || access.status === "initial") return <Spinner />;
  if (access.hasError)
    return <AppAlert status="error">{t(access.error)}</AppAlert>;

  return (
    <VStack align="stretch" gap={6} w="full">
      <VStack align="flex-start" gap={1}>
        <Heading size="3xl">{t("page.admin.heading")}</Heading>
        <Text color="fg.muted">{t("page.admin.description")}</Text>
      </VStack>

      <AdminContentColumns maxColumns={3}>
        <Section
          buttonText={t("page.admin.events.open")}
          description={t("page.admin.events.description")}
          primary
          title={t("page.admin.events.heading")}
          to="/admin/events"
        />

        {access.data.isAdmin && (
          <>
            <Section
              buttonText={t("page.admin.create_event.open")}
              description={t("page.admin.create_event.description")}
              title={t("page.admin.create_event.heading")}
              to="/admin/events/new"
            />

            <Section
              buttonText={t("page.admin.game_systems.open")}
              description={t("page.admin.game_systems.description")}
              title={t("page.admin.game_systems.heading")}
              to="/admin/game-systems"
            />

            <Section
              buttonText={t("page.admin.home_message.open")}
              description={t("page.admin.home_message.description")}
              title={t("page.admin.home_message.heading")}
              to="/admin/home-message"
            />

            <Section
              buttonText={t("page.admin.memberships.open")}
              description={t("page.admin.memberships.description")}
              title={t("page.admin.memberships.heading")}
              to="/admin/memberships"
            />

            <Section
              buttonText={t("page.admin.game_masters.open")}
              description={t("page.admin.game_masters.description")}
              title={t("page.admin.game_masters.heading")}
              to="/admin/game-masters"
            />
          </>
        )}
      </AdminContentColumns>
    </VStack>
  );
}

//------------------------------------------------------------------------------
// Section
//------------------------------------------------------------------------------

type SectionProps = {
  buttonText: string;
  description: string;
  primary?: boolean;
  title: string;
  to: string;
};

function Section({
  buttonText,
  description,
  primary = false,
  title,
  to,
}: SectionProps) {
  return (
    <Card.Root>
      <Card.Body gap={4}>
        <VStack align="flex-start" flex={1} gap={2}>
          <Heading size="md">{title}</Heading>
          <Text color="fg.muted" fontSize="sm">
            {description}
          </Text>
        </VStack>
        <Button asChild size="sm" variant={primary ? "solid" : "outline"}>
          <RouterLink to={to}>{buttonText}</RouterLink>
        </Button>
      </Card.Body>
    </Card.Root>
  );
}
