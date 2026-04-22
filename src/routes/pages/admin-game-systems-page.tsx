import {
  Alert,
  Button,
  Card,
  HStack,
  Heading,
  Link,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useState } from "react";
import { Link as RouterLink } from "react-router";
import { type GameSystem, fetchGameSystems } from "~/domain/game-systems";
import { useAsyncEffect } from "~/hooks/use-async-effect";
import useI18n from "~/i18n/use-i18n";
import { type AsyncState, initial, loading } from "~/utils/async-state";
import AdminBreadcrumb from "../components/admin-breadcrumb";

//------------------------------------------------------------------------------
// Admin Game Systems Page
//------------------------------------------------------------------------------

export default function AdminGameSystemsPage() {
  const { t } = useI18n();
  const [gameSystemsState, setGameSystemsState] =
    useState<AsyncState<GameSystem[]>>(initial());

  useAsyncEffect(async (isActive) => {
    setGameSystemsState(loading());
    const gameSystems = await fetchGameSystems();
    if (!isActive()) return;
    setGameSystemsState(gameSystems);
  }, []);

  return (
    <VStack align="stretch" gap={3} w="full">
      <AdminBreadcrumb
        items={[
          {
            label: t("page.admin_game_systems.breadcrumb.admin"),
            to: "/admin",
          },
          { label: t("page.admin_game_systems.breadcrumb.game_systems") },
        ]}
      />

      <HStack justify="space-between">
        <VStack align="flex-start" gap={1}>
          <Heading size="3xl">{t("page.admin_game_systems.heading")}</Heading>
          <Text color="fg.muted">
            {t("page.admin_game_systems.description")}
          </Text>
        </VStack>

        <Button asChild size="xs">
          <RouterLink to="/admin/game-systems/new">
            {t("page.admin_game_systems.new")}
          </RouterLink>
        </Button>
      </HStack>

      {gameSystemsState.isLoading && <Spinner />}

      {gameSystemsState.hasError && (
        <Alert.Root status="error">
          <Alert.Description>
            {gameSystemsState.error || t("page.admin_game_systems.error")}
          </Alert.Description>
        </Alert.Root>
      )}

      {gameSystemsState.isSuccess && gameSystemsState.data.length === 0 && (
        <Text color="fg.muted">{t("page.admin_game_systems.empty")}</Text>
      )}

      {gameSystemsState.isSuccess && gameSystemsState.data.length > 0 && (
        <VStack align="stretch" gap={3}>
          {gameSystemsState.data.map((gameSystem) => (
            <GameSystemCard gameSystem={gameSystem} key={gameSystem.id} />
          ))}
        </VStack>
      )}
    </VStack>
  );
}

//------------------------------------------------------------------------------
// Game System Card
//------------------------------------------------------------------------------

function GameSystemCard({ gameSystem }: { gameSystem: GameSystem }) {
  const { t } = useI18n();

  return (
    <Card.Root>
      <Card.Body>
        <HStack align="flex-start" justify="space-between">
          <VStack align="flex-start" gap={1}>
            <Link asChild fontWeight="medium">
              <RouterLink to={`/admin/game-systems/${gameSystem.id}`}>
                {gameSystem.name}
              </RouterLink>
            </Link>
            {gameSystem.description && (
              <Text color="fg.muted" fontSize="sm">
                {gameSystem.description}
              </Text>
            )}
          </VStack>

          <Button asChild size="xs" variant="outline">
            <RouterLink to={`/admin/game-systems/${gameSystem.id}`}>
              {t("page.admin_game_systems.manage")}
            </RouterLink>
          </Button>
        </HStack>
      </Card.Body>
    </Card.Root>
  );
}
