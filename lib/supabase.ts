import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Create client without strict typing for more flexibility
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// Helper to check if user has premium access
export async function hasPremiumAccess(userId: string): Promise<boolean> {
  const { data: user } = await supabase
    .from("users")
    .select("plan, plan_expires_at")
    .eq("id", userId)
    .maybeSingle();

  if (!user) return false;

  if ((user as any).plan === "free") return false;

  if ((user as any).plan_expires_at) {
    return new Date((user as any).plan_expires_at) > new Date();
  }

  return true;
}

// Helper to check if content is accessible
export function isContentAccessible(
  contentPremium: boolean,
  userPlan: string,
  planExpiresAt: string | null,
): boolean {
  if (!contentPremium) return true;

  if (userPlan === "free") return false;

  if (planExpiresAt) {
    return new Date(planExpiresAt) > new Date();
  }

  return true;
}
