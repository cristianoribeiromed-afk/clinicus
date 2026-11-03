// Testes da proteção de preço e do webhook do ClinicusMed.
// Rodar com:  npx tsx --test tests/clinicusmed-pagamento.test.ts
//
// Mercado Pago, Supabase e o catálogo são simulados interceptando fetch —
// nenhum serviço real é chamado.

import { test, before, beforeEach } from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import { readFileSync } from "node:fs";
import { NextRequest } from "next/server";

const SECRET = "segredo-de-teste";
process.env.MERCADOPAGO_ACCESS_TOKEN = "TEST-token";
process.env.MERCADOPAGO_WEBHOOK_SECRET = SECRET;
process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role-teste";
process.env.NEXT_PUBLIC_SUPABASE_URL = "https://supabase.teste";
process.env.CLINICUS_API_URL = "https://api.teste";
process.env.CLINICUSMED_CATALOGO_URL = "https://site.teste/catalogo.json";

const CATALOGO = {
  semestres: [
    {
      slug: "semestre-01",
      materias: [
        {
          nome: "Histología I",
          etapas: {
            P1: { disponivel: true, resumo: { disponivel: true, preco: 12.9 } },
            P2: { disponivel: true, comboPreco: 15.9, resumo: { disponivel: true } },
            Final: { disponivel: true, resumo: { disponivel: true } },
          },
          comboGeralDisponivel: true,
          comboGeralPreco: 39.9,
        },
        { nome: "Em Breve", etapas: { P1: { disponivel: false, resumo: { disponivel: false, preco: 9 } }, P2: null } },
      ],
      pacotes: { premium: { disponivel: true, preco: 149 }, p2: { disponivel: false, preco: 44.9 } },
    },
    { slug: "semestre-02", materias: [{ nome: "Anatomía II", etapas: {} }], pacotes: {} },
    { slug: "semestre-04", materias: [{ nome: "Fisiología II CDE", etapas: {} }], pacotes: {} },
    { slug: "semestre-05", materias: [], pacotes: {} },
  ],
  anuais: { disponivel: true, preco: 249, precoLancamento: 229, lancamentoAte: "", pares: [[1, 2], [4, 5], [7, 8]] },
};

// ---------- fetch simulado ----------
type Linha = Record<string, any>;
let accessSync: Linha[] = [];
let pagamentoMP: any = null;
let preferenciaCriada: any = null;
let catalogoDisponivel = true;

function filtros(url: URL) {
  const f: [string, string][] = [];
  const em: [string, string[]][] = [];
  url.searchParams.forEach((v, k) => {
    if (v.startsWith("eq.")) f.push([k, decodeURIComponent(v.slice(3))]);
    // PostgREST: plano=in.("a","b") (aspas opcionais)
    if (v.startsWith("in.(") && v.endsWith(")")) em.push([k, v.slice(4, -1).split(",").map((x) => x.replace(/^"|"$/g, ""))]);
  });
  return (l: Linha) => f.every(([k, v]) => String(l[k]) === v) && em.every(([k, vs]) => vs.includes(String(l[k])));
}

const fetchOriginal = globalThis.fetch;
globalThis.fetch = (async (input: any, init: any = {}) => {
  const url = new URL(typeof input === "string" ? input : input.url);
  const metodo = (init.method || "GET").toUpperCase();
  const json = (b: any, status = 200) =>
    new Response(JSON.stringify(b), { status, headers: { "content-type": "application/json" } });

  if (url.href === process.env.CLINICUSMED_CATALOGO_URL) {
    return catalogoDisponivel ? json(CATALOGO) : json({}, 500);
  }
  if (url.hostname === "api.mercadopago.com" && url.pathname === "/checkout/preferences") {
    preferenciaCriada = JSON.parse(init.body);
    return json({ init_point: "https://mp.teste/checkout", sandbox_init_point: "x" });
  }
  if (url.hostname === "api.mercadopago.com" && url.pathname.startsWith("/v1/payments/")) {
    return pagamentoMP ? json(pagamentoMP) : json({ message: "not found" }, 404);
  }
  if (url.hostname === "supabase.teste") {
    const tabela = url.pathname.split("/").pop();
    if (tabela === "pagamentos") return json(metodo === "GET" ? [] : null);
    if (tabela !== "access_sync") throw new Error("tabela inesperada " + tabela);
    const corpo = init.body ? JSON.parse(init.body) : null;
    if (metodo === "GET") return json(accessSync.filter(filtros(url)));
    if (metodo === "POST") {
      const linhas = Array.isArray(corpo) ? corpo : [corpo];
      for (const l of linhas) {
        const i = accessSync.findIndex((x) => x.email === l.email && x.plano === l.plano);
        if (i >= 0) accessSync[i] = { ...accessSync[i], ...l };
        else accessSync.push({ ...l });
      }
      return json(null, 201);
    }
    if (metodo === "PATCH") {
      const alvo = accessSync.filter(filtros(url));
      alvo.forEach((l) => Object.assign(l, corpo));
      return json(alvo.map((l) => ({ email: l.email, plano: l.plano })));
    }
  }
  return fetchOriginal(input, init);
}) as typeof fetch;

