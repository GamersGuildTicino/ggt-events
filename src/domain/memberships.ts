import { z } from "zod";
import type { Locale } from "~/i18n/locale";
import { supabase } from "~/lib/supabase";
import {
  type AsyncStateFailure,
  type AsyncStateSuccess,
  failure,
  success,
} from "~/utils/async-state";
import { membershipPaymentMethodSchema } from "./enums/membership-payment-method";
import type { MembershipPaymentMethod } from "./enums/membership-payment-method";

//------------------------------------------------------------------------------
// Membership
//------------------------------------------------------------------------------

export const membershipSchema = z.object({
  city: z.string(),
  createdAt: z.date(),
  email: z.string(),
  firstName: z.string(),
  fullName: z.string(),
  homeAddress: z.string(),
  id: z.uuid(),
  lastName: z.string(),
  newsletterAccepted: z.boolean(),
  phoneNumber: z.string().nullable(),
  postalCode: z.string(),
  street: z.string(),
  updatedAt: z.date(),
});

export type Membership = z.infer<typeof membershipSchema>;

export type MembershipInput = {
  city: string;
  email: string;
  firstName: string;
  lastName: string;
  locale: Locale;
  newsletterAccepted: boolean;
  paymentMethod: MembershipPaymentMethod;
  phoneNumber: string;
  postalCode: string;
  street: string;
};

export type AdminMembershipInput = Omit<
  MembershipInput,
  "locale" | "paymentMethod" | "phoneNumber"
> & {
  phoneNumber: string | null;
};

export type AdminMembershipCreateInput = AdminMembershipInput & {
  paymentMethod: MembershipPaymentMethod;
};

//------------------------------------------------------------------------------
// Membership Row
//------------------------------------------------------------------------------

export const membershipRowSchema = z.object({
  city: z.string(),
  created_at: z.string(),
  email: z.string(),
  first_name: z.string(),
  full_name: z.string(),
  home_address: z.string(),
  id: z.uuid(),
  last_name: z.string(),
  newsletter_accepted: z.boolean(),
  phone_number: z.string().nullable(),
  postal_code: z.string(),
  street: z.string(),
  updated_at: z.string(),
});

export const membershipFromRowSchema = membershipRowSchema.transform(
  (row): Membership => ({
    city: row.city,
    createdAt: new Date(row.created_at),
    email: row.email,
    firstName: row.first_name,
    fullName: formatMembershipFullName(row.first_name, row.last_name),
    homeAddress: formatMembershipHomeAddress(
      row.street,
      row.postal_code,
      row.city,
    ),
    id: row.id,
    lastName: row.last_name,
    newsletterAccepted: row.newsletter_accepted,
    phoneNumber: row.phone_number,
    postalCode: row.postal_code,
    street: row.street,
    updatedAt: new Date(row.updated_at),
  }),
);

//------------------------------------------------------------------------------
// Create Membership
//------------------------------------------------------------------------------

export async function createMembership({
  city,
  email,
  firstName,
  lastName,
  locale,
  newsletterAccepted,
  paymentMethod,
  phoneNumber,
  postalCode,
  street,
}: MembershipInput) {
  const normalizedEmail = normalizeEmail(email);

  if (!isValidMembershipEmail(normalizedEmail)) {
    return "error.memberships.invalid_email";
  }

  const validationError = validateMembershipInput({
    city,
    email,
    firstName,
    lastName,
    newsletterAccepted,
    phoneNumber,
    postalCode,
    street,
  });
  if (validationError) return validationError;

  const { error } = await supabase.rpc("create_membership", {
    p_city: city,
    p_email: normalizedEmail,
    p_first_name: firstName,
    p_last_name: lastName,
    p_locale: locale,
    p_newsletter_accepted: newsletterAccepted,
    p_payment_method: paymentMethod,
    p_phone_number: phoneNumber,
    p_postal_code: postalCode,
    p_street: street,
  });

  if (!error) return "";

  switch (error.message) {
    case "email_already_used":
      return "error.memberships.email_already_used";
    case "invalid_email":
      return "error.memberships.invalid_email";
    case "invalid_home_address":
      return "error.memberships.invalid_home_address";
    case "invalid_name":
      return "error.memberships.invalid_name";
    case "invalid_payment_method":
      return "error.memberships.invalid_payment_method";
    default:
      return "error.memberships.create";
  }
}

//------------------------------------------------------------------------------
// Membership Payment
//------------------------------------------------------------------------------

export const membershipPaymentSchema = z.object({
  amount: z.number(),
  createdAt: z.date(),
  id: z.uuid(),
  membershipId: z.uuid(),
  method: membershipPaymentMethodSchema,
  paidAt: z.date(),
  updatedAt: z.date(),
});

export type MembershipPayment = z.infer<typeof membershipPaymentSchema>;

export type MembershipPaymentInput = {
  amount: number;
  method: MembershipPaymentMethod;
  paidAt: Date;
};

