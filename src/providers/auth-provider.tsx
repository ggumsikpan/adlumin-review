"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import type { Profile } from "@/lib/types/database";
import {
  isDemoMode,
  clearDemoMode,
  DEMO_ADVERTISER,
  DEMO_INFLUENCER,
} from "@/lib/demo-data";

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  isDemo: false | "advertiser" | "influencer";
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  isDemo: false,
  signOut: async () => {},
});

// Read demo mode synchronously at init time so first render already has the right value
function getInitialDemoState() {
  if (typeof document === "undefined") return { isDemo: false as const, profile: null, user: null };
  const match = document.cookie.match(/(?:^|; )adlumin_demo=([^;]*)/);
  if (!match) return { isDemo: false as const, profile: null, user: null };
  const role = match[1] as "advertiser" | "influencer";
  if (role !== "advertiser" && role !== "influencer") return { isDemo: false as const, profile: null, user: null };
  const demoProfile = role === "advertiser" ? DEMO_ADVERTISER : DEMO_INFLUENCER;
  return {
    isDemo: role,
    profile: demoProfile,
    user: { id: demoProfile.id, email: demoProfile.email } as User,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const initial = getInitialDemoState();

  const [user, setUser] = useState<User | null>(initial.user);
  const [profile, setProfile] = useState<Profile | null>(initial.profile);
  const [loading, setLoading] = useState(!initial.isDemo); // demo = not loading
  const [isDemo, setIsDemo] = useState<false | "advertiser" | "influencer">(initial.isDemo);

  useEffect(() => {
    // Demo mode — already initialized synchronously, nothing to do
    if (isDemo) return;

    // Normal auth flow
    const supabase = createClient();

    const getUser = async () => {
      try {
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();
        setUser(authUser);

        if (authUser) {
          const { data } = await supabase
            .from("review_profiles")
            .select("*")
            .eq("id", authUser.id)
            .single();
          setProfile(data);
        }
      } catch {
        // Auth error - ignore
      }
      setLoading(false);
    };

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);

      if (session?.user) {
        const { data } = await supabase
          .from("review_profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();
        setProfile(data);
      } else {
        setProfile(null);
      }

      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [isDemo]);

  const signOut = async () => {
    if (isDemo) {
      clearDemoMode();
      setIsDemo(false);
      setUser(null);
      setProfile(null);
      return;
    }
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, isDemo, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
