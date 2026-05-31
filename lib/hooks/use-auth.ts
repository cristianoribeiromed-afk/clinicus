"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/auth-store";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

export function useAuth(requireAuth = false) {
  const router = useRouter();
  const { user, profile, isLoading, setUser, setProfile, setLoading, reset } =
    useAuthStore();

  // Fetch user profile from database
  const fetchProfile = useCallback(
    async (userId: string) => {
      try {
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("id", userId)
          .maybeSingle();

        if (error) throw error;
        setProfile(data);
      } catch (error) {
        console.error("Error fetching profile:", error);
        setProfile(null);
      }
    },
    [setProfile],
  );

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (mounted) {
          setUser(session?.user ?? null);
          if (session?.user) {
            await fetchProfile(session.user.id);
          } else {
            setProfile(null);
          }
        }
      } catch (error) {
        console.error("Auth init error:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      setUser(session?.user ?? null);

      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }

      if (event === "SIGNED_OUT") {
        reset();
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [setUser, setProfile, setLoading, reset, fetchProfile]);

  // Redirect if auth required
  useEffect(() => {
    if (!isLoading && requireAuth && !user) {
      router.push("/login");
    }
  }, [isLoading, requireAuth, user, router]);

  // Update last login
  const updateLastLogin = useCallback(async () => {
    if (!user) return;
    await supabase
      .from("users")
      .update({ last_login: new Date().toISOString() })
      .eq("id", user.id);
  }, [user]);

  // Sign out
  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    reset();
    router.push("/");
  }, [reset, router]);

  return {
    user,
    profile,
    isLoading,
    isAuthenticated: !!user,
    isPremium: useAuthStore.getState().isPremium,
    signOut,
    updateLastLogin,
    fetchProfile,
  };
}

// Hook for auth-only pages
export function useRequireAuth() {
  return useAuth(true);
}

// Hook for premium-only pages
export function useRequirePremium() {
  const auth = useAuth(true);
  const router = useRouter();
  const { isPremium, profile } = useAuthStore();

  useEffect(() => {
    if (!auth.isLoading && !isPremium) {
      router.push("/planos");
    }
  }, [auth.isLoading, isPremium, router]);

  return {
    ...auth,
    hasAccess: isPremium,
  };
}