// ---------- helpers ----------
let checkoutPOST: (r: NextRequest) => Promise<Response>;
let webhookPOST: (r: NextRequest) => Promise<Response>;
let precos: typeof import("../lib/clinicusmed-precos");

before(async () => {
  precos = await import("../lib/clinicusmed-precos");
  checkoutPOST = (await import("../app/api/checkout/clinicusmed/route")).POST as any;
  webhookPOST = (await import("../app/api/webhook/mercadopago/route")).POST as any;
});

beforeEach(() => {
  accessSync = [];
  pagamentoMP = null;
  preferenciaCriada = null;
  catalogoDisponivel = true;
  precos._limparCachePrecos();
});

function reqCheckout(body: any) {
  return new NextRequest("https://api.teste/api/checkout/clinicusmed", {
    method: "POST",
    headers: { "content-type": "application/json", origin: "https://clinicusmed.com.br" },
    body: JSON.stringify(body),
  });
}

function reqWebhook(paymentId: string, assinar = true) {
  const ts = "1700000000";
  const requestId = "req-123";
  const headers: Record<string, string> = { "content-type": "application/json" };
  if (assinar) {
    const v1 = crypto.createHmac("sha256", SECRET).update(`id:${paymentId};request-id:${requestId};ts:${ts};`).digest("hex");
    headers["x-signature"] = `ts=${ts},v1=${v1}`;
    headers["x-request-id"] = requestId;
  }
  return new NextRequest(`https://api.teste/api/webhook/mercadopago?data.id=${paymentId}&type=payment`, {
    method: "POST",
    headers,
    body: JSON.stringify({ type: "payment", data: { id: paymentId } }),
  });
}

const META = { email: "aluno@teste.com", nome: "Aluno", plano: "semestre-01-pacote-premium", preco_esperado: 149 };

// ---------- tabela de preços ----------
test("tabela de preços replica as regras da loja", () => {
  const t = precos.montarTabelaPrecos(CATALOGO as any);
  assert.equal(t.get("semestre-01-histologia-i-p1-combo")?.preco, 12.9); // resumo.preco
  assert.equal(t.get("semestre-01-histologia-i-p2-combo")?.preco, 15.9); // comboPreco
  assert.equal(t.get("semestre-01-histologia-i-combo")?.preco, 15.9); // Final sem sufixo, preço padrão
  assert.equal(t.get("semestre-01-histologia-i-completo")?.preco, 39.9);
  assert.equal(t.get("semestre-01-pacote-premium")?.preco, 149);
  assert.equal(t.get("semestre-01-pacote-premium-cde")?.preco, 149);
  assert.equal(t.has("semestre-01-pacote-p2"), false); // indisponível
  assert.equal(t.has("semestre-01-em-breve-p1-combo"), false); // indisponível
});

test("catálogo real do site gera produtos e todas as chaves de pacote", () => {
  const caminho = process.env.CATALOGO_REAL || "../cristianoribeiromed-afk/resumos-clinicus/catalogo.json";
  let real: any;
  try {
    real = JSON.parse(readFileSync(caminho, "utf8"));
  } catch {
    return; // catálogo real não disponível neste ambiente
  }
  const t = precos.montarTabelaPrecos(real);
  assert.ok(t.size > 50, `esperava muitos produtos, veio ${t.size}`);
  for (const p of t.values()) assert.ok(p.preco > 0);
});

