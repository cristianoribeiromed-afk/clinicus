// lib/clinicusmed-precos.ts
//
// Fonte única do PREÇO de cada produto do ClinicusMed no servidor.
//
// Antes, o checkout aceitava o preço enviado pelo navegador — qualquer
// pessoa podia mandar preco: 0.01 e comprar o Premium por um centavo.
// Agora o preço é calculado aqui, a partir do mesmo catalogo.json que a
// loja (index.html) usa, replicando exatamente a regra da loja:
//
//   • Etapa de matéria   <semestre>-<materia>[-<etapa>]-combo
//       preço = etapa.comboPreco ?? etapa.resumo.preco ?? 15.90
//       (a etapa "Final" não leva o sufixo da etapa — igual à loja)
//   • Matéria completa   <semestre>-<materia>-completo
//       preço = materia.comboGeralPreco (se comboGeralDisponivel)
//   • Pacote do semestre <semestre>-pacote-<tipo>[-cde]
//       preço = semestre.pacotes[tipo].preco (se disponivel)
//   • Plano Anual        semestre-AA-BB-pacote-anual[-cde]
//       preço = anuais.precoLancamento até anuais.lancamentoAte (inclusive,
//       horário de Brasília); depois, anuais.preco
//
// Nenhum preço é alterado aqui: os valores vêm do catalogo.json.

export const PRECO_PADRAO_ETAPA = 15.9;

type Etapa = {
  disponivel?: boolean;
  comboPreco?: number | null;
  resumo?: { disponivel?: boolean; preco?: number | null } | null;
} | null;

type Materia = {
  nome: string;
  etapas?: Record<string, Etapa> | null;
  comboGeralDisponivel?: boolean;
  comboGeralPreco?: number | null;
};

type Semestre = {
  slug: string;
  materias?: Materia[] | null;
  pacotes?: Record<string, { disponivel?: boolean; preco?: number | null } | null> | null;
};

type Anuais = {
  disponivel?: boolean;
  preco?: number | null;
  precoLancamento?: number | null;
  lancamentoAte?: string | null;
  pares?: [number, number][] | null;
} | null;

export type Catalogo = { semestres: Semestre[]; anuais?: Anuais };

export type ProdutoPreco = { plano: string; preco: number; tipo: "etapa" | "completo" | "pacote" | "anual" };

