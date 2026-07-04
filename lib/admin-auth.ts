import { createClient } from "@supabase/supabase-js";

// Lista de emails autorizados a acessar o painel administrativo.
// Adicione outros emails aqui se precisar dar acesso a mais pessoas.
export const ADMIN_EMAILS = ["ribeiro@unochapeco.edu.br"];

/**
 * Verifica se a requisição vem de um usuário autenticado E autorizado como admin.
 * Espera um header "Authorization: Bearer <access_token>" vindo do cliente.
 */
export async function verifyAdmin(request: Request): Promise<{ ok: true; email: string } | { ok: false; status: number; error: string }> {
  const authHeader = request.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { ok: false, status: 401, error: "Token de autenticação ausente." };
  }

  const token = authHeader.replace("Bearer ", "");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data?.user?.email) {
    return { ok: false, status: 401, error: "Sessão inválida ou expirada." };
  }

  if (!ADMIN_EMAILS.includes(data.user.email)) {
    return { ok: false, status: 403, error: "Usuário não autorizado como administrador." };
  }

  return { ok: true, email: data.user.email };
}
