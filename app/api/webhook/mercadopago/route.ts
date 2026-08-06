import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import crypto from "node:crypto";

/**
 * Verifica a assinatura do webhook do Mercado Pago (x-signature).
 * Documentação oficial: https://www.mercadopago.com.br/developers/pt/docs/checkout-pro/webhooks
 *
 * Formato do header x-signature: "ts=1704908010,v1=618c853452..."
 * O "manifest" assinado é: id:{dataId};request-id:{xRequestId};ts:{ts};
 *
 * Se MERCADOPAGO_WEBHOOK_SECRET não estiver configurada, a verificação
 * é PULADA (com log de aviso) em vez de bloquear o webhook inteiro —
 * isso permite configurar o secret no painel do Mercado Pago e na
 * Vercel sem quebrar pagamentos no meio do caminho. Depois que a
 * variável existir, a verificação passa a ser obrigatória.
 */
function verificarAssinaturaWebhook(
  xSignature: string | null,
  xRequestId: string | null,
  dataId: string | null,
): { valido: boolean; motivo?: string } {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  if (!secret) {
    console.warn(
      "MERCADOPAGO_WEBHOOK_SECRET não configurada — pulando verificação de assinatura. Configure o secret no painel do Mercado Pago (Webhooks > Configurar assinatura secreta) e na Vercel assim que possível.",
    );
    return { valido: true, motivo: "secret_nao_configurado" };
  }

  if (!xSignature || !xRequestId || !dataId) {
    return { valido: false, motivo: "headers_ausentes" };
  }

  const partes = Object.fromEntries(
    xSignature.split(",").map((p) => {
      const [k, v] = p.split("=");
      return [k?.trim(), v?.trim()];
    }),
  );
  const ts = partes["ts"];
  const v1 = partes["v1"];
  if (!ts || !v1) {
    return { valido: false, motivo: "formato_assinatura_invalido" };
  }

  const manifest = `id:${dataId.toLowerCase()};request-id:${xRequestId};ts:${ts};`;
  const hashCalculado = crypto
    .createHmac("sha256", secret)
    .update(manifest)
    .digest("hex");

  const assinaturaValida =
    hashCalculado.length === v1.length &&
    crypto.timingSafeEqual(Buffer.from(hashCalculado), Buffer.from(v1));

  return { valido: assinaturaValida, motivo: assinaturaValida ? undefined : "hash_nao_bate" };
}

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

