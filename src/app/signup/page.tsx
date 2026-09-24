"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next");
  const safeNext = next && next.startsWith("/") && !next.startsWith("//") ? next : "/projects";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    const { data, error: signupError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { full_name: name.trim() },
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(safeNext)}`,
      },
    });
    if (signupError) {
      setError(signupError.message);
    } else if (data.session) {
      window.location.assign(safeNext);
    } else {
      setMessage("Controlla la tua email per confermare l'account.");
    }
    setLoading(false);
  };

  const loginHref = next ? `/login?next=${encodeURIComponent(next)}` : "/login";

  return (
    <main className="min-h-screen bg-[#09090b] text-white flex items-center justify-center p-6">
      <section className="w-full max-w-md rounded-[16px] border border-white/10 bg-zinc-950 p-8 shadow-2xl">
        <h1 className="text-2xl font-semibold">Crea il tuo account</h1>
        <p className="mt-2 text-sm text-zinc-400">Registrati con la tua identità reale. Gli account non vengono creati localmente.</p>
        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3">
          <input required value={name} onChange={(event) => setName(event.target.value)} placeholder="Nome completo" autoComplete="name" className="rounded-lg border border-white/10 bg-zinc-900 px-3.5 py-2.5 text-sm text-white outline-none focus:border-white/30" />
          <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@company.com" autoComplete="email" className="rounded-lg border border-white/10 bg-zinc-900 px-3.5 py-2.5 text-sm text-white outline-none focus:border-white/30" />
          <div className="relative">
            <input required minLength={8} type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Password (minimo 8 caratteri)" autoComplete="new-password" className="w-full rounded-lg border border-white/10 bg-zinc-900 px-3.5 py-2.5 pr-10 text-sm text-white outline-none focus:border-white/30" />
            <button type="button" onClick={() => setShowPassword((visible) => !visible)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white" aria-label="Mostra password">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          {message && <p className="text-sm text-emerald-400">{message}</p>}
          <button disabled={loading} className="mt-2 inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-black disabled:opacity-50">{loading ? "Creazione..." : "Crea account"}<ArrowRight className="h-4 w-4" /></button>
        </form>
        <p className="mt-6 text-center text-sm text-zinc-500">Hai già un account? <Link href={loginHref} className="text-white underline underline-offset-4">Accedi</Link></p>
      </section>
    </main>
  );
}