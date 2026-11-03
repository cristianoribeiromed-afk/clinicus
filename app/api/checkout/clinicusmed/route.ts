// app/api/checkout/clinicusmed/route.ts
//
// Cria uma "preferência de pagamento" no Mercado Pago (Checkout Pro) pra
// um produto do ClinicusMed, e devolve o link de checkout pro navegador
// do aluno abrir.
//
// Isso substitui a geração de código PIX direto no index.html — em vez
// de montar o payload EMV na hora, o site vai chamar essa rota e
// redirecionar o aluno pro checkout hospedado do Mercado Pago.
//
// Variáveis de ambiente necessárias (além das que já existem no projeto):
//   MERCADOPAGO_ACCESS_TOKEN   (já existe — mesmo token usado no outro webhook)
//   CLINICUSMED_SITE_URL       (ex: https://clinicusmed.com.br)

import { NextRequest, NextResponse } from "next/server";
import { obterTabelaPrecos } from "@/lib/clinicusmed-precos";

// Origens autorizadas a chamar essa rota a partir do navegador do aluno.
// O site estático do ClinicusMed roda em domínio diferente da API (Vercel),
// então sem esses headers o navegador bloqueia a chamada por CORS.
const ALLOWED_ORIGINS = [
  "https://clinicusmed.com.br",
  "https://www.clinicusmed.com.br",
  "https://cristianoribeiromed-afk.github.io",
  // Endereço de teste do porteiro na Cloudflare (antes da troca do domínio)
  "https://resumos-clinicus.cristianoribeiromed.workers.dev",
];

function corsHeaders(origin: string | null) {
  const allowOrigin =
    origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(req.headers.get("origin")),
  });
}

interface CheckoutPayload {
  email: string;
  nome: string;
  plano: string;      // ex: "semestre-03-fisiologia-i-combo" — a mesma chave usada no catalogo.json
  itemNome: string;    // nome bonito pra mostrar no checkout, ex: "Combo 3º Semestre"
  // O navegador ainda envia "preco", mas ele é IGNORADO: o preço cobrado
  // sai sempre do catalogo.json, no servidor (lib/clinicusmed-precos.ts).
  preco?: number;
  // Carrinho da loja: vários planos num pagamento só. Cada um é cobrado pelo
  // preço oficial; o total é a soma. (A troca de matérias por pacote é feita
  // pela loja antes; aqui só existem planos normais, pelo preço normal.)
  planos?: string[];
  titulos?: Record<string, string>; // só para o texto do checkout
}

const MAX_ITENS_CARRINHO = 20;

/** Lista de planos do carrinho, normalizada; null se não veio carrinho. */
function planosDoCarrinho(body: CheckoutPayload): string[] | null {
  if (!Array.isArray(body.planos)) return null;
  const lista = [...new Set(body.planos.filter((p) => typeof p === "string").map((p) => p.trim().toLowerCase()).filter(Boolean))];
  return lista.length > 1 ? lista : null;
}

function isValidPayload(body: unknown): body is CheckoutPayload {
  if (typeof body !== "object" || body === null) return false;
  const b = body as Record<string, unknown>;
  return (
    typeof b.email === "string" && b.email.includes("@") &&
    typeof b.nome === "string" && b.nome.length > 0 &&
    typeof b.plano === "string" && b.plano.length > 0 &&
    typeof b.itemNome === "string" && b.itemNome.length > 0
  );
}

