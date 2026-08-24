import {
  Button,
  Card,
  type DateValue,
  Dialog,
  Field,
  HStack,
  Heading,
  Input,
  Portal,
  SimpleGrid,
  Spinner,
  Table,
  Text,
  VStack,
} from "@chakra-ui/react";
import { CalendarDate } from "@internationalized/date";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { useParams } from "react-router";
import {
  type MembershipPaymentMethod,
  useMembershipPaymentMethodOptions,
} from "~/domain/enums/membership-payment-method";
import {
  type MembershipPayment,
  type MembershipPaymentInput,
} from "~/domain/memberships";
import usePageTitle from "~/hooks/use-page-title";
import useI18n from "~/i18n/use-i18n";
import AppAlert from "~/ui/app-alert";
import DatePicker from "~/ui/date-picker";
import IconButton from "~/ui/icon-button";
import SelectEnum from "~/ui/select-enum";
import { toaster } from "~/ui/toaster";
import AdminBreadcrumb from "../../components/admin-breadcrumb";
import useAdminMembership from "./use-admin-membership";

//------------------------------------------------------------------------------
// Admin Membership Page
//------------------------------------------------------------------------------

export default function AdminMembershipPage() {
  const { locale, t } = useI18n();
  const { membershipId } = useParams();
  const [creatingPayment, setCreatingPayment] = useState(false);
  const [editingPayment, setEditingPayment] =
    useState<MembershipPayment | null>(null);
  const {
    createAdminMembershipPayment,
    deleteAdminMembershipPayment,
    deletePaymentError,
    deletingPaymentId,
    membershipState,
    paymentsState,
    resetPaymentSaveState,
    savePaymentState,
    updateAdminMembershipPayment,
  } = useAdminMembership(membershipId ?? "");

  const membership = membershipState.isSuccess ? membershipState.data : null;

  usePageTitle(
    membership?.fullName ?? t("page.admin_membership.heading_fallback"),
  );

  const dateTimeFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        dateStyle: "medium",
        timeStyle: "short",
      }),
    [locale],
  );

  const numberFormatter = useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        currency: "CHF",
        style: "currency",
      }),
    [locale],
  );

  const openCreatePaymentDialog = useCallback(() => {
    resetPaymentSaveState();
    setEditingPayment(null);
    setCreatingPayment(true);
  }, [resetPaymentSaveState]);

  const openEditPaymentDialog = useCallback(
    (payment: MembershipPayment) => {
      resetPaymentSaveState();
      setCreatingPayment(false);
      setEditingPayment(payment);
    },
    [resetPaymentSaveState],
  );

  const closePaymentDialog = useCallback(() => {
    setCreatingPayment(false);
    setEditingPayment(null);
  }, []);

  const createPayment = useCallback(
    async (payment: MembershipPaymentInput) => {
      const created = await createAdminMembershipPayment(payment);
      if (!created) return;

      toaster.success({
        description: t("page.admin_membership.payments.created"),
        id: "admin-membership-payment-created",
      });
      closePaymentDialog();
    },
    [closePaymentDialog, createAdminMembershipPayment, t],
  );

  const updatePayment = useCallback(
    async (payment: MembershipPaymentInput) => {
      if (!editingPayment) return;

      const updated = await updateAdminMembershipPayment(
        editingPayment.id,
        payment,
      );
      if (!updated) return;

      toaster.success({
        description: t("page.admin_membership.payments.updated"),
        id: `admin-membership-payment-updated-${editingPayment.id}`,
      });
      closePaymentDialog();
    },
    [closePaymentDialog, editingPayment, t, updateAdminMembershipPayment],
  );

  const deletePayment = useCallback(
    async (payment: MembershipPayment) => {
      const confirmed = window.confirm(
        t("page.admin_membership.payments.delete.confirm"),
      );
      const deleted = await deleteAdminMembershipPayment(payment.id, confirmed);

      if (!deleted) return;

      toaster.success({
        description: t("page.admin_membership.payments.deleted"),
        id: `admin-membership-payment-deleted-${payment.id}`,
      });
    },
    [deleteAdminMembershipPayment, t],
  );

  return (
    <VStack align="stretch" gap={4} w="full">
      <AdminBreadcrumb
        items={[
          { label: t("page.admin_memberships.breadcrumb.admin"), to: "/admin" },
          {
            label: t("page.admin_memberships.breadcrumb.memberships"),
            to: "/admin/memberships",
          },
          {
            label:
              membership?.fullName ??
              t("page.admin_membership.heading_fallback"),
          },
        ]}
      />

      {membershipState.isLoading && <Spinner />}

      {membershipState.hasError && (
        <AppAlert status="error">{t(membershipState.error)}</AppAlert>
      )}

      {membership && (
        <>
          <VStack align="stretch" gap={1}>
            <Heading size="3xl">{membership.fullName}</Heading>
            <Text>{membership.email}</Text>
          </VStack>

          <Card.Root>
            <Card.Body>
              <SimpleGrid columns={{ base: 1, md: 2 }} gap={5}>
                <MembershipDetail
                  label={t("page.admin_memberships.table.first_name")}
                  value={membership.firstName}
                />
                <MembershipDetail
                  label={t("page.admin_memberships.table.last_name")}
                  value={membership.lastName}
                />
                <MembershipDetail
                  label={t("page.admin_memberships.table.email")}
                  value={membership.email}
                />
                <MembershipDetail
                  label={t("page.admin_memberships.table.phone_number")}
                  value={membership.phoneNumber || "-"}
                />
                <MembershipDetail
                  label={t("page.admin_memberships.table.street")}
                  value={membership.street}
                />
                <HStack align="flex-start" gap={6}>
                  <MembershipDetail
                    label={t("page.admin_memberships.table.postal_code")}
                    value={membership.postalCode}
                  />
                  <MembershipDetail
                    label={t("page.admin_memberships.table.city")}
                    value={membership.city}
                  />
                </HStack>
                <MembershipDetail
                  label={t("page.admin_memberships.table.newsletter")}
                  value={
                    membership.newsletterAccepted ?
                      t("page.admin_memberships.table.yes")
                    : t("page.admin_memberships.table.no")
                  }
                />
                <MembershipDetail
                  label={t("page.admin_memberships.table.created_at")}
                  value={dateTimeFormatter.format(membership.createdAt)}
                />
              </SimpleGrid>
            </Card.Body>
          </Card.Root>

          <VStack align="stretch" gap={3}>
            <HStack justify="space-between">
              <Heading size="xl">
                {t("page.admin_membership.payments.heading")}
              </Heading>
              <Button onClick={openCreatePaymentDialog} size="xs">
                <Plus />
                {t("page.admin_membership.payments.add")}
              </Button>
            </HStack>

            {paymentsState.isLoading && <Spinner />}

            {paymentsState.hasError && (
              <AppAlert status="error">{t(paymentsState.error)}</AppAlert>
            )}

            {deletePaymentError && (
              <AppAlert dismissible status="error">
                {t(deletePaymentError)}
              </AppAlert>
            )}

            {paymentsState.isSuccess && paymentsState.data.length === 0 && (
              <Text>{t("page.admin_membership.payments.empty")}</Text>
            )}

            {paymentsState.isSuccess && paymentsState.data.length > 0 && (
              <MembershipPaymentsTable
                deletingPaymentId={deletingPaymentId}
                numberFormatter={numberFormatter}
                onDelete={deletePayment}
                onEdit={openEditPaymentDialog}
                payments={paymentsState.data}
              />
            )}
          </VStack>
        </>
      )}

      <Dialog.Root
        onOpenChange={(details) => {
          if (!details.open) closePaymentDialog();
        }}
        open={creatingPayment || Boolean(editingPayment)}
      >
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>
                  {editingPayment ?
                    t("page.admin_membership.payments.edit_heading")
                  : t("page.admin_membership.payments.create_heading")}
                </Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                <MembershipPaymentForm
                  disabled={savePaymentState.isLoading}
                  error={
                    savePaymentState.hasError ? savePaymentState.error : ""
                  }
                  initialValue={editingPayment ?? undefined}
                  key={editingPayment?.id ?? "new"}
                  onCancel={closePaymentDialog}
                  onSubmit={editingPayment ? updatePayment : createPayment}
                />
              </Dialog.Body>
              <Dialog.CloseTrigger />
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </VStack>
  );
}

