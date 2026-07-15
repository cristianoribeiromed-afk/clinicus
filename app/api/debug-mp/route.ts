// app/api/debug-mp/route.ts
//
// ROTA TEMPORÁRIA DE DIAGNÓSTICO — criada em 15/07/2026 pra investigar o bug
// do Checkout Pro caindo em modo Sandbox mesmo com credencial de produção.
// NÃO expõe o token completo. Remover depois que o diagnóstico terminar.

import { NextResponse } from "next/server";

export async function GET() {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN;

  if (!token) {
    return NextResponse.json({
      error: "MERCADOPAGO_ACCESS_TOKEN nao esta definido em runtime.",
    });
  }

  const prefix = token.slice(0, 8); // ex: "APP_USR-" ou "TEST-123"
  const isLikelyProd = token.startsWith("APP_USR-");
  const isLikelyTest = token.startsWith("TEST-");

  let mpApiCheck: unknown = null;
  try {
    const response = await fetch(
      "https://api.mercadopago.com/v1/payment_methods",
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    const data = await response.json();

    // /v1/payment_methods nao diferencia prod/test no corpo, mas o status
    // e o header ajudam a confirmar que o token AUTENTICA de fato.
    mpApiCheck = {
      status: response.status,
      ok: response.ok,
      isArray: Array.isArray(data),
      count: Array.isArray(data) ? data.length : null,
      errorMessage: !response.ok ? data?.message || data : null,
    };
  } catch (e) {
    mpApiCheck = { error: String(e) };
  }

  // Segunda checagem: consulta o proprio usuario associado ao token.
  // O campo "live_mode" ali (quando presente em respostas de preference/payment)
  // e o indicador mais direto de producao vs teste.
  let userCheck: unknown = null;
  try {
    const response = await fetch("https://api.mercadopago.com/users/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    userCheck = {
      status: response.status,
      id: data?.id,
      site_id: data?.site_id,
      live_mode: data?.live_mode,
      // NAO retornar email/nome completos por precaucao, so o essencial:
      email_domain: data?.email ? data.email.split("@")[1] : null,
    };
  } catch (e) {
    userCheck = { error: String(e) };
  }

  return NextResponse.json({
    tokenPrefix: prefix,
    tokenLength: token.length,
    isLikelyProd,
    isLikelyTest,
    mpApiCheck,
    userCheck,
    vercelEnv: process.env.VERCEL_ENV || null,
    nodeEnv: process.env.NODE_ENV || null,
  });
}
