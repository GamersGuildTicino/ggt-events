import {
  Button,
  Field,
  HStack,
  Heading,
  Input,
  Spinner,
  Table,
  Text,
  VStack,
} from "@chakra-ui/react";
import { ArrowDown, ArrowUp, ChevronsUpDown, Trash2 } from "lucide-react";
import { type ReactNode, useCallback, useMemo, useState } from "react";
import { inviteEventManager } from "~/domain/event-managers";
import usePageTitle from "~/hooks/use-page-title";
import useI18n from "~/i18n/use-i18n";
import AppAlert from "~/ui/app-alert";
import IconButton from "~/ui/icon-button";
import { toaster } from "~/ui/toaster";
import {
  type AsyncState,
  initial,
  loading,
  success,
} from "~/utils/async-state";
import AdminBreadcrumb from "../../components/admin-breadcrumb";
import useAdminGameMasters from "./use-admin-game-masters";

//------------------------------------------------------------------------------
// Admin Game Masters Page
//------------------------------------------------------------------------------

export default function AdminGameMastersPage() {
  const { locale, t } = useI18n();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [saveState, setSaveState] = useState<AsyncState>(initial());
  const {
    eventManagersState,
    loadEventManagers,
    removeError,
    removeManager,
    removingUserId,
  } = useAdminGameMasters();

  usePageTitle(t("page.admin_game_masters.heading"));

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaveState(loading());
    const error = await inviteEventManager(email, displayName);
    if (error) {
      setSaveState({
        error,
        hasError: true,
        isLoading: false,
        isSuccess: false,
        status: "failure",
      });
      return;
    }
    setEmail("");
    setDisplayName("");
    setSaveState(success(undefined));
    await loadEventManagers();
    toaster.success({ description: t("page.admin_game_masters.invited") });
  };

  return (
    <VStack align="stretch" gap={4} w="full">
      <AdminBreadcrumb
        items={[
          {
            label: t("page.admin_game_masters.breadcrumb.admin"),
            to: "/admin",
          },
          { label: t("page.admin_game_masters.heading") },
        ]}
      />

      <Heading size="3xl">{t("page.admin_game_masters.heading")}</Heading>

      <VStack align="stretch" gap={3}>
        <Heading size="md">{t("page.admin_game_masters.add")}</Heading>
        <form onSubmit={submit}>
          <HStack align="end" gap={3}>
            <Field.Root required>
              <Field.Label>{t("page.admin_game_masters.name")}</Field.Label>
              <Input
                onChange={(event) => setDisplayName(event.target.value)}
                placeholder={t("page.admin_game_masters.name_placeholder")}
                value={displayName}
              />
            </Field.Root>
            <Field.Root required>
              <Field.Label>{t("page.admin_game_masters.email")}</Field.Label>
              <Input
                onChange={(event) => setEmail(event.target.value)}
                placeholder={t("page.admin_game_masters.email_placeholder")}
                type="email"
                value={email}
              />
            </Field.Root>
            <Button loading={saveState.isLoading} type="submit">
              {t("page.admin_game_masters.add")}
            </Button>
          </HStack>
        </form>
        {saveState.hasError && (
          <AppAlert status="error">{t(saveState.error)}</AppAlert>
        )}
      </VStack>

      {eventManagersState.isLoading && <Spinner />}
      {eventManagersState.hasError && (
        <AppAlert status="error">{t(eventManagersState.error)}</AppAlert>
      )}
      {removeError && (
        <AppAlert dismissible status="error">
          {t(removeError)}
        </AppAlert>
      )}

      {eventManagersState.isSuccess && eventManagersState.data.length === 0 && (
        <Text color="fg.muted">{t("page.admin_game_masters.empty")}</Text>
      )}

      {eventManagersState.isSuccess && eventManagersState.data.length > 0 && (
        <AdminGameMastersTable
          locale={locale}
          managers={eventManagersState.data}
          onRemove={(userId) =>
            void removeManager(
              userId,
              window.confirm(t("page.admin_game_masters.remove.confirm")),
            )
          }
          removingUserId={removingUserId}
        />
      )}
    </VStack>
  );
}