//------------------------------------------------------------------------------
// Membership Detail
//------------------------------------------------------------------------------

type MembershipDetailProps = {
  label: string;
  value: string;
};

function MembershipDetail({ label, value }: MembershipDetailProps) {
  return (
    <VStack align="flex-start" gap={1} minW="12rem">
      <Text fontSize="xs" fontWeight="medium">
        {label}
      </Text>
      <Text whiteSpace="pre-wrap">{value}</Text>
    </VStack>
  );
}

//------------------------------------------------------------------------------
// Membership Payments Table
//------------------------------------------------------------------------------

type MembershipPaymentsTableProps = {
  deletingPaymentId: MembershipPayment["id"] | null;
  numberFormatter: Intl.NumberFormat;
  payments: MembershipPayment[];
  onDelete: (payment: MembershipPayment) => void;
  onEdit: (payment: MembershipPayment) => void;
};

function MembershipPaymentsTable({
  deletingPaymentId,
  numberFormatter,
  payments,
  onDelete,
  onEdit,
}: MembershipPaymentsTableProps) {
  const { t } = useI18n();

  return (
    <Table.ScrollArea>
      <Table.Root size="sm">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader>
              {t("page.admin_membership.payments.date")}
            </Table.ColumnHeader>
            <Table.ColumnHeader>
              {t("page.admin_membership.payments.method")}
            </Table.ColumnHeader>
            <Table.ColumnHeader textAlign="end">
              {t("page.admin_membership.payments.amount")}
            </Table.ColumnHeader>
            <Table.ColumnHeader textAlign="end">
              {t("page.admin_memberships.table.actions")}
            </Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {payments.map((payment) => (
            <Table.Row key={payment.id}>
              <Table.Cell whiteSpace="nowrap">
                {formatIsoDate(payment.paidAt)}
              </Table.Cell>
              <Table.Cell>
                {t(`enum.membership_payment_method.${payment.method}`)}
              </Table.Cell>
              <Table.Cell textAlign="end">
                {numberFormatter.format(payment.amount)}
              </Table.Cell>
              <Table.Cell textAlign="end">
                <IconButton
                  Icon={Pencil}
                  aria-label={t("page.admin_membership.payments.edit")}
                  onClick={() => onEdit(payment)}
                  size="xs"
                  variant="ghost"
                />
                <IconButton
                  Icon={Trash2}
                  aria-label={t("page.admin_membership.payments.delete")}
                  colorPalette="red"
                  loading={deletingPaymentId === payment.id}
                  onClick={() => onDelete(payment)}
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
// Membership Payment Form
//------------------------------------------------------------------------------

type MembershipPaymentFormProps = {
  disabled?: boolean;
  error?: string;
  initialValue?: MembershipPayment;
  onCancel: () => void;
  onSubmit: (payment: MembershipPaymentInput) => void;
};

function MembershipPaymentForm({
  disabled,
  error,
  initialValue,
  onCancel,
  onSubmit,
}: MembershipPaymentFormProps) {
  const { t } = useI18n();
  const paymentMethodOptions = useMembershipPaymentMethodOptions();

  const submitPayment = useCallback(
    (e: React.SubmitEvent<HTMLFormElement>) => {
      e.preventDefault();
      onSubmit(membershipPaymentFormValueFromForm(e.currentTarget));
    },
    [onSubmit],
  );

  return (
    <form onSubmit={submitPayment}>
      <VStack align="stretch" gap={3}>
        <HStack align="flex-start" w="full">
          <Field.Root disabled={disabled} required>
            <Field.Label>
              {t("page.admin_membership.payments.date")}
              <Field.RequiredIndicator />
            </Field.Label>
            <DatePicker
              defaultValue={initialValue?.paidAt ?? new Date()}
              format={formatDate}
              locale="en-CA"
              name="paid-at-date"
              parse={parseDate}
              placeholder="yyyy-mm-dd"
              size="sm"
            />
          </Field.Root>

          <Field.Root disabled={disabled} required>
            <Field.Label>
              {t("page.admin_membership.payments.time")}
              <Field.RequiredIndicator />
            </Field.Label>
            <Input
              defaultValue={formatTime(initialValue?.paidAt ?? new Date())}
              name="paid-at-time"
              size="sm"
              type="time"
            />
          </Field.Root>
        </HStack>

        <Field.Root disabled={disabled} required>
          <Field.Label>
            {t("page.admin_membership.payments.method")}
            <Field.RequiredIndicator />
          </Field.Label>
          <SelectEnum<MembershipPaymentMethod>
            defaultValue={initialValue?.method ?? "twint"}
            name="method"
            options={paymentMethodOptions}
            size="sm"
            withinDialog
          />
        </Field.Root>

        <Field.Root disabled={disabled} required>
          <Field.Label>
            {t("page.admin_membership.payments.amount")}
            <Field.RequiredIndicator />
          </Field.Label>
          <Input
            defaultValue={initialValue?.amount ?? 0}
            min={0}
            name="amount"
            size="sm"
            step="0.05"
            type="number"
          />
        </Field.Root>

        {error && (
          <AppAlert dismissible status="error">
            {t(error)}
          </AppAlert>
        )}

        <HStack wrap="wrap">
          <Button loading={disabled} size="sm" type="submit">
            {initialValue ?
              t("page.admin_membership.payments.save")
            : t("page.admin_membership.payments.create")}
          </Button>
          <Button
            disabled={disabled}
            onClick={onCancel}
            size="sm"
            type="button"
            variant="outline"
          >
            {t("page.admin_membership.payments.cancel")}
          </Button>
        </HStack>
      </VStack>
    </form>
  );
}

//------------------------------------------------------------------------------
// Membership Payment Form Value From Form
//------------------------------------------------------------------------------

function membershipPaymentFormValueFromForm(
  form: HTMLFormElement,
): MembershipPaymentInput {
  const formData = new FormData(form);
  const paidAtDate = formData.get("paid-at-date");
  const paidAtTime = formData.get("paid-at-time");

  return {
    amount: Number(formData.get("amount") ?? 0),
    method: String(
      formData.get("method") ?? "twint",
    ) as MembershipPaymentMethod,
    paidAt: new Date(`${paidAtDate}T${paidAtTime}`),
  };
}

//------------------------------------------------------------------------------
// Format Date
//------------------------------------------------------------------------------

function formatDate(date: DateValue) {
  return `${date.year}-${String(date.month).padStart(2, "0")}-${String(date.day).padStart(2, "0")}`;
}

//------------------------------------------------------------------------------
// Format Time
//------------------------------------------------------------------------------

function formatTime(date: Date) {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

//------------------------------------------------------------------------------
// Parse Date
//------------------------------------------------------------------------------

function parseDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return undefined;
  const [, year, month, day] = match;
  return new CalendarDate(Number(year), Number(month), Number(day));
}

//------------------------------------------------------------------------------
// Format ISO Date
//------------------------------------------------------------------------------

function formatIsoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}