/** Data de hoje (AAAA-MM-DD) no horário de Brasília. */
function hojeBrasilia(agora: Date): string {
  return new Date(agora.getTime() - 3 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

/** Mesma regra de precoAnualVigente() do index.html. */
export function precoAnualVigente(an: NonNullable<Anuais>, agora = new Date()): number | null {
  const lancamento = an.precoLancamento;
  const ate = (an.lancamentoAte || "").trim();
  if (precoValido(lancamento) && /^\d{4}-\d{2}-\d{2}$/.test(ate) && hojeBrasilia(agora) <= ate) return lancamento;
  return precoValido(an.preco) ? an.preco : null;
}

const ehCDE = (nome: string) => /\bCDE\b/i.test(nome);

// Mesmo slugify do index.html.
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function precoValido(p: unknown): p is number {
  return typeof p === "number" && Number.isFinite(p) && p > 0;
}

/** Monta o mapa plano -> preço de todos os produtos que a loja oferece hoje. */
export function montarTabelaPrecos(catalogo: Catalogo, agora = new Date()): Map<string, ProdutoPreco> {
  const tabela = new Map<string, ProdutoPreco>();
  for (const sem of catalogo.semestres || []) {
    if (!sem || !sem.slug) continue;

    for (const m of sem.materias || []) {
      if (!m || !m.nome) continue;
      const base = `${sem.slug}-${slugify(m.nome)}`;

      for (const [etapaNome, etapa] of Object.entries(m.etapas || {})) {
        if (!etapa || !etapa.resumo || !etapa.resumo.disponivel) continue;
        const keyBase = etapaNome === "Final" ? base : `${base}-${slugify(etapaNome)}`;
        const preco = etapa.comboPreco ?? etapa.resumo.preco ?? PRECO_PADRAO_ETAPA;
        if (precoValido(preco)) {
          const plano = `${keyBase}-combo`;
          tabela.set(plano, { plano, preco, tipo: "etapa" });
        }
      }

      if (m.comboGeralDisponivel && precoValido(m.comboGeralPreco)) {
        const plano = `${base}-completo`;
        tabela.set(plano, { plano, preco: m.comboGeralPreco, tipo: "completo" });
      }
    }

    for (const [tipo, p] of Object.entries(sem.pacotes || {})) {
      if (!p || !p.disponivel || !precoValido(p.preco)) continue;
      // A loja gera a mesma chave com e sem o sufixo -cde, pelo mesmo preço.
      for (const plano of [`${sem.slug}-pacote-${tipo}`, `${sem.slug}-pacote-${tipo}-cde`]) {
        tabela.set(plano, { plano, preco: p.preco, tipo: "pacote" });
      }
    }
  }
  // Plano Anual (2 semestres consecutivos)
  const an = catalogo.anuais;
  if (an && an.disponivel && Array.isArray(an.pares)) {
    const preco = precoAnualVigente(an, agora);
    const dd = (n: number) => String(n).padStart(2, "0");
    const semestre = (n: number) => (catalogo.semestres || []).find((s) => s && s.slug === `semestre-${dd(n)}`);
    for (const par of an.pares) {
      if (!Array.isArray(par) || par.length !== 2 || !precoValido(preco)) continue;
      const [a, b] = par;
      const sa = semestre(a), sb = semestre(b);
      if (!sa || !sb) continue; // a loja só mostra o card se os dois semestres existem
      const base = `semestre-${dd(a)}-${dd(b)}-pacote-anual`;
      tabela.set(base, { plano: base, preco, tipo: "anual" });
      const temCDE = [sa, sb].some((s) => (s.materias || []).some((m) => m && ehCDE(m.nome)));
      if (temCDE) tabela.set(`${base}-cde`, { plano: `${base}-cde`, preco, tipo: "anual" });
    }
  }
  return tabela;
}

// ---- Leitura do catálogo publicado (com cache curto em memória) ----

const CACHE_MS = 5 * 60 * 1000;
let cache: { tabela: Map<string, ProdutoPreco>; em: number } | null = null;

export function urlCatalogo(): string {
  if (process.env.CLINICUSMED_CATALOGO_URL) return process.env.CLINICUSMED_CATALOGO_URL;
  const site = (process.env.CLINICUSMED_SITE_URL || "https://clinicusmed.com.br").replace(/\/$/, "");
  return `${site}/catalogo.json`;
}

/**
 * Devolve a tabela de preços. Lança erro se o catálogo não puder ser lido —
 * quem chama deve RECUSAR a operação (nunca cair de volta para um preço
 * vindo do navegador).
 */
export async function obterTabelaPrecos(fetchImpl: typeof fetch = fetch): Promise<Map<string, ProdutoPreco>> {
  if (cache && Date.now() - cache.em < CACHE_MS) return cache.tabela;
  const resp = await fetchImpl(urlCatalogo(), { cache: "no-store" } as RequestInit);
  if (!resp.ok) throw new Error(`catalogo indisponivel (HTTP ${resp.status})`);
  const catalogo = (await resp.json()) as Catalogo;
  if (!catalogo || !Array.isArray(catalogo.semestres)) throw new Error("catalogo em formato inesperado");
  const tabela = montarTabelaPrecos(catalogo);
  if (tabela.size === 0) throw new Error("catalogo sem produtos");
  cache = { tabela, em: Date.now() };
  return tabela;
}

/** Só para os testes. */
export function _limparCachePrecos() {
  cache = null;
}

/** Tolerância de centavos para arredondamento. */
export function valorPagoCobre(valorPago: unknown, precoEsperado: number): boolean {
  return typeof valorPago === "number" && Number.isFinite(valorPago) && valorPago + 0.009 >= precoEsperado;
}