type AdminGameMastersTableProps = {
  locale: string;
  managers: import("~/domain/event-managers").EventManager[];
  onRemove: (userId: string) => void;
  removingUserId: string | null;
};

function AdminGameMastersTable({
  locale,
  managers,
  onRemove,
  removingUserId,
}: AdminGameMastersTableProps) {
  const { t } = useI18n();
  const [sort, setSort] = useState<GameMasterSort>({
    direction: "asc",
    field: "displayName",
  });
  const sortedManagers = useMemo(
    () => sortGameMasters(managers, sort, locale),
    [locale, managers, sort],
  );
  const toggleSort = useCallback((field: GameMasterSort["field"]) => {
    setSort((currentSort) => ({
      direction:
        currentSort.field === field && currentSort.direction === "asc" ?
          "desc"
        : "asc",
      field,
    }));
  }, []);

  return (
    <Table.ScrollArea>
      <Table.Root size="sm">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader>
              <GameMasterSortButton
                active={sort.field === "displayName"}
                direction={sort.direction}
                onClick={() => toggleSort("displayName")}
              >
                {t("page.admin_game_masters.name")}
              </GameMasterSortButton>
            </Table.ColumnHeader>
            <Table.ColumnHeader>
              <GameMasterSortButton
                active={sort.field === "email"}
                direction={sort.direction}
                onClick={() => toggleSort("email")}
              >
                {t("page.admin_game_masters.email")}
              </GameMasterSortButton>
            </Table.ColumnHeader>
            <Table.ColumnHeader>
              <GameMasterSortButton
                active={sort.field === "eventCount"}
                direction={sort.direction}
                onClick={() => toggleSort("eventCount")}
              >
                {t("page.admin_game_masters.events")}
              </GameMasterSortButton>
            </Table.ColumnHeader>
            <Table.ColumnHeader textAlign="end">
              <HStack
                fontSize="xs"
                fontWeight="inherit"
                h="8"
                justify="flex-end"
                px={0}
                w="full"
              >
                {t("page.admin_game_masters.actions")}
              </HStack>
            </Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {sortedManagers.map((manager) => (
            <Table.Row key={manager.userId}>
              <Table.Cell fontWeight="medium" whiteSpace="nowrap">
                {manager.displayName || manager.email}
              </Table.Cell>
              <Table.Cell whiteSpace="nowrap">{manager.email}</Table.Cell>
              <Table.Cell>{manager.eventIds.length}</Table.Cell>
              <Table.Cell textAlign="end">
                <IconButton
                  Icon={Trash2}
                  aria-label={t("page.admin_game_masters.remove")}
                  colorPalette="red"
                  loading={removingUserId === manager.userId}
                  onClick={() => onRemove(manager.userId)}
                  size="xs"
                  variant="ghost"
                />
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </Table.ScrollArea>
  );
}

type GameMasterSort = {
  direction: "asc" | "desc";
  field: "displayName" | "email" | "eventCount";
};

type GameMasterSortButtonProps = {
  active: boolean;
  children: ReactNode;
  direction: GameMasterSort["direction"];
  onClick: () => void;
};

function GameMasterSortButton({
  active,
  children,
  direction,
  onClick,
}: GameMasterSortButtonProps) {
  const Icon =
    !active ? ChevronsUpDown
    : direction === "asc" ? ArrowUp
    : ArrowDown;

  return (
    <Button
      fontWeight="inherit"
      justifyContent="space-between"
      onClick={onClick}
      px={0}
      size="xs"
      variant="ghost"
      w="full"
    >
      {children}
      <Icon />
    </Button>
  );
}

function sortGameMasters(
  managers: AdminGameMastersTableProps["managers"],
  sort: GameMasterSort,
  locale: string,
) {
  const direction = sort.direction === "asc" ? 1 : -1;

  return [...managers].sort((a, b) => {
    if (sort.field === "eventCount") {
      return (a.eventIds.length - b.eventIds.length) * direction;
    }

    const aValue =
      sort.field === "displayName" ? a.displayName || a.email : a.email;
    const bValue =
      sort.field === "displayName" ? b.displayName || b.email : b.email;
    return aValue.localeCompare(bValue, locale) * direction;
  });
}
