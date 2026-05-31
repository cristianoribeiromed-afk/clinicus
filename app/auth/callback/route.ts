import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder-key";

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const redirect = requestUrl.searchParams.get("redirect") || "/dashboard";

  if (!code) {
    return NextResponse.redirect(`${requestUrl.origin}/login?error=no_code`);
  }

  // Skip if using placeholder credentials
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.redirect(
      `${requestUrl.origin}/login?error=not_configured`,
    );
  }

  try {
    // Exchange code for session
    const { data } = await supabase.auth.exchangeCodeForSession(code);

    if (data.session?.user) {
      // Check if user profile exists
      const { data: existingUser } = await supabase
        .from("users")
        .select("id")
        .eq("id", data.session.user.id)
        .maybeSingle();

      if (!existingUser) {
        await supabase.from("users").insert({
          id: data.session.user.id,
          email: data.session.user.email!,
          name:
            data.session.user.user_metadata?.name ||
            data.session.user.email!.split("@")[0],
          photo_url: data.session.user.user_metadata?.avatar_url,
        });
      }

      await supabase
        .from("users")
        .update({ last_login: new Date().toISOString() })
        .eq("id", data.session.user.id);
    }
  } catch (error) {
    console.error("Auth callback error:", error);
  }

  return NextResponse.redirect(`${requestUrl.origin}${redirect}`);
}
