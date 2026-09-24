"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [hasSession, setHasSession] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    const recovery = searchParams.get("recovery") === "1";
    setIsRecovery(recovery);
    void supabase.auth.getSession().then(({ data: { session } }) => setHasSession(recovery && Boolean(session)));
  }, [searchParams]);

  const requestReset = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/auth/callback?next=/reset-password` });
    if (resetError) setError(resetError.message);
    else setMessage("Se l'email esiste, riceverai un link per reimpostare la password.");
    setLoading(false);
  };

  const updatePassword = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    if (!isRecovery) {
      setError("Il link di recupero non è valido o è scaduto. Richiedi una nuova email.");
      setLoading(false);
      return;
    }
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) setError(updateError.message);
    else setMessage("Password aggiornata. Ora puoi accedere con la nuova password.");
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-[#09090b] text-white flex items-center justify-center p-6">
      <section className="w-full max-w-md rounded-[16px] border border-white/10 bg-zinc-950 p-8 shadow-2xl">
        <h1 className="text-2xl font-semibold">Reimposta password</h1>
        <p className="mt-2 text-sm text-zinc-400">{hasSession ? "Scegli una nuova password dal link ricevuto via email." : "Inserisci la tua email per ricevere un link di recupero."}</p>
        <form onSubmit={hasSession ? updatePassword : requestReset} className="mt-6 flex flex-col gap-3">
          {!hasSession && <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@company.com" autoComplete="email" className="rounded-lg border border-white/10 bg-zinc-900 px-3.5 py-2.5 text-sm text-white outline-none focus:border-white/30" />}
          {hasSession && <input required minLength={8} type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Nuova password (minimo 8 caratteri)" autoComplete="new-password" className="rounded-lg border border-white/10 bg-zinc-900 px-3.5 py-2.5 text-sm text-white outline-none focus:border-white/30" />}
          {error && <p className="text-sm text-red-400">{error}</p>}
          {message && <p className="text-sm text-emerald-400">{message}</p>}
          <button disabled={loading} className="rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-black disabled:opacity-50">{loading ? "Attendi..." : hasSession ? "Aggiorna password" : "Invia link"}</button>
        </form>
        <p className="mt-6 text-center text-sm text-zinc-500"><Link href="/login" className="text-white underline underline-offset-4">Torna al login</Link></p>
      </section>
    </main>
  );
}