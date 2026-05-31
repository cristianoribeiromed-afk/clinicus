'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@supabase/supabase-js';
import type { User as AppUser } from '@/types';

interface AuthState {
  user: User | null;
  profile: AppUser | null;
  isLoading: boolean;
  isPremium: boolean;
  setUser: (user: User | null) => void;
  setProfile: (profile: AppUser | null) => void;
  setLoading: (loading: boolean) => void;
  setPremium: (isPremium: boolean) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      profile: null,
      isLoading: true,
      isPremium: false,
      setUser: (user) => set({ user }),
      setProfile: (profile) => {
        if (profile) {
          const isPremium =
            profile.plan !== 'free' &&
            (!profile.plan_expires_at || new Date(profile.plan_expires_at) > new Date());
          set({ profile, isPremium });
        } else {
          set({ profile: null, isPremium: false });
        }
      },
      setLoading: (isLoading) => set({ isLoading }),
      setPremium: (isPremium) => set({ isPremium }),
      reset: () => set({ user: null, profile: null, isLoading: false, isPremium: false }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        profile: state.profile,
        isPremium: state.isPremium,
      }),
    }
  )
);

// Helper to check if user has access to premium content
export function checkPremiumAccess(profile: AppUser | null): boolean {
  if (!profile) return false;
  if (profile.plan === 'free') return false;
  if (!profile.plan_expires_at) return true;
  return new Date(profile.plan_expires_at) > new Date();
}
