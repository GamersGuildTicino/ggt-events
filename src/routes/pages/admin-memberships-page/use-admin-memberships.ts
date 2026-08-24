import { useCallback, useState } from "react";
import {
  type AdminMembershipCreateInput,
  type AdminMembershipInput,
  type Membership,
  createAdminMembership,
  deleteMembership,
  fetchMemberships,
  updateMembership,
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
// Use Admin Memberships
//------------------------------------------------------------------------------

export default function useAdminMemberships() {
  const [deleteError, setDeleteError] = useState("");
  const [deletingMembershipId, setDeletingMembershipId] = useState<
    Membership["id"] | null
  >(null);
  const [membershipsState, setMembershipsState] =
    useState<AsyncState<Membership[]>>(initial());
  const [saveState, setSaveState] = useState<AsyncState>(initial());

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

  const createAdminMembershipEntry = useCallback(
    async (membership: AdminMembershipCreateInput) => {
      setSaveState(loading());
      const error = await createAdminMembership(membership);

      if (error) {
        setSaveState(failure(error));
        return false;
      }

      setSaveState(success(undefined));
      await loadMemberships();
      return true;
    },
    [loadMemberships],
  );

  const updateAdminMembershipEntry = useCallback(
    async (
      membershipId: Membership["id"],
      membership: AdminMembershipInput,
    ) => {
      setSaveState(loading());
      const error = await updateMembership({ ...membership, id: membershipId });

      if (error) {
        setSaveState(failure(error));
        return false;
      }

      setSaveState(success(undefined));
      await loadMemberships();
      return true;
    },
    [loadMemberships],
  );

  const resetSaveState = useCallback(() => {
    setSaveState(initial());
  }, []);

  return {
    createAdminMembershipEntry,
    deleteAdminMembershipEntry,
    deleteError,
    deletingMembershipId,
    membershipsState,
    resetSaveState,
    saveState,
    updateAdminMembershipEntry,
  };
}
