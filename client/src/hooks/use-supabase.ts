"use client";

import { useContext } from "react";
import { SupabaseContext } from "@/app/providers";

export function useSupabase() {
  const supabase = useContext(SupabaseContext);

  if (!supabase) {
    throw new Error("useSupabase must be used within a SupabaseProvider");
  }

  return supabase;
}

export function useUser() {
  const supabase = useSupabase();
  const { user, isAuthenticated, session } = getAuthStateFromClient(supabase);

  return { user, isAuthenticated, session };
}

function getAuthStateFromClient(supabase: any) {
  const session = supabase.auth.session();

  if (session?.user) {
    return {
      user: session.user,
      isAuthenticated: true,
      session,
    };
  }

  if (typeof window !== "undefined") {
    const authData = localStorage.getItem("supabase-auth");
    if (authData) {
      try {
        const parsed = JSON.parse(authData);
        return {
          user: parsed.user,
          isAuthenticated: !!parsed.user,
          session: parsed.session,
        };
      } catch (e) {
        console.error("Error parsing auth data:", e);
      }
    }
  }

  return { user: null, isAuthenticated: false, session: null };
}
