/**
 * Instrumentação de consultas Supabase. Registra no console, pra
 * TODA consulta que passar por aqui: início, tabela/filtros, tempo
 * de resposta, quantidade de registros, erro completo, e um aviso
 * explícito se a consulta ficar pendente por mais de 10s.
 *
 * Uso:
 *   const { data, error } = await loggedQuery(
 *     "Dashboard: buscar perfil do usuário",
 *     supabase.from("users").select("name,email,plan").eq("id", userId).maybeSingle(),
 *     { tabela: "users", filtros: { id: userId } },
 *   );
 */

interface LoggedQueryMeta {
  tabela?: string;
  rpc?: string;
  filtros?: Record<string, unknown>;
}

interface QueryResultShape {
  data: unknown;
  error: unknown;
}

export async function loggedQuery<T extends QueryResultShape>(
  label: string,
  queryBuilder: PromiseLike<T>,
  meta: LoggedQueryMeta = {},
): Promise<T> {
  const inicio = performance.now();
  const alvo = meta.rpc ? `rpc:${meta.rpc}` : meta.tabela ? `tabela:${meta.tabela}` : "?";

  console.log(
    `%c[Supabase] ⏳ INÍCIO%c ${label} (${alvo})`,
    "color:#facc15;font-weight:bold",
    "color:inherit",
    meta.filtros ? { filtros: meta.filtros } : "",
  );

  let terminou = false;
  const timeoutId = setTimeout(() => {
    if (!terminou) {
      console.warn(
        `%c[Supabase] ⚠️ PENDENTE APÓS 10s%c ${label} (${alvo}) -- ainda não retornou. Provável travamento nessa consulta específica.`,
        "color:#f97316;font-weight:bold",
        "color:inherit",
      );
    }
  }, 10000);

  try {
    const resultado = await queryBuilder;
    terminou = true;
    clearTimeout(timeoutId);

    const duracaoMs = Math.round(performance.now() - inicio);
    const { data, error } = resultado;

    if (error) {
      console.error(
        `%c[Supabase] ❌ ERRO%c (${duracaoMs}ms) ${label} (${alvo})`,
        "color:#ef4444;font-weight:bold",
        "color:inherit",
        error,
      );
    } else {
      const qtd = Array.isArray(data) ? data.length : data ? 1 : 0;
      console.log(
        `%c[Supabase] ✅ FIM%c (${duracaoMs}ms) ${label} (${alvo}) -- ${qtd} registro(s)`,
        "color:#22c55e;font-weight:bold",
        "color:inherit",
        data,
      );
    }

    return resultado;
  } catch (excecao) {
    terminou = true;
    clearTimeout(timeoutId);
    const duracaoMs = Math.round(performance.now() - inicio);
    console.error(
      `%c[Supabase] 💥 EXCEÇÃO%c (${duracaoMs}ms) ${label} (${alvo})`,
      "color:#ef4444;font-weight:bold",
      "color:inherit",
      excecao,
    );
    throw excecao;
  }
}

/** Marca no console o exato momento em que um estado de loading vira false. */
export function logLoadingFim(label: string) {
  console.log(
    `%c[Loading] loading -> false%c ${label}`,
    "color:#38bdf8;font-weight:bold",
    "color:inherit",
  );
}
