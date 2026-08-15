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
  createdAt: z.date(),
  email: z.string(),
  fullName: z.string(),
  homeAddress: z.string(),
  id: z.uuid(),
  newsletterAccepted: z.boolean(),
  paymentMethod: membershipPaymentMethodSchema,
  phoneNumber: z.string().nullable(),
  updatedAt: z.date(),
});

export type Membership = z.infer<typeof membershipSchema>;

export type MembershipInput = {
  email: string;
  fullName: string;
  homeAddress: string;
  locale: Locale;
  newsletterAccepted: boolean;
  paymentMethod: MembershipPaymentMethod;
  phoneNumber: string;
};

export type AdminMembershipInput = Omit<
  Membership,
  "createdAt" | "id" | "updatedAt"
>;

//------------------------------------------------------------------------------
// Membership Row
//------------------------------------------------------------------------------

export const membershipRowSchema = z.object({
  created_at: z.string(),
  email: z.string(),
  full_name: z.string(),
  home_address: z.string(),
  id: z.uuid(),
  newsletter_accepted: z.boolean(),
  payment_method: membershipPaymentMethodSchema,
  phone_number: z.string().nullable(),
  updated_at: z.string(),
});

export const membershipFromRowSchema = membershipRowSchema.transform(
  (row): Membership => ({
    createdAt: new Date(row.created_at),
    email: row.email,
    fullName: row.full_name,
    homeAddress: row.home_address,
    id: row.id,
    newsletterAccepted: row.newsletter_accepted,
    paymentMethod: row.payment_method,
    phoneNumber: row.phone_number,
    updatedAt: new Date(row.updated_at),
  }),
);

//------------------------------------------------------------------------------
// Create Membership
//------------------------------------------------------------------------------

export async function createMembership({
  email,
  fullName,
  homeAddress,
  locale,
  newsletterAccepted,
  paymentMethod,
  phoneNumber,
}: MembershipInput) {
  const { error } = await supabase.rpc("create_membership", {
    p_email: email,
    p_full_name: fullName,
    p_home_address: homeAddress,
    p_locale: locale,
    p_newsletter_accepted: newsletterAccepted,
    p_payment_method: paymentMethod,
    p_phone_number: phoneNumber,
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
  const { error } = await supabase.from("memberships").insert({
    email: normalizeEmail(membership.email),
    full_name: membership.fullName.trim(),
    home_address: membership.homeAddress.trim(),
    newsletter_accepted: membership.newsletterAccepted,
    payment_method: membership.paymentMethod,
    phone_number: normalizeOptionalString(membership.phoneNumber ?? ""),
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
  const { error } = await supabase
    .from("memberships")
    .update({
      email: normalizeEmail(membership.email),
      full_name: membership.fullName.trim(),
      home_address: membership.homeAddress.trim(),
      newsletter_accepted: membership.newsletterAccepted,
      payment_method: membership.paymentMethod,
      phone_number: normalizeOptionalString(membership.phoneNumber ?? ""),
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
  return fallback;
}

//------------------------------------------------------------------------------
// Normalize Email
//------------------------------------------------------------------------------

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

//------------------------------------------------------------------------------
// Normalize Optional String
//------------------------------------------------------------------------------

function normalizeOptionalString(value: string) {
  const trimmed = value.trim();
  return trimmed || null;
}
