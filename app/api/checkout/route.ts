import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-key';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

export async function POST(request: NextRequest) {
  // Skip if using placeholder credentials
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: 'Service not configured' }, { status: 500 });
  }

  const body = await request.json();
  const { plan_id, user_id, user_email, payment_method } = body;

  // Validate required fields
  if (!plan_id || !user_id || !user_email) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const PLANOS = [
    { id: 'monthly', name: 'Mensal', price: 4990, interval: 'month' as const },
    { id: 'annual', name: 'Anual', price: 39900, interval: 'year' as const },
  ];

  const plan = PLANOS.find((p) => p.id === plan_id);
  if (!plan) {
    return NextResponse.json({ error: 'Plano invalido' }, { status: 400 });
  }

  // Create payment record in database
  const { data: payment, error: paymentError } = await supabase
    .from('pagamentos')
    .insert({
      user_id,
      plano: plan_id as 'monthly' | 'annual',
      valor: plan.price,
      status: 'pending',
      metodo_pagamento: payment_method as 'pix' | 'credit_card',
    })
    .select()
    .single();

  if (paymentError) {
    console.error('Payment error:', paymentError);
    return NextResponse.json({ error: 'Erro ao criar pagamento' }, { status: 500 });
  }

  // Create Mercado Pago preference
  const MERCADO_PAGO_ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN;

  if (!MERCADO_PAGO_ACCESS_TOKEN) {
    return NextResponse.json({ error: 'Payment provider not configured' }, { status: 500 });
  }

  const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const preferenceData = {
    items: [
      {
        id: plan.id,
        title: `Clinicus - Plano ${plan.name}`,
        description: `Assinatura ${plan.interval === 'year' ? 'anual' : 'mensal'} Clinicus`,
        category_id: 'others',
        quantity: 1,
        currency_id: 'BRL',
        unit_price: plan.price / 100,
      },
    ],
    payer: { email: user_email },
    back_urls: {
      success: `${APP_URL}/pagamento/sucesso`,
      failure: `${APP_URL}/pagamento/falha`,
      pending: `${APP_URL}/pagamento/pendente`,
    },
    auto_return: 'approved',
    external_reference: payment.id,
    notification_url: `${APP_URL}/api/webhook/mercadopago`,
    payment_methods: {
      excluded_payment_methods: [],
      excluded_payment_types: [],
      installments: plan.interval === 'year' ? 1 : 12,
    },
  };

  try {
    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${MERCADO_PAGO_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(preferenceData),
    });

    const preference = await response.json();

    if (!response.ok) {
      console.error('Mercado Pago error:', preference);
      return NextResponse.json({ error: 'Erro no gateway de pagamento' }, { status: 500 });
    }

    // Update payment with Mercado Pago ID
    await supabase
      .from('pagamentos')
      .update({ mercado_pago_id: preference.id })
      .eq('id', payment.id);

    return NextResponse.json({
      init_point: preference.init_point,
      preference_id: preference.id,
    });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: 'Erro ao processar checkout' }, { status: 500 });
  }
}
