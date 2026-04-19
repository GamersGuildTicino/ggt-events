import { useContext } from "react";
import AuthContext from "./auth-context";

//------------------------------------------------------------------------------
// Auth Context
//------------------------------------------------------------------------------

export function useAuth() {
  const context = useContext(AuthContext);
  if (context) return context;
  throw new Error("useAuth must be used within an AuthProvider.");
}
