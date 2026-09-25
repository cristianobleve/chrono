import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendPasswordRecoveryEmail } from "@/lib/mailer";

const supabaseServer = createClient(
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = String(body.email || "").trim().toLowerCase();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Inserisci un indirizzo email valido." }, { status: 400 });
    }

    const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_SITE_URL || "https://chrono.cristianobleve.com";
    const redirectTo = `${origin}/reset-password?recovery=1`;

    const { data, error } = await supabaseServer.auth.admin.generateLink({
      type: "recovery",
      email,
      options: { redirectTo },
    });

    if (error || !data?.properties?.action_link) {
      // Do not reveal if user exists or not for security
      return NextResponse.json({ success: true });
    }

    const mailResult = await sendPasswordRecoveryEmail({
      to: email,
      resetUrl: data.properties.action_link,
    });

    if (!mailResult.sent) {
      return NextResponse.json(
        { error: mailResult.error || "Impossibile inviare l'email di recupero tramite SMTP." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Errore durante l'elaborazione della richiesta." },
      { status: 500 }
    );
  }
}