export async function POST(req: NextRequest) {
  const cors = corsHeaders(req.headers.get("origin"));

  if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
    return NextResponse.json(
      { success: false, message: "Mercado Pago não configurado no servidor." },
      { status: 500, headers: cors }
    );
  }
  if (!process.env.CLINICUS_API_URL) {
    return NextResponse.json(
      { success: false, message: "CLINICUS_API_URL não configurada — o Mercado Pago não saberia pra onde enviar a confirmação." },
      { status: 500, headers: cors }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, message: "JSON inválido." }, { status: 400, headers: cors });
  }

  if (!isValidPayload(body)) {
    return NextResponse.json(
      { success: false, message: "Payload inválido. Campos obrigatórios: email, nome, plano, itemNome." },
      { status: 400, headers: cors }
    );
  }

  const email = body.email.trim().toLowerCase();
  const nome = body.nome.trim().slice(0, 120);
  const plano = body.plano.trim();
  const itemNome = body.itemNome.trim().slice(0, 200);
  const carrinho = planosDoCarrinho(body);
  if (carrinho && carrinho.length > MAX_ITENS_CARRINHO) {
    return NextResponse.json(
      { success: false, message: `O carrinho aceita até ${MAX_ITENS_CARRINHO} itens por pedido.` },
      { status: 400, headers: cors }
    );
  }

  // Preço definido pelo SERVIDOR a partir do catálogo publicado.
  let preco: number;
  let linhas: { plano: string; preco: number }[] = [];
  try {
    const tabela = await obterTabelaPrecos();
    if (carrinho) {
      const faltando = carrinho.filter((p) => !tabela.has(p));
      if (faltando.length) {
        console.warn("Carrinho com plano fora do catálogo:", faltando);
        return NextResponse.json(
          { success: false, message: "Um dos itens do carrinho não está mais disponível. Recarregue a página e tente de novo." },
          { status: 400, headers: cors }
        );
      }
      linhas = carrinho.map((p) => ({ plano: p, preco: tabela.get(p)!.preco }));
      preco = linhas.reduce((s, l) => s + Math.round(l.preco * 100), 0) / 100;
    } else {
      const produto = tabela.get(plano);
      if (!produto) {
        return NextResponse.json(
          { success: false, message: "Produto não encontrado ou indisponível. Recarregue a página e tente de novo." },
          { status: 400, headers: cors }
        );
      }
      preco = produto.preco;
    }
  } catch (e) {
    console.error("Não foi possível ler o catálogo de preços:", e);
    return NextResponse.json(
      { success: false, message: "Checkout temporariamente indisponível. Tente de novo em alguns minutos." },
      { status: 503, headers: cors }
    );
  }
  if (typeof body.preco === "number" && Math.abs(body.preco - preco) > 0.009) {
    console.warn("Preço enviado pelo navegador diverge do catálogo (ignorado):", { plano: carrinho ?? plano, enviado: body.preco, catalogo: preco });
  }

  const siteUrl = process.env.CLINICUSMED_SITE_URL || "https://clinicusmed.com.br";
  const titulos = body.titulos && typeof body.titulos === "object" ? body.titulos : {};
  const tituloDe = (p: string) => {
    const t = titulos[p];
    return (typeof t === "string" && t.trim() ? t.trim() : p).slice(0, 200);
  };

  const preference = {
    items: carrinho
      ? linhas.map((l) => ({ title: tituloDe(l.plano), quantity: 1, unit_price: l.preco, currency_id: "BRL" }))
      : [
          {
            title: itemNome,
            quantity: 1,
            unit_price: preco,
            currency_id: "BRL",
          },
        ],
    payer: { email, name: nome },
    // metadata volta junto no objeto de pagamento quando o webhook dispara —
    // é assim que a gente sabe QUEM comprou O QUÊ, sem precisar de mais nada.
    // preco_esperado é gravado pelo servidor (o comprador não consegue
    // alterá-lo) e é conferido de novo no webhook.
    // Carrinho: "planos" leva a lista separada por vírgula (e não "plano").
    metadata: carrinho
      ? { email, nome, planos: carrinho.join(","), preco_esperado: preco }
      : { email, nome, plano, preco_esperado: preco },
    // identificador de reserva, redundante com o metadata (o Mercado Pago aceita até 256 caracteres)
    external_reference: (carrinho ? `carrinho-${carrinho.length}|${email}` : `${plano}|${email}`).slice(0, 256),
    back_urls: {
      success: `${siteUrl}/?pagamento=sucesso`,
      failure: `${siteUrl}/?pagamento=falha`,
      pending: `${siteUrl}/?pagamento=pendente`,
    },
    auto_return: "approved",
    // Aponta pra rota UNICA de webhook que ja existe no projeto (a mesma
    // que a Clinicus SaaS usa) - o Mercado Pago so aceita 1 URL de webhook
    // por aplicacao. A rota /api/webhook/mercadopago distingue pagamentos
    // do ClinicusMed (via metadata email/plano) dos da Clinicus SaaS
    // (via external_reference apontando pra tabela "pagamentos").
    notification_url: `${process.env.CLINICUS_API_URL}/api/webhook/mercadopago`,
  };

  try {
    const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(preference),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Erro ao criar preferência MP:", data);
      return NextResponse.json(
        { success: false, message: data.message || "Erro ao criar checkout." },
        { status: 500, headers: cors }
      );
    }

    return NextResponse.json({
      success: true,
      checkoutUrl: data.init_point,
      sandboxUrl: data.sandbox_init_point,
    }, { headers: cors });
  } catch (e) {
    console.error("Falha de conexão com Mercado Pago:", e);
    return NextResponse.json(
      { success: false, message: "Falha de conexão com o Mercado Pago." },
      { status: 500, headers: cors }
    );
  }
}
