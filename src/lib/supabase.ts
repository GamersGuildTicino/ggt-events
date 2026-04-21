import { createClient } from "@supabase/supabase-js";

//------------------------------------------------------------------------------
// Supabase
//------------------------------------------------------------------------------

const supabaseUrl = import.meta.env["VITE_SUPABASE_URL"] ?? "";
const supabaseAnonKey = import.meta.env["VITE_SUPABASE_ANON_KEY"] ?? "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

//------------------------------------------------------------------------------
// Get Session
//------------------------------------------------------------------------------

export async function getSession() {
  return await supabase.auth.getSession();
}

//------------------------------------------------------------------------------
// On Auth State Change
//------------------------------------------------------------------------------

export function onAuthStateChange(
  ...args: Parameters<typeof supabase.auth.onAuthStateChange>
) {
  return supabase.auth.onAuthStateChange(...args);
}

//------------------------------------------------------------------------------
// Reset Password For Email
//------------------------------------------------------------------------------

export async function resetPasswordForEmail(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  return error?.message ?? "";
}

//------------------------------------------------------------------------------
// Sign In With Password
//------------------------------------------------------------------------------

export async function signInWithPassword(email: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  return error?.message ?? "";
}

//------------------------------------------------------------------------------
// Sign Out
//------------------------------------------------------------------------------

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return error?.message ?? "";
}