// ---------- checkout ----------
test("checkout IGNORA preço adulterado e cobra o preço do catálogo", async () => {
  const r = await checkoutPOST(reqCheckout({ ...META, itemNome: "Premium", preco: 0.01 }));
  assert.equal(r.status, 200);
  assert.equal(preferenciaCriada.items[0].unit_price, 149);
  assert.equal(preferenciaCriada.metadata.preco_esperado, 149);
});

test("checkout funciona sem o campo preco", async () => {
  const r = await checkoutPOST(reqCheckout({ email: "a@b.com", nome: "A", plano: "semestre-01-histologia-i-p1-combo", itemNome: "P1" }));
  assert.equal(r.status, 200);
  assert.equal(preferenciaCriada.items[0].unit_price, 12.9);
});

test("checkout recusa produto inexistente ou indisponível", async () => {
  for (const plano of ["semestre-01-pacote-p2", "semestre-09-inventado-combo"]) {
    const r = await checkoutPOST(reqCheckout({ email: "a@b.com", nome: "A", plano, itemNome: "X", preco: 1 }));
    assert.equal(r.status, 400, plano);
  }
  assert.equal(preferenciaCriada, null);
});

test("checkout falha fechado se o catálogo estiver fora do ar", async () => {
  catalogoDisponivel = false;
  const r = await checkoutPOST(reqCheckout({ ...META, itemNome: "Premium", preco: 149 }));
  assert.equal(r.status, 503);
  assert.equal(preferenciaCriada, null);
});

// ---------- webhook ----------
test("webhook libera acesso quando o valor pago é o correto", async () => {
  pagamentoMP = { id: 111, status: "approved", currency_id: "BRL", transaction_amount: 149, metadata: META };
  const r = await webhookPOST(reqWebhook("111"));
  assert.equal(r.status, 200);
  assert.equal(accessSync.length, 1);
  assert.equal(accessSync[0].ativo, true);
});

test("webhook NÃO libera pagamento de R$ 0,01 (preferência antiga adulterada)", async () => {
  pagamentoMP = { id: 112, status: "approved", currency_id: "BRL", transaction_amount: 0.01, metadata: { ...META, preco_esperado: undefined } };
  const r = await webhookPOST(reqWebhook("112"));
  const corpo = await r.json();
  assert.equal(r.status, 200);
  assert.equal(corpo.acessoLiberado, false);
  assert.equal(accessSync.length, 0);
});

test("webhook NÃO libera pagamento em outra moeda", async () => {
  pagamentoMP = { id: 113, status: "approved", currency_id: "USD", transaction_amount: 149, metadata: META };
  await webhookPOST(reqWebhook("113"));
  assert.equal(accessSync.length, 0);
});

test("webhook aceita o preço antigo se o catálogo subiu depois do checkout", async () => {
  pagamentoMP = { id: 114, status: "approved", currency_id: "BRL", transaction_amount: 139.9, metadata: { ...META, preco_esperado: 139.9 } };
  await webhookPOST(reqWebhook("114"));
  assert.equal(accessSync.length, 1);
});

test("webhook sem preço de referência pede reenvio (503) e não libera", async () => {
  catalogoDisponivel = false;
  pagamentoMP = { id: 115, status: "approved", currency_id: "BRL", transaction_amount: 149, metadata: { ...META, preco_esperado: undefined } };
  const r = await webhookPOST(reqWebhook("115"));
  assert.equal(r.status, 503);
  assert.equal(accessSync.length, 0);
});

test("webhook recusa notificação sem assinatura", async () => {
  pagamentoMP = { id: 116, status: "approved", currency_id: "BRL", transaction_amount: 149, metadata: META };
  const r = await webhookPOST(reqWebhook("116", false));
  assert.equal(r.status, 401);
  assert.equal(accessSync.length, 0);
});