export const membershipPaymentRowSchema = z.object({
  amount: z.union([z.number(), z.string()]),
  created_at: z.string(),
  id: z.uuid(),
  membership_id: z.uuid(),
  method: membershipPaymentMethodSchema,
  paid_at: z.string(),
  updated_at: z.string(),
});

export const membershipPaymentFromRowSchema =
  membershipPaymentRowSchema.transform(
    (row): MembershipPayment => ({
      amount: Number(row.amount),
      createdAt: new Date(row.created_at),
      id: row.id,
      membershipId: row.membership_id,
      method: row.method,
      paidAt: new Date(row.paid_at),
      updatedAt: new Date(row.updated_at),
    }),
  );

//------------------------------------------------------------------------------
// Create Admin Membership
//------------------------------------------------------------------------------

export async function createAdminMembership(
  membership: AdminMembershipCreateInput,
) {
  const email = normalizeEmail(membership.email);
  const fullName = formatMembershipFullName(
    membership.firstName,
    membership.lastName,
  );
  const homeAddress = formatMembershipHomeAddress(
    membership.street,
    membership.postalCode,
    membership.city,
  );

  if (!isValidMembershipEmail(email)) {
    return "error.memberships.invalid_email";
  }

  const validationError = validateMembershipInput(membership);
  if (validationError) return validationError;

  if (
    !membershipPaymentMethodSchema.safeParse(membership.paymentMethod).success
  ) {
    return "error.memberships.invalid_payment_method";
  }

  const { data, error } = await supabase
    .from("memberships")
    .insert({
      city: membership.city.trim(),
      email,
      first_name: membership.firstName.trim(),
      full_name: fullName,
      home_address: homeAddress,
      last_name: membership.lastName.trim(),
      newsletter_accepted: membership.newsletterAccepted,
      phone_number: normalizeOptionalString(membership.phoneNumber ?? ""),
      postal_code: membership.postalCode.trim(),
      street: membership.street.trim(),
    })
    .select("id, created_at")
    .single();

  if (error) return membershipError(error, "error.memberships.create");

  const { error: paymentError } = await supabase
    .from("membership_payments")
    .insert({
      amount: 0,
      membership_id: data.id,
      method: membership.paymentMethod,
      paid_at: data.created_at,
    });

  if (!paymentError) return "";

  await supabase.from("memberships").delete().eq("id", data.id);
  return "error.membership_payments.create";
}

//------------------------------------------------------------------------------
// Delete Membership
//------------------------------------------------------------------------------

export async function deleteMembership(membershipId: Membership["id"]) {
  const { error } = await supabase
    .from("memberships")
    .delete()
    .eq("id", membershipId);

  return error ? "error.memberships.delete" : "";
}

//------------------------------------------------------------------------------
// Fetch Memberships
//------------------------------------------------------------------------------

export async function fetchMemberships(): Promise<
  AsyncStateSuccess<Membership[]> | AsyncStateFailure
> {
  const { data, error } = await supabase
    .from("memberships")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return failure("error.memberships.fetch_many");

  const memberships = z.array(membershipFromRowSchema).safeParse(data);
  if (memberships.error) return failure("error.memberships.parse_many");

  return success(memberships.data);
}

//------------------------------------------------------------------------------
// Fetch Membership
//------------------------------------------------------------------------------

export async function fetchMembership(
  membershipId: Membership["id"],
): Promise<AsyncStateSuccess<Membership> | AsyncStateFailure> {
  const { data, error } = await supabase
    .from("memberships")
    .select("*")
    .eq("id", membershipId)
    .single();

  if (error) return failure("error.memberships.fetch_one");

  const membership = membershipFromRowSchema.safeParse(data);
  if (membership.error) return failure("error.memberships.parse_one");

  return success(membership.data);
}

//------------------------------------------------------------------------------
// Fetch Membership Payments
//------------------------------------------------------------------------------

export async function fetchMembershipPayments(
  membershipId: Membership["id"],
): Promise<AsyncStateSuccess<MembershipPayment[]> | AsyncStateFailure> {
  const { data, error } = await supabase
    .from("membership_payments")
    .select("*")
    .eq("membership_id", membershipId)
    .order("paid_at", { ascending: false });

  if (error) return failure("error.membership_payments.fetch_many");

  const payments = z.array(membershipPaymentFromRowSchema).safeParse(data);
  if (payments.error) return failure("error.membership_payments.parse_many");

  return success(payments.data);
}

//------------------------------------------------------------------------------
// Update Membership
//------------------------------------------------------------------------------

export async function updateMembership(
  membership: Pick<Membership, "id"> & AdminMembershipInput,
) {
  const email = normalizeEmail(membership.email);
  const fullName = formatMembershipFullName(
    membership.firstName,
    membership.lastName,
  );
  const homeAddress = formatMembershipHomeAddress(
    membership.street,
    membership.postalCode,
    membership.city,
  );

  if (!isValidMembershipEmail(email)) {
    return "error.memberships.invalid_email";
  }

  const validationError = validateMembershipInput(membership);
  if (validationError) return validationError;

  const { error } = await supabase
    .from("memberships")
    .update({
      city: membership.city.trim(),
      email,
      first_name: membership.firstName.trim(),
      full_name: fullName,
      home_address: homeAddress,
      last_name: membership.lastName.trim(),
      newsletter_accepted: membership.newsletterAccepted,
      phone_number: normalizeOptionalString(membership.phoneNumber ?? ""),
      postal_code: membership.postalCode.trim(),
      street: membership.street.trim(),
    })
    .eq("id", membership.id);

  return membershipError(error, "error.memberships.update");
}

