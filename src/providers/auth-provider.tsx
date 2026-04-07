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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState<false | "advertiser" | "influencer">(false);
  const supabase = createClient();

  useEffect(() => {
    const demoRole = isDemoMode();
    if (demoRole) {
      setIsDemo(demoRole);
      // Create a minimal fake User object for demo mode
      const demoProfile = demoRole === "advertiser" ? DEMO_ADVERTISER : DEMO_INFLUENCER;
      setUser({ id: demoProfile.id, email: demoProfile.email } as User);
      setProfile(demoProfile);
      setLoading(false);
      return;
    }

    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data } = await supabase
          .from("review_profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        setProfile(data);
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
  }, [supabase]);

  const signOut = async () => {
    if (isDemo) {
      clearDemoMode();
      setIsDemo(false);
      setUser(null);
      setProfile(null);
      return;
    }
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
