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
  paymentMethod: membershipPaymentMethodSchema,
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
  "locale" | "phoneNumber"
> & {
  phoneNumber: string | null;
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
  payment_method: membershipPaymentMethodSchema,
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
    paymentMethod: row.payment_method,
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
    paymentMethod,
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
// Create Admin Membership
//------------------------------------------------------------------------------

export async function createAdminMembership(membership: AdminMembershipInput) {
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

  const { error } = await supabase.from("memberships").insert({
    city: membership.city.trim(),
    email,
    first_name: membership.firstName.trim(),
    full_name: fullName,
    home_address: homeAddress,
    last_name: membership.lastName.trim(),
    newsletter_accepted: membership.newsletterAccepted,
    payment_method: membership.paymentMethod,
    phone_number: normalizeOptionalString(membership.phoneNumber ?? ""),
    postal_code: membership.postalCode.trim(),
    street: membership.street.trim(),
  });

  return membershipError(error, "error.memberships.create");
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
      payment_method: membership.paymentMethod,
      phone_number: normalizeOptionalString(membership.phoneNumber ?? ""),
      postal_code: membership.postalCode.trim(),
      street: membership.street.trim(),
    })
    .eq("id", membership.id);

  return membershipError(error, "error.memberships.update");
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
