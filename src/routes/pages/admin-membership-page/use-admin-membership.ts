import { useCallback, useState } from "react";
import {
  type Membership,
  type MembershipPayment,
  type MembershipPaymentInput,
  createMembershipPayment,
  deleteMembershipPayment,
  fetchMembership,
  fetchMembershipPayments,
  updateMembershipPayment,
} from "~/domain/memberships";
import { useAsyncEffect } from "~/hooks/use-async-effect";
import {
  type AsyncState,
  failure,
  initial,
  loading,
  success,
} from "~/utils/async-state";

//------------------------------------------------------------------------------
// Use Admin Membership
//------------------------------------------------------------------------------

export default function useAdminMembership(membershipId: Membership["id"]) {
  const [deletePaymentError, setDeletePaymentError] = useState("");
  const [deletingPaymentId, setDeletingPaymentId] = useState<
    MembershipPayment["id"] | null
  >(null);
  const [membershipState, setMembershipState] =
    useState<AsyncState<Membership>>(initial());
  const [paymentsState, setPaymentsState] =
    useState<AsyncState<MembershipPayment[]>>(initial());
  const [savePaymentState, setSavePaymentState] =
    useState<AsyncState>(initial());

  const loadMembership = useCallback(async () => {
    setMembershipState(loading());
    const membership = await fetchMembership(membershipId);
    setMembershipState(membership);
  }, [membershipId]);

  const loadPayments = useCallback(async () => {
    setPaymentsState(loading());
    const payments = await fetchMembershipPayments(membershipId);
    setPaymentsState(payments);
  }, [membershipId]);

  useAsyncEffect(
    async (isActive) => {
      setMembershipState(loading());
      setPaymentsState(loading());

      const [membership, payments] = await Promise.all([
        fetchMembership(membershipId),
        fetchMembershipPayments(membershipId),
      ]);

      if (!isActive()) return;

      setMembershipState(membership);
      setPaymentsState(payments);
    },
    [membershipId],
  );

  const createAdminMembershipPayment = useCallback(
    async (payment: MembershipPaymentInput) => {
      setSavePaymentState(loading());
      const error = await createMembershipPayment(membershipId, payment);

      if (error) {
        setSavePaymentState(failure(error));
        return false;
      }

      setSavePaymentState(success(undefined));
      await loadPayments();
      return true;
    },
    [loadPayments, membershipId],
  );

  const updateAdminMembershipPayment = useCallback(
    async (
      paymentId: MembershipPayment["id"],
      payment: MembershipPaymentInput,
    ) => {
      setSavePaymentState(loading());
      const error = await updateMembershipPayment({
        ...payment,
        id: paymentId,
      });

      if (error) {
        setSavePaymentState(failure(error));
        return false;
      }

      setSavePaymentState(success(undefined));
      await loadPayments();
      return true;
    },
    [loadPayments],
  );

  const deleteAdminMembershipPayment = useCallback(
    async (paymentId: MembershipPayment["id"], confirmed: boolean) => {
      if (!confirmed) return false;

      setDeletePaymentError("");
      setDeletingPaymentId(paymentId);
      const error = await deleteMembershipPayment(paymentId);
      setDeletingPaymentId(null);

      if (error) {
        setDeletePaymentError(error);
        return false;
      }

      await loadPayments();
      return true;
    },
    [loadPayments],
  );

  const resetPaymentSaveState = useCallback(() => {
    setSavePaymentState(initial());
  }, []);

  return {
    createAdminMembershipPayment,
    deleteAdminMembershipPayment,
    deletePaymentError,
    deletingPaymentId,
    loadMembership,
    membershipState,
    paymentsState,
    resetPaymentSaveState,
    savePaymentState,
    updateAdminMembershipPayment,
  };
}
