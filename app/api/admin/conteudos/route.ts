import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyAdmin } from '@/lib/admin-auth';

// Criado dentro de cada handler, não no topo do arquivo -- um createClient()
// em escopo de módulo roda assim que o Next.js importa este arquivo pra
// coletar dados de rota durante o BUILD, não só quando alguém chama a API.
// Se uma env var estivesse vazia/malformada nesse momento, o build inteiro
// falhava por causa de uma única rota (foi exatamente o que aconteceu:
// "Failed to collect page data for /api/admin/conteudos"). Assim, na pior
// hipótese, só esta rota responde com erro numa requisição -- o build não
// quebra por conta disso.
function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseServiceKey) {
    return null;
  }
  return createClient(supabaseUrl, supabaseServiceKey);
}

export async function GET(request: Request) {
  const auth = await verifyAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: 'Serviço não configurado.' }, { status: 500 });
  }

  const { data, error } = await supabase
    .from('conteudos')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const auth = await verifyAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: 'Serviço não configurado.' }, { status: 500 });
  }

  const body = await request.json();

  const { data, error } = await supabase
    .from('conteudos')
    .insert(body)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

