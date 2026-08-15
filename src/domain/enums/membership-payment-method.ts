import { useMemo } from "react";
import z from "zod";
import useI18n from "~/i18n/use-i18n";

//------------------------------------------------------------------------------
// Membership Payment Method
//------------------------------------------------------------------------------

export const membershipPaymentMethodSchema = z.enum([
  "twint",
  "bank_transfer",
  "cash",
]);

export const membershipPaymentMethods = membershipPaymentMethodSchema.options;

export type MembershipPaymentMethod = z.infer<
  typeof membershipPaymentMethodSchema
>;

//------------------------------------------------------------------------------
// Use Membership Payment Method Options
//------------------------------------------------------------------------------

export function useMembershipPaymentMethodOptions() {
  const { t } = useI18n();

  return useMemo(
    () =>
      membershipPaymentMethods.map((paymentMethod) => ({
        label: t(`enum.membership_payment_method.${paymentMethod}`),
        value: paymentMethod,
      })),
    [t],
  );
}
