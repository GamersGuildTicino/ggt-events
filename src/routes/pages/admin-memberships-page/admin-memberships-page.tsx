import {
  Badge,
  Button,
  Dialog,
  HStack,
  Heading,
  Menu as ChakraMenu,
  Portal,
  Spinner,
  Table,
  Text,
  VStack,
} from "@chakra-ui/react";
import {
  ArrowDown,
  ArrowUp,
  ChevronsUpDown,
  EllipsisVertical,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { type ReactNode, useCallback, useMemo, useState } from "react";
import type { AdminMembershipInput, Membership } from "~/domain/memberships";
import usePageTitle from "~/hooks/use-page-title";
import useI18n from "~/i18n/use-i18n";
import AppAlert from "~/ui/app-alert";
import IconButton from "~/ui/icon-button";
import { toaster } from "~/ui/toaster";
import AdminBreadcrumb from "../../components/admin-breadcrumb";
import AdminMembershipForm from "./admin-membership-form";
import useAdminMemberships from "./use-admin-memberships";

//------------------------------------------------------------------------------
// Admin Memberships Page
//------------------------------------------------------------------------------

export default function AdminMembershipsPage() {
  const { locale, t, ti } = useI18n();
  const [creating, setCreating] = useState(false);
  const [editingMembership, setEditingMembership] = useState<Membership | null>(
    null,
  );
  const {
    createAdminMembershipEntry,
    deleteAdminMembershipEntry,
    deleteError,
    deletingMembershipId,
    membershipsState,
    resetSaveState,
    saveState,
    updateAdminMembershipEntry,
  } = useAdminMemberships();

  usePageTitle(t("page.admin_memberships.heading"));

  const memberships = useMemo(
    () => (membershipsState.isSuccess ? membershipsState.data : []),
    [membershipsState],
  );
  const newsletterMemberships = useMemo(
    () => memberships.filter((membership) => membership.newsletterAccepted),
    [memberships],
  );

  const openCreateDialog = useCallback(() => {
    resetSaveState();
    setEditingMembership(null);
    setCreating(true);
  }, [resetSaveState]);

  const openEditDialog = useCallback(
    (membership: Membership) => {
      resetSaveState();
      setCreating(false);
      setEditingMembership(membership);
    },
    [resetSaveState],
  );

  const closeSaveDialog = useCallback(() => {
    setCreating(false);
    setEditingMembership(null);
  }, []);

  const createAdminMembership = useCallback(
    async (membership: AdminMembershipInput) => {
      const created = await createAdminMembershipEntry(membership);

      if (!created) return;

      toaster.success({
        description: ti(
          "page.admin_memberships.created_for",
          membership.fullName,
        ),
        id: "admin-membership-created",
      });
      closeSaveDialog();
    },
    [closeSaveDialog, createAdminMembershipEntry, ti],
  );

  const updateAdminMembership = useCallback(
    async (membership: AdminMembershipInput) => {
      if (!editingMembership) return;

      const updated = await updateAdminMembershipEntry(
        editingMembership.id,
        membership,
      );

      if (!updated) return;

      toaster.success({
        description: ti(
          "page.admin_memberships.updated_for",
          membership.fullName,
        ),
        id: `admin-membership-updated-${editingMembership.id}`,
      });
      closeSaveDialog();
    },
    [closeSaveDialog, editingMembership, ti, updateAdminMembershipEntry],
  );

  const confirmAdminMembershipDelete = useCallback(
    (membership: Membership) =>
      window.confirm(
        ti("page.admin_memberships.delete.confirm", membership.fullName),
      ),
    [ti],
  );

  const deleteAdminMembership = useCallback(
    async (membership: Membership) => {
      const deleted = await deleteAdminMembershipEntry(
        membership.id,
        confirmAdminMembershipDelete(membership),
      );

      if (!deleted) return;

      toaster.success({
        description: ti("page.admin_memberships.deleted", membership.fullName),
        id: `admin-membership-deleted-${membership.id}`,
      });
    },
    [confirmAdminMembershipDelete, deleteAdminMembershipEntry, ti],
  );

  const copyTextToClipboard = useCallback(
    async (value: string, successMessage: string, errorMessage: string) => {
      try {
        await navigator.clipboard.writeText(value);
        toaster.success({
          description: successMessage,
          id: "admin-memberships-copy-success",
        });
      } catch {
        toaster.error({
          description: errorMessage,
          id: "admin-memberships-copy-error",
        });
      }
    },
    [],
  );

  const copyMembershipEmails = useCallback(
    () =>
      void copyTextToClipboard(
        memberships.map((membership) => membership.email).join(", "),
        t("page.admin_memberships.copy_emails_success"),
        t("page.admin_memberships.copy_error"),
      ),
    [copyTextToClipboard, memberships, t],
  );

  const copyNewsletterMembershipEmails = useCallback(
    () =>
      void copyTextToClipboard(
        newsletterMemberships.map((membership) => membership.email).join(", "),
        t("page.admin_memberships.copy_newsletter_emails_success"),
        t("page.admin_memberships.copy_error"),
      ),
    [copyTextToClipboard, newsletterMemberships, t],
  );

  const copyMembershipsCsv = useCallback(
    () =>
      void copyTextToClipboard(
        membershipsToCsv(memberships, t),
        t("page.admin_memberships.copy_csv_success"),
        t("page.admin_memberships.copy_error"),
      ),
    [copyTextToClipboard, memberships, t],
  );

  return (
    <VStack align="stretch" gap={3} w="full">
      <AdminBreadcrumb
        items={[
          { label: t("page.admin_memberships.breadcrumb.admin"), to: "/admin" },
          { label: t("page.admin_memberships.breadcrumb.memberships") },
        ]}
      />

      <HStack align="center" justify="space-between">
        <Heading size="3xl">{t("page.admin_memberships.heading")}</Heading>

        <HStack>
          <Button onClick={openCreateDialog} size="sm">
            <Plus />
            {t("page.admin_memberships.form.create")}
          </Button>

          <AdminMembershipsActionsMenu
            canCopy={memberships.length > 0}
            canCopyNewsletter={newsletterMemberships.length > 0}
            onCopyCsv={copyMembershipsCsv}
            onCopyEmails={copyMembershipEmails}
            onCopyNewsletterEmails={copyNewsletterMembershipEmails}
          />
        </HStack>
      </HStack>

      <Dialog.Root
        onOpenChange={(details) => {
          if (!details.open) closeSaveDialog();
        }}
        open={creating || Boolean(editingMembership)}
      >
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>
                  {editingMembership ?
                    t("page.admin_memberships.form.edit_heading")
                  : t("page.admin_memberships.form.create_heading")}
                </Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                <AdminMembershipForm
                  disabled={saveState.isLoading}
                  error={saveState.hasError ? saveState.error : ""}
                  initialValue={editingMembership ?? undefined}
                  key={editingMembership?.id ?? "new"}
                  onCancelEdit={closeSaveDialog}
                  onSubmit={
                    editingMembership ?
                      updateAdminMembership
                    : createAdminMembership
                  }
                  showHeading={false}
                  surface="plain"
                  withinDialog
                />
              </Dialog.Body>
              <Dialog.CloseTrigger />
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>

      {membershipsState.isLoading && <Spinner />}

      {membershipsState.hasError && (
        <AppAlert status="error">{t(membershipsState.error)}</AppAlert>
      )}

      {deleteError && (
        <AppAlert dismissible status="error">
          {t(deleteError)}
        </AppAlert>
      )}

      {membershipsState.isSuccess && membershipsState.data.length === 0 && (
        <Text color="fg.muted">{t("page.admin_memberships.empty")}</Text>
      )}

      {membershipsState.isSuccess && membershipsState.data.length > 0 && (
        <AdminMembershipsTable
          deletingMembershipId={deletingMembershipId}
          locale={locale}
          memberships={membershipsState.data}
          onDelete={deleteAdminMembership}
          onEdit={openEditDialog}
        />
      )}
    </VStack>
  );
}

//------------------------------------------------------------------------------
// Admin Memberships Actions Menu
//------------------------------------------------------------------------------

type AdminMembershipsActionsMenuProps = {
  canCopy: boolean;
  canCopyNewsletter: boolean;
  onCopyCsv: () => void;
  onCopyEmails: () => void;
  onCopyNewsletterEmails: () => void;
};

function AdminMembershipsActionsMenu({
  canCopy,
  canCopyNewsletter,
  onCopyCsv,
  onCopyEmails,
  onCopyNewsletterEmails,
}: AdminMembershipsActionsMenuProps) {
  const { t } = useI18n();

  return (
    <ChakraMenu.Root positioning={{ placement: "bottom-end" }}>
      <ChakraMenu.Trigger asChild>
        <IconButton
          Icon={EllipsisVertical}
          aria-label={t("page.admin_memberships.actions")}
          size="sm"
          variant="ghost"
        />
      </ChakraMenu.Trigger>
      <Portal>
        <ChakraMenu.Positioner>
          <ChakraMenu.Content minW="14rem">
            <ChakraMenu.Item
              disabled={!canCopy}
              onClick={onCopyEmails}
              value="copy-emails"
            >
              {t("page.admin_memberships.copy_emails")}
            </ChakraMenu.Item>
            <ChakraMenu.Item
              disabled={!canCopyNewsletter}
              onClick={onCopyNewsletterEmails}
              value="copy-newsletter-emails"
            >
              {t("page.admin_memberships.copy_newsletter_emails")}
            </ChakraMenu.Item>
            <ChakraMenu.Separator />
            <ChakraMenu.Item
              disabled={!canCopy}
              onClick={onCopyCsv}
              value="copy-csv"
            >
              {t("page.admin_memberships.copy_csv")}
            </ChakraMenu.Item>
          </ChakraMenu.Content>
        </ChakraMenu.Positioner>
      </Portal>
    </ChakraMenu.Root>
  );
}

//------------------------------------------------------------------------------
// Admin Memberships Table
//------------------------------------------------------------------------------

type AdminMembershipsTableProps = {
  deletingMembershipId: Membership["id"] | null;
  locale: string;
  memberships: Membership[];
  onDelete: (membership: Membership) => void;
  onEdit: (membership: Membership) => void;
};

function AdminMembershipsTable({
  deletingMembershipId,
  locale,
  memberships,
  onDelete,
  onEdit,
}: AdminMembershipsTableProps) {
  const { t } = useI18n();
  const [sort, setSort] = useState<MembershipSort>({
    direction: "desc",
    field: "createdAt",
  });
  const dateFormatter = new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  });
  const sortedMemberships = useMemo(
    () => sortMemberships(memberships, sort, locale),
    [locale, memberships, sort],
  );

  const toggleSort = useCallback((field: MembershipSort["field"]) => {
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
              <MembershipSortButton
                active={sort.field === "createdAt"}
                direction={sort.direction}
                onClick={() => toggleSort("createdAt")}
              >
                {t("page.admin_memberships.table.created_at")}
              </MembershipSortButton>
            </Table.ColumnHeader>
            <Table.ColumnHeader>
              <MembershipSortButton
                active={sort.field === "fullName"}
                direction={sort.direction}
                onClick={() => toggleSort("fullName")}
              >
                {t("page.admin_memberships.table.full_name")}
              </MembershipSortButton>
            </Table.ColumnHeader>
            <Table.ColumnHeader>
              {t("page.admin_memberships.table.email")}
            </Table.ColumnHeader>
            <Table.ColumnHeader>
              {t("page.admin_memberships.table.phone_number")}
            </Table.ColumnHeader>
            <Table.ColumnHeader>
              {t("page.admin_memberships.table.home_address")}
            </Table.ColumnHeader>
            <Table.ColumnHeader>
              {t("page.admin_memberships.table.payment_method")}
            </Table.ColumnHeader>
            <Table.ColumnHeader>
              {t("page.admin_memberships.table.newsletter")}
            </Table.ColumnHeader>
            <Table.ColumnHeader textAlign="end">
              {t("page.admin_memberships.table.actions")}
            </Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {sortedMemberships.map((membership) => (
            <Table.Row key={membership.id}>
              <Table.Cell whiteSpace="nowrap">
                {dateFormatter.format(membership.createdAt)}
              </Table.Cell>
              <Table.Cell fontWeight="medium">{membership.fullName}</Table.Cell>
              <Table.Cell>{membership.email}</Table.Cell>
              <Table.Cell>{membership.phoneNumber || "-"}</Table.Cell>
              <Table.Cell maxW="20rem" whiteSpace="pre">
                {membership.homeAddress}
              </Table.Cell>
              <Table.Cell>
                <Badge variant="surface">
                  {t(
                    `enum.membership_payment_method.${membership.paymentMethod}`,
                  )}
                </Badge>
              </Table.Cell>
              <Table.Cell>
                {membership.newsletterAccepted ?
                  t("page.admin_memberships.table.yes")
                : t("page.admin_memberships.table.no")}
              </Table.Cell>
              <Table.Cell textAlign="end">
                <IconButton
                  Icon={Pencil}
                  aria-label={t("page.admin_memberships.edit")}
                  onClick={() => onEdit(membership)}
                  size="xs"
                  variant="ghost"
                />
                <IconButton
                  Icon={Trash2}
                  aria-label={t("page.admin_memberships.delete")}
                  colorPalette="red"
                  loading={deletingMembershipId === membership.id}
                  onClick={() => onDelete(membership)}
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

//------------------------------------------------------------------------------
// Membership Sort Button
//------------------------------------------------------------------------------

type MembershipSort = {
  direction: "asc" | "desc";
  field: "createdAt" | "fullName";
};

type MembershipSortButtonProps = {
  active: boolean;
  children: ReactNode;
  direction: MembershipSort["direction"];
  onClick: () => void;
};

function MembershipSortButton({
  active,
  children,
  direction,
  onClick,
}: MembershipSortButtonProps) {
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

//------------------------------------------------------------------------------
// Sort Memberships
//------------------------------------------------------------------------------

function sortMemberships(
  memberships: Membership[],
  sort: MembershipSort,
  locale: string,
) {
  const direction = sort.direction === "asc" ? 1 : -1;

  return [...memberships].sort((a, b) => {
    if (sort.field === "createdAt") {
      return (a.createdAt.getTime() - b.createdAt.getTime()) * direction;
    }

    return a.fullName.localeCompare(b.fullName, locale) * direction;
  });
}

//------------------------------------------------------------------------------
// Memberships To CSV
//------------------------------------------------------------------------------

function membershipsToCsv(
  memberships: Membership[],
  t: ReturnType<typeof useI18n>["t"],
) {
  const rows = [
    [
      t("page.admin_memberships.table.created_at"),
      t("page.admin_memberships.table.full_name"),
      t("page.admin_memberships.table.email"),
      t("page.admin_memberships.table.phone_number"),
      t("page.admin_memberships.table.home_address"),
      t("page.admin_memberships.table.payment_method"),
      t("page.admin_memberships.table.newsletter"),
    ],
    ...memberships.map((membership) => [
      membership.createdAt.toISOString(),
      membership.fullName,
      membership.email,
      membership.phoneNumber ?? "",
      membership.homeAddress,
      t(`enum.membership_payment_method.${membership.paymentMethod}`),
      membership.newsletterAccepted ?
        t("page.admin_memberships.table.yes")
      : t("page.admin_memberships.table.no"),
    ]),
  ];

  return rows.map((row) => row.map(csvCell).join(",")).join("\n");
}

//------------------------------------------------------------------------------
// CSV Cell
//------------------------------------------------------------------------------

function csvCell(value: string) {
  return `"${value.replaceAll('"', '""')}"`;
}
