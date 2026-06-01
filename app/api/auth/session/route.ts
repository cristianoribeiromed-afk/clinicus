import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Registrar nova sessão e invalidar anteriores
export async function POST(request: NextRequest) {
  try {
    const { user_id } = await request.json();

    if (!user_id) {
      return NextResponse.json({ error: "user_id obrigatório" }, { status: 400 });
    }

    // Invalidar todas as sessões anteriores do usuário
    await supabaseAdmin
      .from("user_sessions")
      .update({ is_active: false })
      .eq("user_id", user_id)
      .eq("is_active", true);

    // Criar nova sessão
    const session_token = uuidv4();
    const device_info = request.headers.get("user-agent") || "unknown";
    const ip_address = request.headers.get("x-forwarded-for") || 
                       request.headers.get("x-real-ip") || "unknown";

    await supabaseAdmin.from("user_sessions").insert({
      user_id,
      session_token,
      device_info,
      ip_address,
      is_active: true,
    });

    const response = NextResponse.json({ session_token, success: true });
    
    // Salvar token em cookie seguro (7 dias)
    response.cookies.set("clinicus_session", session_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error("Session error:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

// Verificar se sessão atual é válida
export async function GET(request: NextRequest) {
  try {
    const session_token = request.cookies.get("clinicus_session")?.value;

    if (!session_token) {
      return NextResponse.json({ valid: false });
    }

    const { data } = await supabaseAdmin
      .from("user_sessions")
      .select("id, user_id, is_active")
      .eq("session_token", session_token)
      .eq("is_active", true)
      .maybeSingle();

    if (!data) {
      return NextResponse.json({ valid: false, reason: "session_invalidated" });
    }

    // Atualizar last_seen
    await supabaseAdmin
      .from("user_sessions")
      .update({ last_seen: new Date().toISOString() })
      .eq("session_token", session_token);

    return NextResponse.json({ valid: true, user_id: data.user_id });
  } catch (error) {
    console.error("Session check error:", error);
    return NextResponse.json({ valid: false });
  }
}

// Encerrar sessão (logout)
export async function DELETE(request: NextRequest) {
  try {
    const session_token = request.cookies.get("clinicus_session")?.value;

    if (session_token) {
      await supabaseAdmin
        .from("user_sessions")
        .update({ is_active: false })
        .eq("session_token", session_token);
    }

    const response = NextResponse.json({ success: true });
    response.cookies.delete("clinicus_session");
    return response;
  } catch (error) {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
