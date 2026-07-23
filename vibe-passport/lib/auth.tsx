"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { supabase } from "./supabase";
import { VibeUser } from "./types";

const PENDING_NAME_KEY = "vibe_passport_pending_name";

interface AuthContextValue {
  user: VibeUser | null;
  loading: boolean;
  /** Sends a magic link to the given email. Stashes `name` locally so we can
   *  create the profile row once the user clicks the link and comes back. */
  sendMagicLink: (email: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  sendMagicLink: async () => {},
  logout: async () => {},
});

async function loadOrCreateProfile(
  id: string,
  email: string
): Promise<VibeUser> {
  const { data: existing } = await supabase
    .from("profiles")
    .select("id, email, display_name")
    .eq("id", id)
    .maybeSingle();

  if (existing) {
    return { id, email, name: existing.display_name };
  }

  const pendingName =
    (typeof window !== "undefined" &&
      window.localStorage.getItem(PENDING_NAME_KEY)) ||
    email.split("@")[0];

  const { data: created, error } = await supabase
    .from("profiles")
    .insert({ id, email, display_name: pendingName })
    .select("id, email, display_name")
    .single();

  if (typeof window !== "undefined") {
    window.localStorage.removeItem(PENDING_NAME_KEY);
  }

  if (error || !created) {
    // Fall back to the pending name even if the insert failed (e.g. race
    // with a concurrent insert) so the UI isn't stuck.
    return { id, email, name: pendingName };
  }

  return { id, email, name: created.display_name };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<VibeUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(async ({ data }) => {
      const session = data.session;
      if (session?.user && mounted) {
        const profile = await loadOrCreateProfile(
          session.user.id,
          session.user.email ?? ""
        );
        if (mounted) setUser(profile);
      }
      if (mounted) setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          const profile = await loadOrCreateProfile(
            session.user.id,
            session.user.email ?? ""
          );
          setUser(profile);
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const sendMagicLink = async (email: string, name: string) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(PENDING_NAME_KEY, name);
    }
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo:
          typeof window !== "undefined" ? window.location.origin : undefined,
      },
    });
    if (error) throw error;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, sendMagicLink, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
