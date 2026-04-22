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
import {
  type GameSystem,
  deleteGameSystem,
  fetchGameSystems,
} from "~/domain/game-systems";
import { useAsyncEffect } from "~/hooks/use-async-effect";
import useI18n from "~/i18n/use-i18n";
import { type AsyncState, initial, loading } from "~/utils/async-state";
import AdminBreadcrumb from "../components/admin-breadcrumb";
import AdminContentColumns from "../components/admin-content-columns";

//------------------------------------------------------------------------------
// Admin Game Systems Page
//------------------------------------------------------------------------------

export default function AdminGameSystemsPage() {
  const { t, ti } = useI18n();
  const [deleteError, setDeleteError] = useState("");
  const [deletingGameSystemId, setDeletingGameSystemId] = useState<
    GameSystem["id"] | null
  >(null);
  const [gameSystemsState, setGameSystemsState] =
    useState<AsyncState<GameSystem[]>>(initial());

  const loadGameSystems = async () => {
    setGameSystemsState(loading());
    const gameSystems = await fetchGameSystems();
    setGameSystemsState(gameSystems);
  };

  useAsyncEffect(async (isActive) => {
    setGameSystemsState(loading());
    const gameSystems = await fetchGameSystems();
    if (!isActive()) return;
    setGameSystemsState(gameSystems);
  }, []);

  const handleDeleteGameSystem = async (gameSystem: GameSystem) => {
    const message = ti(
      "page.admin_game_systems.delete.confirm",
      gameSystem.name,
    );
    const confirmed = window.confirm(message);
    if (!confirmed) return;

    setDeleteError("");
    setDeletingGameSystemId(gameSystem.id);
    const error = await deleteGameSystem(gameSystem.id);
    setDeletingGameSystemId(null);

    if (error) return setDeleteError(error);
    await loadGameSystems();
  };

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

      {deleteError && (
        <Alert.Root status="error">
          <Alert.Description>{t(deleteError)}</Alert.Description>
        </Alert.Root>
      )}

      {gameSystemsState.isSuccess && gameSystemsState.data.length === 0 && (
        <Text color="fg.muted">{t("page.admin_game_systems.empty")}</Text>
      )}

      {gameSystemsState.isSuccess && gameSystemsState.data.length > 0 && (
        <AdminContentColumns maxColumns={3}>
          {gameSystemsState.data.map((gameSystem) => (
            <GameSystemCard
              deleting={deletingGameSystemId === gameSystem.id}
              gameSystem={gameSystem}
              key={gameSystem.id}
              onDelete={handleDeleteGameSystem}
            />
          ))}
        </AdminContentColumns>
      )}
    </VStack>
  );
}

//------------------------------------------------------------------------------
// Game System Card
//------------------------------------------------------------------------------

function GameSystemCard({
  deleting,
  gameSystem,
  onDelete,
}: {
  deleting: boolean;
  gameSystem: GameSystem;
  onDelete: (gameSystem: GameSystem) => void;
}) {
  const { t } = useI18n();

  return (
    <Card.Root>
      <Card.Body py={3}>
        <HStack justify="space-between">
          <Link asChild fontWeight="medium">
            <RouterLink to={`/admin/game-systems/${gameSystem.id}`}>
              {gameSystem.name}
            </RouterLink>
          </Link>

          <HStack gap={2}>
            <Button asChild size="xs" variant="outline">
              <RouterLink to={`/admin/game-systems/${gameSystem.id}`}>
                {t("page.admin_game_systems.manage")}
              </RouterLink>
            </Button>
            <Button
              colorPalette="red"
              loading={deleting}
              onClick={() => onDelete(gameSystem)}
              size="xs"
              variant="outline"
            >
              {t("page.admin_game_systems.delete")}
            </Button>
          </HStack>
        </HStack>
      </Card.Body>
    </Card.Root>
  );
}
