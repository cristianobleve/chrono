"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, ArrowRight, Check } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);
  const [verifyingLink, setVerifyingLink] = useState(true);
  const [passwordUpdated, setPasswordUpdated] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      if (event === "PASSWORD_RECOVERY" || (session && searchParams.get("recovery") === "1")) {
        setIsRecovery(true);
        setHasSession(true);
        setVerifyingLink(false);
      }
    });

    void (async () => {
      try {
        const recoveryParam = searchParams.get("recovery") === "1" || searchParams.get("type") === "recovery";
        const code = searchParams.get("code");
        const tokenHash = searchParams.get("token_hash");
        const hash = typeof window !== "undefined" ? window.location.hash : "";

        // 1. Check URL hash (#access_token=...&refresh_token=...)
        if (hash && hash.includes("access_token=")) {
          const hashParams = new URLSearchParams(hash.substring(1));
          const accessToken = hashParams.get("access_token");
          const refreshToken = hashParams.get("refresh_token");
          if (accessToken && refreshToken) {
            const { data, error: sessionErr } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            if (!sessionErr && data.session && mounted) {
              setIsRecovery(true);
              setHasSession(true);
              window.history.replaceState(null, "", "/reset-password?recovery=1");
              setVerifyingLink(false);
              return;
            }
          }
        }

        // 2. Check ?token_hash=...&type=recovery
        if (tokenHash) {
          const { data, error: otpErr } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: "recovery",
          });
          if (!otpErr && data.session && mounted) {
            setIsRecovery(true);
            setHasSession(true);
            window.history.replaceState(null, "", "/reset-password?recovery=1");
            setVerifyingLink(false);
            return;
          }
        }

        // 3. Check ?code=... (PKCE exchange)
        if (code) {
          const { data, error: codeErr } = await supabase.auth.exchangeCodeForSession(code);
          if (!codeErr && data.session && mounted) {
            setIsRecovery(true);
            setHasSession(true);
            window.history.replaceState(null, "", "/reset-password?recovery=1");
            setVerifyingLink(false);
            return;
          }
        }

        // 4. Check existing active session (e.g. redirected from /auth/callback or SupabaseRealtimeProvider)
        const { data: { session } } = await supabase.auth.getSession();
        if (mounted) {
          if (session && recoveryParam) {
            setIsRecovery(true);
            setHasSession(true);
          } else {
            setIsRecovery(recoveryParam);
            setHasSession(false);
          }
        }
      } catch (err: any) {
        if (mounted) {
          setError(err?.message || "Impossibile verificare il link di recupero.");
        }
      } finally {
        if (mounted) {
          setVerifyingLink(false);
        }
      }
    })();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [searchParams]);

  const requestReset = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password?recovery=1`,
    });

    if (resetError) {
      setError(resetError.message);
    } else {
      setMessage("Se l'indirizzo email è registrato, riceverai un link per reimpostare la password.");
    }
    setLoading(false);
  };

  const updatePassword = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (password.length < 8) {
      setError("La password deve contenere almeno 8 caratteri.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Le due password non coincidono.");
      return;
    }

    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      setError(updateError.message);
    } else {
      setPasswordUpdated(true);
      setMessage("Password aggiornata. Ora puoi accedere alla piattaforma.");
      setTimeout(() => {
        router.push("/projects");
      }, 1500);
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-[#09090b] text-white flex items-center justify-center p-6">
      <section className="w-full max-w-md rounded-[16px] border border-white/10 bg-zinc-950 p-8 shadow-2xl text-left">
        <h1 className="text-2xl font-semibold">
          {hasSession ? "Imposta nuova password" : "Reimposta password"}
        </h1>
        <p className="mt-2 text-sm text-zinc-400">
          {verifyingLink
            ? "Verifica del link di sicurezza in corso..."
            : hasSession
            ? "Inserisci e conferma la nuova password per il tuo account."
            : "Inserisci la tua email per ricevere il link di ripristino."}
        </p>

        {verifyingLink ? (
          <div className="mt-6 py-6 text-sm text-zinc-400">
            Caricamento sessione di recupero...
          </div>
        ) : passwordUpdated ? (
          <div className="mt-6 flex flex-col gap-4">
            <div className="rounded-lg border border-emerald-500/20 bg-emerald-950/30 p-4 text-sm text-emerald-300 flex items-center gap-2.5">
              <Check className="h-4 w-4 shrink-0" />
              <span>{message}</span>
            </div>
            <Link
              href="/projects"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-black hover:bg-zinc-200 transition-colors"
            >
              <span>Continua su Chrono</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <form onSubmit={hasSession ? updatePassword : requestReset} className="mt-6 flex flex-col gap-3">
            {!hasSession ? (
              <div className="flex flex-col gap-1.5">
                <label htmlFor="reset-email" className="text-xs font-medium text-zinc-400">
                  Indirizzo email
                </label>
                <input
                  id="reset-email"
                  required
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="name@company.com"
                  autoComplete="email"
                  className="rounded-lg border border-white/10 bg-zinc-900 px-3.5 py-2.5 text-sm text-white outline-none focus:border-white/30"
                />
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="new-password" className="text-xs font-medium text-zinc-400">
                    Nuova password
                  </label>
                  <div className="relative">
                    <input
                      id="new-password"
                      required
                      minLength={8}
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Minimo 8 caratteri"
                      autoComplete="new-password"
                      className="w-full rounded-lg border border-white/10 bg-zinc-900 px-3.5 py-2.5 pr-10 text-sm text-white outline-none focus:border-white/30"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                      aria-label="Mostra password"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="confirm-password" className="text-xs font-medium text-zinc-400">
                    Conferma nuova password
                  </label>
                  <input
                    id="confirm-password"
                    required
                    minLength={8}
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    placeholder="Ripeti la nuova password"
                    autoComplete="new-password"
                    className="rounded-lg border border-white/10 bg-zinc-900 px-3.5 py-2.5 text-sm text-white outline-none focus:border-white/30"
                  />
                </div>
              </>
            )}

            {error && <p className="text-sm text-red-400">{error}</p>}
            {message && <p className="text-sm text-emerald-400">{message}</p>}

            <button
              disabled={loading}
              className="mt-2 inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-black hover:bg-zinc-200 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <span>{loading ? "Attendere..." : hasSession ? "Salva nuova password" : "Invia link di recupero"}</span>
            </button>
          </form>
        )}

        <p className="mt-6 text-left text-sm text-zinc-500">
          <Link href="/login" className="text-white underline underline-offset-4">
            Torna al login
          </Link>
        </p>
      </section>
    </main>
  );
}