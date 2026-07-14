// app/api/webhook/clinicusmed-mp/route.ts
//
// Recebe a notificação do Mercado Pago quando um pagamento do ClinicusMed
// muda de status. Quando aprovado:
//   1. grava/atualiza o acesso na tabela access_sync (Supabase)
//   2. envia o e-mail de confirmação pro aluno (Resend)
//
// Esse é o coração da automação: depois que isso roda, o aluno já
// tem acesso, sem nenhuma ação manual sua.
//
// Configure essa URL no Mercado Pago (Aplicações > sua app > Webhooks):
//   https://SEU-DOMINIO-VERCEL.vercel.app/api/webhook/clinicusmed-mp
//
// Variáveis de ambiente necessárias:
//   MERCADOPAGO_ACCESS_TOKEN     (já existe no projeto)
//   SUPABASE_SERVICE_ROLE_KEY    (já existe no projeto)
//   NEXT_PUBLIC_SUPABASE_URL     (já existe no projeto)
//   RESEND_API_KEY               (novo — resend.com, tem plano grátis)
//   RESEND_FROM_EMAIL            (ex: "ClinicusMed <acesso@clinicusmed.com.br>")
//   CLINICUSMED_SITE_URL         (ex: https://clinicusmed.com.br)

import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { supabase } from "@/lib/supabase-server";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

interface MPPayment {
  id: number;
  status: string; // "approved" | "pending" | "rejected" | ...
  metadata: {
    email?: string;
    nome?: string;
    plano?: string;
  };
}

async function buscarPagamento(paymentId: string): Promise<MPPayment | null> {
  const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    headers: { Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}` },
  });
  if (!response.ok) return null;
  return response.json();
}

async function enviarEmailConfirmacao(
  email: string,
  nome: string,
  planoLabel: string
): Promise<{ enviado: boolean; motivo?: string }> {
  if (!resend) {
    console.warn("RESEND_API_KEY não configurada — pulando envio de e-mail.");
    return { enviado: false, motivo: "Resend não configurado" };
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
    return { enviado: true };
  } catch (e) {
    console.error("Erro ao enviar e-mail:", e);
    return { enviado: false, motivo: String(e) };
  }
}

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    // Mercado Pago às vezes manda notificação sem corpo JSON válido (ping de teste)
    return NextResponse.json({ received: true });
  }

  const { type, data } = body || {};

  // só nos interessa notificação de pagamento
  if (type !== "payment" || !data?.id) {
    return NextResponse.json({ received: true });
  }

  if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
    console.error("MERCADOPAGO_ACCESS_TOKEN ausente no servidor.");
    return NextResponse.json({ error: "Servidor não configurado" }, { status: 500 });
  }

  const payment = await buscarPagamento(String(data.id));
  if (!payment) {
    return NextResponse.json({ error: "Pagamento não encontrado no Mercado Pago" }, { status: 400 });
  }

  // só age quando o pagamento está de fato aprovado
  if (payment.status !== "approved") {
    return NextResponse.json({ received: true, status: payment.status });
  }

  const { email, nome, plano } = payment.metadata || {};
  if (!email || !plano) {
    console.error("Pagamento aprovado sem metadata suficiente:", payment.id, payment.metadata);
    return NextResponse.json(
      { error: "Pagamento aprovado, mas sem email/plano no metadata — verificação manual necessária." },
      { status: 400 }
    );
  }

  const idTransacao = String(payment.id);

  // idempotência: se esse pagamento específico já foi processado antes
  // (o Mercado Pago pode reenviar a mesma notificação), não reenvia e-mail de novo
  const { data: existente } = await supabase
    .from("access_sync")
    .select("id_transacao")
    .eq("email", email.toLowerCase().trim())
    .eq("plano", plano)
    .maybeSingle();

  const jaProcessado = existente?.id_transacao === idTransacao;

  // upsert idempotente — mesmo que rode de novo, o resultado final é o mesmo
  const { error: upsertError } = await supabase.from("access_sync").upsert(
    {
      email: email.toLowerCase().trim(),
      nome: nome || null,
      plano,
      ativo: true,
      data_liberacao: new Date().toISOString().split("T")[0],
      origem: "mercadopago",
      id_transacao: idTransacao,
    },
    { onConflict: "email,plano" }
  );

  if (upsertError) {
    console.error("Erro ao gravar acesso no Supabase:", upsertError);
    return NextResponse.json({ error: "Erro ao gravar acesso." }, { status: 500 });
  }

  let emailResultado: { enviado: boolean; motivo?: string } = {
    enviado: false,
    motivo: "Já processado anteriormente",
  };
  if (!jaProcessado) {
    emailResultado = await enviarEmailConfirmacao(email, nome || "aluno(a)", plano);
  }

  return NextResponse.json({
    received: true,
    acessoLiberado: true,
    email,
    plano,
    emailConfirmacao: emailResultado,
  });
}

export async function GET() {
  return NextResponse.json({ status: "ok" });
}
