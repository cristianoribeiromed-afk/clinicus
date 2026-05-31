import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-key';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

export async function POST(request: NextRequest) {
  // Skip if using placeholder credentials
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.MERCADOPAGO_ACCESS_TOKEN) {
    return NextResponse.json({ error: 'Service not configured' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const { type, data } = body;

    if (type !== 'payment') {
      return NextResponse.json({ received: true });
    }

    const paymentId = data.id;

    // Verify the payment with Mercado Pago API
    const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}` },
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 });
    }

    const payment = await response.json();

    // Find the payment record by external reference
    const { data: paymentRecord } = await supabase
      .from('pagamentos')
      .select('*')
      .eq('id', payment.external_reference)
      .maybeSingle();

    if (!paymentRecord) {
      return NextResponse.json({ error: 'Payment record not found' }, { status: 400 });
    }

    // Update payment status
    await supabase
      .from('pagamentos')
      .update({
        status: payment.status,
        metodo_pagamento: payment.payment_method_id === 'pix' ? 'pix' : 'credit_card',
        aprovado_em: payment.status === 'approved' ? new Date().toISOString() : null,
      })
      .eq('id', (paymentRecord as any).id);

    // If payment approved, activate user subscription
    if (payment.status === 'approved') {
      const planExpiresAt = (paymentRecord as any).plano === 'annual'
        ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      await supabase
        .from('users')
        .update({
          plan: (paymentRecord as any).plano,
          plan_expires_at: planExpiresAt.toISOString(),
        })
        .eq('id', (paymentRecord as any).user_id);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ status: 'ok' });
}
