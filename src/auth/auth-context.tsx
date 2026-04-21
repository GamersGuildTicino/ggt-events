import type { Session, User } from "@supabase/supabase-js";
import { createContext } from "react";

//------------------------------------------------------------------------------
// Auth Context Value
//------------------------------------------------------------------------------

export type AuthContextValue = {
  isAuthenticated: boolean;
  isLoading: boolean;
  session: Session | null;
  user: User | null;
};

//------------------------------------------------------------------------------
// Auth Context
//------------------------------------------------------------------------------

const AuthContext = createContext<AuthContextValue | null>(null);

export default AuthContext;
