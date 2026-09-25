import { createServerClient } from "@supabase/ssr";
import { type EmailOtpType } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function GET(request: NextRequest) {
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.redirect(new URL("/login?error=missing_supabase_config", request.url));
  }

  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const tokenHash = requestUrl.searchParams.get("token_hash");
  const type = requestUrl.searchParams.get("type") as EmailOtpType | null;
  const requestedNext = requestUrl.searchParams.get("next");
  const next = getSafeNextPath(requestedNext);

  if (!code && !(tokenHash && type)) {
    return NextResponse.redirect(new URL("/login?error=missing_auth_code", request.url));
  }

  const cookieStore = await cookies();
  const isRecoveryFlow = type === "recovery" || next === "/reset-password" || next.startsWith("/reset-password");
  const redirectPath = isRecoveryFlow ? "/reset-password?recovery=1" : next;
  const response = NextResponse.redirect(new URL(redirectPath, request.url));

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent(error.message)}`, request.url),
      );
    }
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type,
    });
    if (error) {
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent(error.message)}`, request.url),
      );
    }
  }

  return response;
}

function getSafeNextPath(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/projects";
  }

  return value;
}