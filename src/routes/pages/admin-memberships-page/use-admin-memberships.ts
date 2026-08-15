import { useCallback, useState } from "react";
import {
  type Membership,
  deleteMembership,
  fetchMemberships,
} from "~/domain/memberships";
import { useAsyncEffect } from "~/hooks/use-async-effect";
import { type AsyncState, initial, loading } from "~/utils/async-state";

//------------------------------------------------------------------------------
// Use Admin Memberships
//------------------------------------------------------------------------------

export default function useAdminMemberships() {
  const [deleteError, setDeleteError] = useState("");
  const [deletingMembershipId, setDeletingMembershipId] = useState<
    Membership["id"] | null
  >(null);
  const [membershipsState, setMembershipsState] =
    useState<AsyncState<Membership[]>>(initial());

  const loadMemberships = useCallback(async () => {
    setMembershipsState(loading());
    const memberships = await fetchMemberships();
    setMembershipsState(memberships);
  }, []);

  useAsyncEffect(async (isActive) => {
    setMembershipsState(loading());
    const memberships = await fetchMemberships();
    if (!isActive()) return;
    setMembershipsState(memberships);
  }, []);

  const deleteAdminMembershipEntry = useCallback(
    async (membershipId: Membership["id"], confirmed: boolean) => {
      if (!confirmed) return false;

      setDeleteError("");
      setDeletingMembershipId(membershipId);
      const error = await deleteMembership(membershipId);
      setDeletingMembershipId(null);

      if (error) {
        setDeleteError(error);
        return false;
      }

      await loadMemberships();
      return true;
    },
    [loadMemberships],
  );

  return {
    deleteAdminMembershipEntry,
    deleteError,
    deletingMembershipId,
    membershipsState,
  };
}