//------------------------------------------------------------------------------
// Create Membership Payment
//------------------------------------------------------------------------------

export async function createMembershipPayment(
  membershipId: Membership["id"],
  payment: MembershipPaymentInput,
) {
  const validationError = validateMembershipPaymentInput(payment);
  if (validationError) return validationError;

  const { error } = await supabase.from("membership_payments").insert({
    amount: payment.amount,
    membership_id: membershipId,
    method: payment.method,
    paid_at: payment.paidAt.toISOString(),
  });

  return membershipPaymentError(error, "error.membership_payments.create");
}

//------------------------------------------------------------------------------
// Update Membership Payment
//------------------------------------------------------------------------------

export async function updateMembershipPayment(
  payment: Pick<MembershipPayment, "id"> & MembershipPaymentInput,
) {
  const validationError = validateMembershipPaymentInput(payment);
  if (validationError) return validationError;

  const { error } = await supabase
    .from("membership_payments")
    .update({
      amount: payment.amount,
      method: payment.method,
      paid_at: payment.paidAt.toISOString(),
    })
    .eq("id", payment.id);

  return membershipPaymentError(error, "error.membership_payments.update");
}

//------------------------------------------------------------------------------
// Delete Membership Payment
//------------------------------------------------------------------------------

export async function deleteMembershipPayment(
  paymentId: MembershipPayment["id"],
) {
  const { error } = await supabase
    .from("membership_payments")
    .delete()
    .eq("id", paymentId);

  return error ? "error.membership_payments.delete" : "";
}

//------------------------------------------------------------------------------
// Membership Error
//------------------------------------------------------------------------------

function membershipError(
  error: { code?: string; message?: string } | null,
  fallback: string,
) {
  if (!error) return "";
  if (error.code === "23505") return "error.memberships.email_already_used";
  if (error.code === "23514" && error.message?.includes("email")) {
    return "error.memberships.invalid_email";
  }
  return fallback;
}

//------------------------------------------------------------------------------
// Membership Payment Error
//------------------------------------------------------------------------------

function membershipPaymentError(
  error: { code?: string; message?: string } | null,
  fallback: string,
) {
  if (!error) return "";
  if (error.code === "23514" && error.message?.includes("amount")) {
    return "error.membership_payments.invalid_amount";
  }
  return fallback;
}

//------------------------------------------------------------------------------
// Normalize Email
//------------------------------------------------------------------------------

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

//------------------------------------------------------------------------------
// Validate Membership Input
//------------------------------------------------------------------------------

function validateMembershipInput(membership: AdminMembershipInput) {
  if (!membership.firstName.trim() || !membership.lastName.trim()) {
    return "error.memberships.invalid_name";
  }

  if (
    !membership.street.trim() ||
    !membership.postalCode.trim() ||
    !membership.city.trim()
  ) {
    return "error.memberships.invalid_home_address";
  }

  return "";
}

//------------------------------------------------------------------------------
// Validate Membership Payment Input
//------------------------------------------------------------------------------

function validateMembershipPaymentInput(payment: MembershipPaymentInput) {
  if (!Number.isFinite(payment.amount) || payment.amount < 0) {
    return "error.membership_payments.invalid_amount";
  }

  if (!membershipPaymentMethodSchema.safeParse(payment.method).success) {
    return "error.membership_payments.invalid_method";
  }

  if (Number.isNaN(payment.paidAt.getTime())) {
    return "error.membership_payments.invalid_date";
  }

  return "";
}

//------------------------------------------------------------------------------
// Format Membership Full Name
//------------------------------------------------------------------------------

function formatMembershipFullName(firstName: string, lastName: string) {
  return [firstName, lastName]
    .map((part) => part.trim())
    .filter(Boolean)
    .join(" ");
}

//------------------------------------------------------------------------------
// Format Membership Home Address
//------------------------------------------------------------------------------

function formatMembershipHomeAddress(
  street: string,
  postalCode: string,
  city: string,
) {
  return [
    street.trim(),
    [postalCode.trim(), city.trim()].filter(Boolean).join(" "),
  ]
    .filter(Boolean)
    .join("\n");
}

//------------------------------------------------------------------------------
// Is Valid Membership Email
//------------------------------------------------------------------------------

function isValidMembershipEmail(email: string) {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
}

//------------------------------------------------------------------------------
// Normalize Optional String
//------------------------------------------------------------------------------

function normalizeOptionalString(value: string) {
  const trimmed = value.trim();
  return trimmed || null;
}
