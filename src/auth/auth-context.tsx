import type { Session, User } from "@supabase/supabase-js";
import { createContext } from "react";

//------------------------------------------------------------------------------
// Auth Context Value
//------------------------------------------------------------------------------

export type AuthContextValue = {
  isAuthenticated: boolean;
  isLoading: boolean;
  resetPasswordForEmail: (email: string) => Promise<string>;
  session: Session | null;
  signInWithPassword: (email: string, password: string) => Promise<string>;
  signOut: () => Promise<string>;
  user: User | null;
};

//------------------------------------------------------------------------------
// Auth Context
//------------------------------------------------------------------------------

const AuthContext = createContext<AuthContextValue | null>(null);

export default AuthContext;
