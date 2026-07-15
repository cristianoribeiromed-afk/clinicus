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

// Origens autorizadas a chamar essa rota a partir do navegador do aluno.
// O site estático do ClinicusMed roda em domínio diferente da API (Vercel),
// então sem esses headers o navegador bloqueia a chamada por CORS.
const ALLOWED_ORIGINS = [
  "https://clinicusmed.com.br",
  "https://www.clinicusmed.com.br",
  "https://cristianoribeiromed-afk.github.io",
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
  preco: number;
}

function isValidPayload(body: unknown): body is CheckoutPayload {
  if (typeof body !== "object" || body === null) return false;
  const b = body as Record<string, unknown>;
  return (
    typeof b.email === "string" && b.email.includes("@") &&
    typeof b.nome === "string" && b.nome.length > 0 &&
    typeof b.plano === "string" && b.plano.length > 0 &&
    typeof b.itemNome === "string" && b.itemNome.length > 0 &&
    typeof b.preco === "number" && b.preco > 0
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
      { success: false, message: "Payload inválido. Campos obrigatórios: email, nome, plano, itemNome, preco." },
      { status: 400, headers: cors }
    );
  }

  const { email, nome, plano, itemNome, preco } = body;
  const siteUrl = process.env.CLINICUSMED_SITE_URL || "https://clinicusmed.com.br";

  const preference = {
    items: [
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
    metadata: { email, nome, plano },
    external_reference: `${plano}|${email}`, // identificador de reserva, redundante com o metadata
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
