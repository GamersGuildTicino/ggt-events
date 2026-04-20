import type { Session } from "@supabase/supabase-js";
import { useEffect, useMemo, useState } from "react";
import type { PropsWithChildren } from "react";
import {
  getSession,
  onAuthStateChange,
  resetPasswordForEmail,
  signInWithPassword,
  signOut,
} from "~/lib/supabase";
import AuthContext, { type AuthContextValue } from "./auth-context";

//------------------------------------------------------------------------------
// Auth Provider
//------------------------------------------------------------------------------

function AuthProvider({ children }: PropsWithChildren) {
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    let subscribed = true;

    const initialize = async () => {
      const { data, error } = await getSession();
      if (!subscribed) return;
      setSession(error ? null : data.session);
      setIsLoading(false);
    };

    void initialize();

    const { data } = onAuthStateChange(async (_event, session) => {
      if (!subscribed) return;
      setSession(session);
      setIsLoading(false);
    });

    return () => {
      subscribed = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    const user = session?.user ?? null;
    return {
      isAuthenticated: user !== null,
      isLoading,
      resetPasswordForEmail,
      session,
      signInWithPassword,
      signOut,
      user,
    };
  }, [isLoading, session]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
