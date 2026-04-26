import { Button, Card, HStack, Link } from "@chakra-ui/react";
import { useCallback } from "react";
import { Link as RouterLink } from "react-router";
import type { GameSystem } from "~/domain/game-systems";
import useI18n from "~/i18n/use-i18n";

//------------------------------------------------------------------------------
// Admin Game System Card
//------------------------------------------------------------------------------

type AdminGameSystemCardProps = {
  deleting: boolean;
  gameSystem: GameSystem;
  onDelete: (gameSystem: GameSystem) => void;
};

export default function AdminGameSystemCard({
  deleting,
  gameSystem,
  onDelete,
}: AdminGameSystemCardProps) {
  const { t } = useI18n();

  const deleteAdminGameSystemCard = useCallback(() => {
    onDelete(gameSystem);
  }, [gameSystem, onDelete]);

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
              onClick={deleteAdminGameSystemCard}
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
