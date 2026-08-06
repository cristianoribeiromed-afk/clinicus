import { createClient } from "@supabase/supabase-js";

/**
 * Verifica se a requisição vem de um usuário autenticado E autorizado como admin.
 * Espera um header "Authorization: Bearer <access_token>" vindo do cliente.
 *
 * A permissão de admin vem de public.users.is_admin (migração
 * 20260806104352_005_admin_role_system.sql) — não é mais uma lista de
 * e-mail fixa no código. Pra dar acesso a alguém novo, atualiza essa
 * coluna direto no banco (via service role/painel, nunca via client —
 * existe um trigger bloqueando qualquer tentativa de auto-promoção).
 */
export async function verifyAdmin(request: Request): Promise<{ ok: true; email: string } | { ok: false; status: number; error: string }> {
  const authHeader = request.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { ok: false, status: 401, error: "Token de autenticação ausente." };
  }

  const token = authHeader.replace("Bearer ", "");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey);

  const { data, error } = await supabaseAuth.auth.getUser(token);

  if (error || !data?.user?.email || !data?.user?.id) {
    return { ok: false, status: 401, error: "Sessão inválida ou expirada." };
  }

  // Consulta is_admin via service role — não depende de nenhuma política
  // de RLS específica pra essa checagem funcionar de forma confiável.
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseServiceKey) {
    return { ok: false, status: 500, error: "Serviço não configurado." };
  }
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: userRow, error: userError } = await supabaseAdmin
    .from("users")
    .select("is_admin")
    .eq("id", data.user.id)
    .maybeSingle();

  if (userError) {
    console.error("Erro ao verificar is_admin:", userError);
    return { ok: false, status: 500, error: "Erro ao verificar permissão." };
  }

  if (!(userRow as any)?.is_admin) {
    return { ok: false, status: 403, error: "Usuário não autorizado como administrador." };
  }

  return { ok: true, email: data.user.email };
}
