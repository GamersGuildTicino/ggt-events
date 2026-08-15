import { useState } from "react";
import { type Membership, fetchMemberships } from "~/domain/memberships";
import { useAsyncEffect } from "~/hooks/use-async-effect";
import { type AsyncState, initial, loading } from "~/utils/async-state";

//------------------------------------------------------------------------------
// Use Admin Memberships
//------------------------------------------------------------------------------

export default function useAdminMemberships() {
  const [membershipsState, setMembershipsState] =
    useState<AsyncState<Membership[]>>(initial());

  useAsyncEffect(async (isActive) => {
    setMembershipsState(loading());
    const memberships = await fetchMemberships();
    if (!isActive()) return;
    setMembershipsState(memberships);
  }, []);

  return {
    membershipsState,
  };
}
