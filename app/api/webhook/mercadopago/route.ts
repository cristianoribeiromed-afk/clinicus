import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

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
      subject: "✅ Seu acesso ao ClinicusMed está liberado!",
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; background: #f7f4ef;">
          <h2 style="color: #0D8CF5;">Oi, ${nome}! 👋</h2>
          <p>Seu pagamento foi confirmado e o acesso ao <strong>${planoLabel}</strong> já está liberado.</p>
          <p>Pode entrar na plataforma agora mesmo:</p>
          <p style="text-align: center; margin: 24px 0;">
            <a href="${siteUrl}" style="background: #0D8CF5; color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: bold;">
              Acessar o ClinicusMed
            </a>
          </p>
          <p style="font-size: 13px; color: #666;">Use o mesmo e-mail que você usou na compra (${email}) pra confirmar o acesso na plataforma.</p>
          <p style="font-size: 13px; color: #666;">Qualquer dúvida, só chamar no WhatsApp. Bons estudos! 🩺</p>
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
          .select("id_transacao")
          .eq("email", email)
          .eq("plano", plano)
          .maybeSingle();
        const jaProcessado = (existente as any)?.id_transacao === idTransacao;

        const { error: upsertError } = await supabase.from("access_sync").upsert(
          {
            email,
            nome,
            plano,
            ativo: true,
            data_liberacao: new Date().toISOString().split("T")[0],
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

        return NextResponse.json({ received: true, origem: "clinicusmed", acessoLiberado: true, email, plano });
      }

      return NextResponse.json(
        { error: "Payment record not found" },
        { status: 400 },
      );
    }

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

    // If payment approved, activate user subscription
    if (payment.status === "approved") {
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
