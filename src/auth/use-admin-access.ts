import { useState } from "react";
import { useAsyncEffect } from "~/hooks/use-async-effect";
import { supabase } from "~/lib/supabase";
import {
  type AsyncState,
  failure,
  initial,
  loading,
  success,
} from "~/utils/async-state";
import { useAuth } from "./use-auth";

//------------------------------------------------------------------------------
// Admin Access
//------------------------------------------------------------------------------

export type AdminAccess = {
  isAdmin: boolean;
  isEventManager: boolean;
};

export default function useAdminAccess() {
  const { user } = useAuth();
  const [state, setState] = useState<AsyncState<AdminAccess>>(initial());

  useAsyncEffect(
    async (isActive) => {
      if (!user) {
        setState(success({ isAdmin: false, isEventManager: false }));
        return;
      }

      setState(loading());
      const { data, error } = await supabase.rpc("get_current_admin_access");
      if (!isActive()) return;

      const access = data?.[0];
      if (error || !access) {
        setState(failure("error.admin_access.fetch"));
        return;
      }

      setState(
        success({
          isAdmin: access.is_admin,
          isEventManager: access.is_event_manager,
        }),
      );
    },
    [user],
  );

  return state;
}
