import type { Session } from "@supabase/supabase-js";
import { useEffect, useMemo, useState } from "react";
import type { PropsWithChildren } from "react";
import { useAsyncEffect } from "~/hooks/use-async-effect";
import { getSession, onAuthStateChange } from "~/lib/supabase";
import AuthContext, { type AuthContextValue } from "./auth-context";

//------------------------------------------------------------------------------
// Auth Provider
//------------------------------------------------------------------------------

function AuthProvider({ children }: PropsWithChildren) {
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);

  useAsyncEffect(async (isActive) => {
    const { data, error } = await getSession();

    if (!isActive()) return;

    setSession(error ? null : data.session);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const { data } = onAuthStateChange(async (_event, session) => {
      setSession(session);
      setIsLoading(false);
    });

    return () => data.subscription.unsubscribe();
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    const user = session?.user ?? null;
    return {
      isAuthenticated: user !== null,
      isLoading,
      session,
      user,
    };
  }, [isLoading, session]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
