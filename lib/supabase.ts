import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Timeout global -- sem isso, se a rede travar de verdade (não dá erro, só
// nunca responde), a chamada fica pendurada para sempre, e nenhum timeout
// individual de hook (useAuth, useContentList, etc.) protege contra isso
// de verdade, porque a promise nunca resolve nem rejeita sozinha. Isso
// aqui é o que garante que TODA chamada ao Supabase -- de qualquer hook,
// presente ou futuro -- aborta sozinha depois de 15s, em vez de travar a
// tela pra sempre. É a causa provável de sessão, RPC de conteúdo e busca
// de perfil travando juntos ao mesmo tempo: não são bugs separados, é a
// mesma falta de proteção na base que todos compartilham.
function fetchComTimeout(
  input: RequestInfo | URL,
  init: RequestInit = {},
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);
  return fetch(input, { ...init, signal: controller.signal }).finally(() =>
    clearTimeout(timeoutId),
  );
}

// Create client without strict typing for more flexibility
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  global: {
    fetch: fetchComTimeout,
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
