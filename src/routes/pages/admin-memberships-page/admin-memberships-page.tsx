import { Badge, Heading, Spinner, Table, Text, VStack } from "@chakra-ui/react";
import type { Membership } from "~/domain/memberships";
import usePageTitle from "~/hooks/use-page-title";
import useI18n from "~/i18n/use-i18n";
import AppAlert from "~/ui/app-alert";
import AdminBreadcrumb from "../../components/admin-breadcrumb";
import useAdminMemberships from "./use-admin-memberships";

//------------------------------------------------------------------------------
// Admin Memberships Page
//------------------------------------------------------------------------------

export default function AdminMembershipsPage() {
  const { locale, t } = useI18n();
  const { membershipsState } = useAdminMemberships();

  usePageTitle(t("page.admin_memberships.heading"));

  return (
    <VStack align="stretch" gap={3} w="full">
      <AdminBreadcrumb
        items={[
          { label: t("page.admin_memberships.breadcrumb.admin"), to: "/admin" },
          { label: t("page.admin_memberships.breadcrumb.memberships") },
        ]}
      />

      <Heading size="3xl">{t("page.admin_memberships.heading")}</Heading>

      {membershipsState.isLoading && <Spinner />}

      {membershipsState.hasError && (
        <AppAlert status="error">{t(membershipsState.error)}</AppAlert>
      )}

      {membershipsState.isSuccess && membershipsState.data.length === 0 && (
        <Text color="fg.muted">{t("page.admin_memberships.empty")}</Text>
      )}

      {membershipsState.isSuccess && membershipsState.data.length > 0 && (
        <AdminMembershipsTable
          locale={locale}
          memberships={membershipsState.data}
        />
      )}
    </VStack>
  );
}

//------------------------------------------------------------------------------
// Admin Memberships Table
//------------------------------------------------------------------------------

type AdminMembershipsTableProps = {
  locale: string;
  memberships: Membership[];
};

function AdminMembershipsTable({
  locale,
  memberships,
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
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </Table.ScrollArea>
  );
}
