import {
  Badge,
  Button,
  Dialog,
  HStack,
  Heading,
  Portal,
  Spinner,
  Table,
  Text,
  VStack,
} from "@chakra-ui/react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useCallback, useState } from "react";
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

        <Button onClick={openCreateDialog} size="sm">
          <Plus />
          {t("page.admin_memberships.form.create")}
        </Button>
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
  const dateFormatter = new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <Table.ScrollArea>
      <Table.Root size="sm">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader>
              {t("page.admin_memberships.table.created_at")}
            </Table.ColumnHeader>
            <Table.ColumnHeader>
              {t("page.admin_memberships.table.full_name")}
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
          {memberships.map((membership) => (
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