async function enviarEmailConfirmacaoClinicusMed(email: string, nome: string, planoLabel: string) {
  if (!resend) {
    console.warn("RESEND_API_KEY não configurada — pulando envio de e-mail (ClinicusMed).");
    return;
  }
  const siteUrl = process.env.CLINICUSMED_SITE_URL || "https://clinicusmed.com.br";
  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "ClinicusMed <acesso@clinicusmed.com.br>",
      to: email,
      subject: "✅ Pagamento confirmado — seja bem-vindo(a) ao ClinicusMed!",
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; background: #f7f4ef;">
          <h2 style="color: #0D8CF5;">Oi, ${nome}! 👋</h2>
          <p>Pagamento confirmado! ✅ Seu material (<strong>${planoLabel}</strong>) vai ser liberado em alguns minutos.</p>
          <p style="text-align: center; margin: 24px 0;">
            <a href="${siteUrl}" style="background: #0D8CF5; color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: bold;">
              Acessar o ClinicusMed
            </a>
          </p>
          <p style="font-size: 13px; color: #666;">Use o mesmo e-mail que você usou na compra (${email}) pra confirmar o acesso na plataforma.</p>
          <p>Seja bem-vindo(a) ao ClinicusMed — bons estudos! 🩺</p>
        </div>
      `,
    });
  } catch (e) {
    console.error("Erro ao enviar e-mail de confirmação ClinicusMed:", e);
  }
}

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder-key";

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Sincroniza a liberação de acesso com a planilha do Google Sheets (via
// Google Apps Script), que é a mesma planilha que o site estático já lê
// hoje pelo CSV publicado. NUNCA deve travar o webhook do Mercado Pago —
// por isso é sempre chamada dentro de um try/catch que só loga o erro.
// O Supabase (access_sync) continua sendo a fonte de verdade; a planilha é
// só um espelho automático pra não precisar mais editar na mão.
async function sincronizarPlanilhaAcessos(params: {
  email: string;
  plano: string;
  nome: string | null;
  origem: string;
  idTransacao: string;
}) {
  const url = process.env.APPS_SCRIPT_WEBHOOK_URL;
  const secret = process.env.APPS_SCRIPT_SECRET;

  if (!url || !secret) {
    console.warn(
      "APPS_SCRIPT_WEBHOOK_URL ou APPS_SCRIPT_SECRET não configurados — pulando sincronização com a planilha.",
    );
    return;
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        secret,
        email: params.email,
        plano: params.plano,
        nome: params.nome,
        ativo: true,
        origem: params.origem,
        idTransacao: params.idTransacao,
      }),
    });
    const data = await response.json();
    if (!data.ok) {
      console.error("Apps Script retornou erro ao sincronizar planilha:", data);
    }
  } catch (e) {
    console.error("Falha ao chamar o Apps Script de sincronização da planilha:", e);
  }
}

export async function POST(request: NextRequest) {
  // Skip if using placeholder credentials
  if (
    !process.env.SUPABASE_SERVICE_ROLE_KEY ||
    !process.env.MERCADOPAGO_ACCESS_TOKEN
  ) {
    return NextResponse.json(
      { error: "Service not configured" },
      { status: 500 },
    );
  }

  try {
    const body = await request.json();
    const { type, data } = body;

    // Verificação de assinatura — confirma que essa notificação veio
    // mesmo do Mercado Pago, e não de alguém forjando uma chamada pro
    // nosso endpoint. Ver função verificarAssinaturaWebhook() acima.
    const xSignature = request.headers.get("x-signature");
    const xRequestId = request.headers.get("x-request-id");
    const dataIdQuery = request.nextUrl.searchParams.get("data.id");
    const { valido, motivo } = verificarAssinaturaWebhook(
      xSignature,
      xRequestId,
      dataIdQuery || (data?.id ? String(data.id) : null),
    );
    if (!valido) {
      console.error("Assinatura de webhook do Mercado Pago inválida:", motivo);
      return NextResponse.json(
        { error: "Invalid webhook signature" },
        { status: 401 },
      );
    }

    if (type !== "payment") {
      return NextResponse.json({ received: true });
    }

    const paymentId = data.id;

    // Verify the payment with Mercado Pago API
    const response = await fetch(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
        },
      },
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "Payment verification failed" },
        { status: 400 },
      );
    }

    const payment = await response.json();

    // Find the payment record by external reference
    const { data: paymentRecord } = await supabase
      .from("pagamentos")
      .select("*")
      .eq("id", payment.external_reference)
      .maybeSingle();

    if (!paymentRecord) {
      // Não é um pagamento da Clinicus SaaS — verifica se é do ClinicusMed
      // (identificado pelo metadata email/plano, setado na criacao do
      // checkout em /api/checkout/clinicusmed)
      const meta = payment.metadata || {};
      if (meta.email && meta.plano) {
        if (payment.status !== "approved") {
          return NextResponse.json({ received: true, origem: "clinicusmed", status: payment.status });
        }

        const email = String(meta.email).toLowerCase().trim();
        const plano = String(meta.plano);
        const nome = meta.nome ? String(meta.nome) : null;
        const idTransacao = String(payment.id);

        const { data: existente } = await supabase
          .from("access_sync")
          .select("id_transacao, data_liberacao")
          .eq("email", email)
          .eq("plano", plano)
          .maybeSingle();
        const jaProcessado = (existente as any)?.id_transacao === idTransacao;

        // Idempotência: se já processamos essa transação antes (reenvio
        // de webhook), preserva a data_liberacao ORIGINAL em vez de
        // sobrescrever com a data de hoje a cada retry.
        const dataLiberacao = jaProcessado && (existente as any)?.data_liberacao
          ? (existente as any).data_liberacao
          : new Date().toISOString().split("T")[0];

        const { error: upsertError } = await supabase.from("access_sync").upsert(
          {
            email,
            nome,
            plano,
            ativo: true,
            data_liberacao: dataLiberacao,
            origem: "mercadopago",
            id_transacao: idTransacao,
          },
          { onConflict: "email,plano" }
        );

        if (upsertError) {
          console.error("Erro ao gravar acesso ClinicusMed:", upsertError);
          return NextResponse.json({ error: "Erro ao gravar acesso ClinicusMed." }, { status: 500 });
        }

        if (!jaProcessado) {
          await enviarEmailConfirmacaoClinicusMed(email, nome || "aluno(a)", plano);
        }

        // Espelha a liberação na planilha do Google Sheets — não bloqueia
        // nem falha o webhook se der problema (ver comentário na função).
        await sincronizarPlanilhaAcessos({
          email,
          plano,
          nome,
          origem: "mercadopago",
          idTransacao,
        });

        return NextResponse.json({ received: true, origem: "clinicusmed", acessoLiberado: true, email, plano });
      }

      return NextResponse.json(
        { error: "Payment record not found" },
        { status: 400 },
      );
    }

    // Idempotência: se esse pagamento JÁ estava aprovado antes desse
    // webhook (ex: Mercado Pago reenviando a notificação, que é
    // comportamento normal e esperado de webhook), não deve estender o
    // plano de novo. Sem essa checagem, cada reenvio empurraria
    // plan_expires_at mais 30/365 dias a partir de "agora", dando dias
    // extras de graça pro aluno a cada retry.
    const jaEstavaAprovado = (paymentRecord as any).status === "approved";

    // Update payment status
    await supabase
      .from("pagamentos")
      .update({
        status: payment.status,
        metodo_pagamento:
          payment.payment_method_id === "pix" ? "pix" : "credit_card",
        aprovado_em:
          payment.status === "approved" ? new Date().toISOString() : null,
      })
      .eq("id", (paymentRecord as any).id);

    // If payment approved, activate user subscription — só na primeira
    // vez que esse pagamento específico transiciona pra "approved".
    if (payment.status === "approved" && !jaEstavaAprovado) {
      const planExpiresAt =
        (paymentRecord as any).plano === "annual"
          ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      await supabase
        .from("users")
        .update({
          plan: (paymentRecord as any).plano,
          plan_expires_at: planExpiresAt.toISOString(),
        })
        .eq("id", (paymentRecord as any).user_id);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json({ status: "ok" });
}