test("webhook recusa tudo se o secret não estiver configurado", async () => {
  const antes = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  delete process.env.MERCADOPAGO_WEBHOOK_SECRET;
  try {
    pagamentoMP = { id: 117, status: "approved", currency_id: "BRL", transaction_amount: 149, metadata: META };
    const r = await webhookPOST(reqWebhook("117"));
    assert.equal(r.status, 401);
    assert.equal(accessSync.length, 0);
  } finally {
    process.env.MERCADOPAGO_WEBHOOK_SECRET = antes;
  }
});

test("estorno revoga o acesso liberado por aquela transação", async () => {
  pagamentoMP = { id: 118, status: "approved", currency_id: "BRL", transaction_amount: 149, metadata: META };
  await webhookPOST(reqWebhook("118"));
  assert.equal(accessSync[0].ativo, true);
  pagamentoMP = { ...pagamentoMP, status: "refunded" };
  const r = await webhookPOST(reqWebhook("118"));
  assert.equal((await r.json()).acessoRevogado, true);
  assert.equal(accessSync[0].ativo, false);
});

test("estorno de OUTRA transação não derruba acesso comprado depois", async () => {
  accessSync.push({ email: META.email, plano: META.plano, ativo: true, id_transacao: "200" });
  pagamentoMP = { id: 199, status: "charged_back", currency_id: "BRL", transaction_amount: 149, metadata: META };
  await webhookPOST(reqWebhook("199"));
  assert.equal(accessSync[0].ativo, true);
});

test("reenvio do mesmo pagamento aprovado é idempotente", async () => {
  pagamentoMP = { id: 120, status: "approved", currency_id: "BRL", transaction_amount: 149, metadata: META };
  await webhookPOST(reqWebhook("120"));
  const data = accessSync[0].data_liberacao;
  await webhookPOST(reqWebhook("120"));
  assert.equal(accessSync.length, 1);
  assert.equal(accessSync[0].data_liberacao, data);
});


// ---------- Plano Anual ----------
test("Plano Anual: preço normal e chave -cde só quando há matéria CDE", () => {
  const t = precos.montarTabelaPrecos(CATALOGO as any);
  assert.equal(t.get("semestre-01-02-pacote-anual")?.preco, 249);
  assert.equal(t.has("semestre-01-02-pacote-anual-cde"), false);
  assert.equal(t.get("semestre-04-05-pacote-anual")?.preco, 249);
  assert.equal(t.get("semestre-04-05-pacote-anual-cde")?.preco, 249);
  assert.equal(t.has("semestre-07-08-pacote-anual"), false); // semestres inexistentes
});

test("Plano Anual: preço de lançamento vale até a data (inclusive, horário de Brasília)", () => {
  const cat = { ...CATALOGO, anuais: { ...CATALOGO.anuais, lancamentoAte: "2026-10-20" } } as any;
  const dia20noite = new Date("2026-10-21T02:30:00Z"); // 23:30 em Brasília, dia 20
  const dia21 = new Date("2026-10-21T03:30:00Z");      // 00:30 em Brasília, dia 21
  assert.equal(precos.montarTabelaPrecos(cat, dia20noite).get("semestre-01-02-pacote-anual")?.preco, 229);
  assert.equal(precos.montarTabelaPrecos(cat, dia21).get("semestre-01-02-pacote-anual")?.preco, 249);
});

test("Plano Anual: indisponível some do checkout", () => {
  const cat = { ...CATALOGO, anuais: { ...CATALOGO.anuais, disponivel: false } } as any;
  assert.equal(precos.montarTabelaPrecos(cat).has("semestre-01-02-pacote-anual"), false);
});

test("checkout do Plano Anual cobra R$ 249 mesmo se o navegador mandar outro valor", async () => {
  const r = await checkoutPOST(reqCheckout({ email: "a@b.com", nome: "A", plano: "semestre-01-02-pacote-anual", itemNome: "Plano Anual", preco: 1 }));
  assert.equal(r.status, 200);
  assert.equal(preferenciaCriada.items[0].unit_price, 249);
});


// ---------- carrinho (vários planos num pagamento) ----------
const CARRINHO = ["semestre-01-histologia-i-p2-combo", "semestre-01-histologia-i-combo"]; // P2 + Final de uma matéria
const META_CARRINHO = { email: "aluno@teste.com", nome: "Aluno", planos: CARRINHO.join(","), preco_esperado: 31.8 };

