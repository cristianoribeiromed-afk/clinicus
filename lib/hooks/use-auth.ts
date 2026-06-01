"use client";

import { useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/auth-store";
import { supabase } from "@/lib/supabase";

export function useAuth(requireAuth = false) {
  const router = useRouter();
  const { user, profile, isLoading, setUser, setProfile, setLoading, reset } =
    useAuthStore();
  const sessionCheckInterval = useRef<NodeJS.Timeout | null>(null);

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

  // Registrar sessão no servidor após login
  const registerSession = useCallback(async (userId: string) => {
    try {
      await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId }),
      });
    } catch (error) {
      console.error("Error registering session:", error);
    }
  }, []);

  // Verificar se sessão ainda é válida
  const checkSession = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/session");
      const data = await res.json();

      if (!data.valid && data.reason === "session_invalidated") {
        // Sessão foi invalidada por outro login — fazer logout
        await supabase.auth.signOut();
        reset();
        router.push("/login?reason=session_expired");
      }
    } catch (error) {
      console.error("Session check error:", error);
    }
  }, [reset, router]);

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

        // Registrar nova sessão ao fazer login
        if (event === "SIGNED_IN") {
          await registerSession(session.user.id);
        }
      } else {
        setProfile(null);
      }

      if (event === "SIGNED_OUT") {
        reset();
        // Limpar cookie de sessão
        await fetch("/api/auth/session", { method: "DELETE" });
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [setUser, setProfile, setLoading, reset, fetchProfile, registerSession]);

  // Verificar sessão a cada 2 minutos quando logado
  useEffect(() => {
    if (user) {
      sessionCheckInterval.current = setInterval(checkSession, 2 * 60 * 1000);
    } else {
      if (sessionCheckInterval.current) {
        clearInterval(sessionCheckInterval.current);
      }
    }

    return () => {
      if (sessionCheckInterval.current) {
        clearInterval(sessionCheckInterval.current);
      }
    };
  }, [user, checkSession]);

  // Redirect if auth required
  useEffect(() => {
    if (!isLoading && requireAuth && !user) {
      router.push("/login");
    }
  }, [isLoading, requireAuth, user, router]);

  // Sign out
  const signOut = useCallback(async () => {
    await fetch("/api/auth/session", { method: "DELETE" });
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
  const { isPremium } = useAuthStore();

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