test("carrinho: cobra a soma dos preços oficiais, um item por plano, mesmo com preço adulterado", async () => {
  const r = await checkoutPOST(reqCheckout({ email: "a@b.com", nome: "A", plano: CARRINHO[0], itemNome: "Pedido", preco: 1, planos: CARRINHO,
    titulos: { [CARRINHO[0]]: "Histología I — P2", [CARRINHO[1]]: "Histología I — Final" } }));
  assert.equal(r.status, 200);
  assert.deepEqual(preferenciaCriada.items.map((i: any) => [i.title, i.unit_price]), [["Histología I — P2", 15.9], ["Histología I — Final", 15.9]]);
  assert.equal(preferenciaCriada.metadata.planos, CARRINHO.join(","));
  assert.equal(preferenciaCriada.metadata.plano, undefined);
  assert.equal(preferenciaCriada.metadata.preco_esperado, 31.8);
  assert.ok(preferenciaCriada.external_reference.length <= 256);
});

test("carrinho: recusa pedido com item inexistente ou com mais de 20 itens", async () => {
  let r = await checkoutPOST(reqCheckout({ email: "a@b.com", nome: "A", plano: CARRINHO[0], itemNome: "Pedido", planos: [...CARRINHO, "semestre-09-inventado-combo"] }));
  assert.equal(r.status, 400);
  r = await checkoutPOST(reqCheckout({ email: "a@b.com", nome: "A", plano: CARRINHO[0], itemNome: "Pedido", planos: Array.from({ length: 21 }, (_, i) => "x" + i) }));
  assert.equal(r.status, 400);
  assert.equal(preferenciaCriada, null);
});

test("carrinho com 1 item só (ou repetido) segue o caminho de sempre", async () => {
  const r = await checkoutPOST(reqCheckout({ ...META, itemNome: "Premium", planos: [META.plano, META.plano] }));
  assert.equal(r.status, 200);
  assert.equal(preferenciaCriada.metadata.plano, META.plano);
  assert.equal(preferenciaCriada.items.length, 1);
});

test("webhook do carrinho libera TODOS os itens do pedido", async () => {
  pagamentoMP = { id: 301, status: "approved", currency_id: "BRL", transaction_amount: 31.8, metadata: META_CARRINHO };
  const r = await webhookPOST(reqWebhook("301"));
  assert.equal(r.status, 200);
  assert.deepEqual(accessSync.map((l) => l.plano).sort(), [...CARRINHO].sort());
  assert.ok(accessSync.every((l) => l.ativo && l.id_transacao === "301"));
});

test("webhook do carrinho NÃO libera se pagou menos que a soma", async () => {
  pagamentoMP = { id: 302, status: "approved", currency_id: "BRL", transaction_amount: 15.9, metadata: META_CARRINHO };
  const corpo = await (await webhookPOST(reqWebhook("302"))).json();
  assert.equal(corpo.acessoLiberado, false);
  assert.equal(accessSync.length, 0);
});

test("estorno do carrinho revoga todos os itens, e só os dessa transação", async () => {
  accessSync.push({ email: META.email, plano: "semestre-01-pacote-premium", ativo: true, id_transacao: "999" });
  pagamentoMP = { id: 303, status: "approved", currency_id: "BRL", transaction_amount: 31.8, metadata: META_CARRINHO };
  await webhookPOST(reqWebhook("303"));
  pagamentoMP = { ...pagamentoMP, status: "refunded" };
  await webhookPOST(reqWebhook("303"));
  for (const p of CARRINHO) assert.equal(accessSync.find((l) => l.plano === p)!.ativo, false);
  assert.equal(accessSync.find((l) => l.plano === "semestre-01-pacote-premium")!.ativo, true);
});

test("reenvio do webhook do carrinho é idempotente", async () => {
  pagamentoMP = { id: 304, status: "approved", currency_id: "BRL", transaction_amount: 31.8, metadata: META_CARRINHO };
  await webhookPOST(reqWebhook("304"));
  const datas = accessSync.map((l) => l.data_liberacao);
  await webhookPOST(reqWebhook("304"));
  assert.equal(accessSync.length, 2);
  assert.deepEqual(accessSync.map((l) => l.data_liberacao), datas);
});
