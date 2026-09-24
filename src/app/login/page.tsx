"use client";

import React, { useState, useEffect, useRef } from "react";
import { useLinearStore } from "@/store/useLinearStore";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Eye,
  EyeOff,
  Fingerprint,
  ArrowRight,
  User,
  Plus,
  Volume2,
  VolumeX,
  Music,
} from "lucide-react";
import { ChronoWordmark } from "@/components/ui/ChronoLogo";
import { Silk } from "@/components/ui/react-bits/Silk";
// [PRESERVED]: React Bits ASCII Wave & ASCII Video Art components
import { AsciiWaveBackground } from "@/components/ui/react-bits/AsciiWaveBackground";
import { AsciiVideoPlayer } from "@/components/ui/react-bits/AsciiVideoPlayer";
import { isPasskeySupported } from "@/lib/passkeyAuth";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToast } = useLinearStore();

  const nextParam = searchParams?.get("next");
  const signupHref = nextParam ? `/signup?next=${encodeURIComponent(nextParam)}` : "/signup";
  const resetHref = nextParam ? `/reset-password?next=${encodeURIComponent(nextParam)}` : "/reset-password";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passkeyAvailable, setPasskeyAvailable] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    setPasskeyAvailable(isPasskeySupported());
  }, []);

  // Synchronize play/pause commands to YouTube iframe via postMessage API without unmounting
  useEffect(() => {
    if (!iframeRef.current?.contentWindow) return;
    try {
      if (isPlaying) {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: "command", func: "playVideo", args: [] }),
          "*"
        );
      } else {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: "command", func: "pauseVideo", args: [] }),
          "*"
        );
      }
    } catch (e) {}
  }, [isPlaying]);

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }
      if (!data.session) {
        throw new Error("Sessione non disponibile. Riprova tra qualche secondo.");
      }

      addToast({
        title: "Accesso Effettuato",
        description: `Benvenuto su Chrono!`,
        type: "success",
      });

      const nextPath = new URLSearchParams(window.location.search).get("next");
      const destination = nextPath && nextPath.startsWith("/") && !nextPath.startsWith("//") ? nextPath : "/projects";
      window.location.assign(destination);
    } catch (err: any) {
      addToast({
        title: "Errore di Accesso",
        description: err.message || "Impossibile completare il login.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasskeyAuth = async () => {
    addToast({
      title: "Passkey non configurata",
      description: "La verifica WebAuthn deve essere collegata a Supabase Auth prima di poter essere usata.",
      type: "warning",
    });
  };

  const handleOAuthLogin = async (provider: "google" | "github" | "discord") => {
    setLoading(true);
    const nextPath = new URLSearchParams(window.location.search).get("next");
    const safeNextPath = nextPath && nextPath.startsWith("/") && !nextPath.startsWith("//") ? nextPath : "/projects";
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(safeNextPath)}` },
    });

    if (error) {
      addToast({
        title: `Accesso con ${provider.toUpperCase()} non riuscito`,
        description: error.message,
        type: "error",
      });
      setLoading(false);
      return;
    }

    if (data.url) {
      window.location.assign(data.url);
      return;
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen w-full bg-[#08090c] flex flex-col lg:flex-row select-none text-ink font-sans">
      {/* ========================================================================= */}
      {/* LEFT PANE: Minimalist, Crisp Authentication Form */}
      {/* ========================================================================= */}
      <div className="w-full lg:w-[460px] xl:w-[490px] flex flex-col justify-between p-6 sm:p-10 md:p-12 z-20 bg-zinc-950 border-r border-white/5 shrink-0">
        {/* Brand Logo Header */}
        <header className="flex items-center justify-between">
          <Link href="/projects" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center shadow-sm">
              <img src="/icon.png" alt="" className="h-full w-full object-contain" />
            </div>
            <ChronoWordmark logoSize={15} />
          </Link>
        </header>

        {/* Form Container */}
        <div className="my-auto w-full flex flex-col gap-5 py-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-tight">
              Welcome back.
            </h1>
            <p className="text-xs text-zinc-400 mt-1 font-normal">
              Log in to your account below.
            </p>
          </div>

          {/* Social OAuth Buttons */}
          <div className="grid grid-cols-3 gap-2">
            {/* Google */}
            <button
              type="button"
              onClick={() => handleOAuthLogin("google")}
              className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-zinc-900/60 hover:bg-zinc-800 border border-white/10 hover:border-white/20 text-white text-xs font-medium transition-all shadow-sm cursor-pointer group"
              aria-label="Sign in with Google"
            >
              <svg viewBox="0 0 24 24" width="15" height="15" className="shrink-0">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <span>Google</span>
            </button>

            {/* GitHub */}
            <button
              type="button"
              onClick={() => handleOAuthLogin("github")}
              className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-zinc-900/60 hover:bg-zinc-800 border border-white/10 hover:border-white/20 text-white text-xs font-medium transition-all shadow-sm cursor-pointer group"
              aria-label="Sign in with GitHub"
            >
              <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" className="shrink-0 text-white">
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
              </svg>
              <span>GitHub</span>
            </button>

            {/* Discord */}
            <button
              type="button"
              onClick={() => handleOAuthLogin("discord")}
              className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-zinc-900/60 hover:bg-zinc-800 border border-white/10 hover:border-white/20 text-white text-xs font-medium transition-all shadow-sm cursor-pointer group"
              aria-label="Sign in with Discord"
            >
              <svg viewBox="0 0 24 24" width="15" height="15" fill="#5865F2" className="shrink-0">
                <path d="M19.27 5.33C17.94 4.71 16.5 4.26 15 4a.09.09 0 0 0-.07.03c-.18.33-.39.76-.53 1.09a16.09 16.09 0 0 0-4.8 0c-.14-.34-.35-.76-.54-1.09c-.01-.02-.04-.03-.07-.03c-1.5.26-2.93.71-4.27 1.33c-.01 0-.02.01-.03.02c-2.72 4.07-3.47 8.03-3.1 11.95c0 .02.01.04.03.05c1.8 1.32 3.53 2.12 5.24 2.65c.03.01.06 0 .07-.02c.4-.55.76-1.13 1.07-1.74c.02-.04 0-.08-.04-.09c-.57-.22-1.11-.48-1.64-.78c-.04-.02-.04-.08-.01-.11c.11-.08.22-.17.33-.25c.02-.02.05-.02.07-.01c3.44 1.57 7.15 1.57 10.55 0c.02-.01.05-.01.07.01c.11.09.22.17.33.26c.04.03.04.09-.01.11c-.52.31-1.07.56-1.64.78c-.04.01-.05.06-.04.09c.32.61.68 1.19 1.07 1.74c.02.02.05.03.08.02c1.71-.53 3.45-1.33 5.25-2.65c.02-.01.03-.03.03-.05c.44-4.53-.73-8.46-3.1-11.95c-.01-.01-.02-.02-.04-.02zM8.52 14.91c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12c0 1.17-.84 2.12-1.89 2.12zm6.97 0c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12c0 1.17-.83 2.12-1.89 2.12z"/>
              </svg>
              <span>Discord</span>
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 text-zinc-500 text-[10px] font-medium uppercase tracking-wider my-0.5">
            <div className="flex-1 h-px bg-white/5" />
            <span>OR</span>
            <div className="flex-1 h-px bg-white/5" />
          </div>

          {/* Email & Password Form */}
          <form onSubmit={handlePasswordLogin} className="flex flex-col gap-3 text-xs">
            <div className="flex flex-col gap-1">
              <input
                type="email"
                required
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className="w-full px-3.5 py-2.5 rounded-lg bg-zinc-900/40 border border-white/10 focus:border-white/20 text-white text-xs placeholder:text-zinc-500 focus:outline-none transition-colors"
              />
            </div>

            <div className="relative flex items-center">
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="w-full px-3.5 py-2.5 pr-10 rounded-lg bg-zinc-900/40 border border-white/10 focus:border-white/20 text-white text-xs placeholder:text-zinc-500 focus:outline-none transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-zinc-500 hover:text-white transition-colors cursor-pointer"
                aria-label={showPassword ? "Nascondi password" : "Mostra password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Primary Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="mt-1 w-full py-2.5 rounded-lg bg-white hover:bg-zinc-200 disabled:opacity-50 text-black font-semibold text-xs transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? <span>Signing in...</span> : <span>Sign in</span>}
            </button>
          </form>

          {/* Passkey & Links */}
          <div className="flex flex-col gap-3 text-center text-xs text-zinc-400 pt-1">
            <button
              type="button"
              onClick={handlePasskeyAuth}
              className="text-zinc-400 hover:text-white font-medium transition-colors cursor-pointer inline-flex items-center justify-center gap-1.5 group"
            >
              <Fingerprint className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white transition-colors" />
              <span>Sign in with passkey instead</span>
            </button>

            <div className="text-[11px] text-zinc-500">
              Need an account?{" "}
              <Link
                href={signupHref}
                className="text-zinc-300 hover:text-white font-medium transition-colors underline underline-offset-2"
              >
                Sign up
              </Link>
            </div>

            <div className="text-[11px] text-zinc-500 pt-2 border-t border-white/5">
              Forgot your password?{" "}
              <Link href={resetHref} className="text-zinc-400 hover:text-white transition-colors underline underline-offset-2">
                Reset password
              </Link>
            </div>
          </div>
        </div>

        {/* Minimal Footer */}
        <footer className="text-[11px] text-zinc-500 pt-4 border-t border-white/5">
          <span>© {new Date().getFullYear()} Chrono</span>
        </footer>
      </div>

      {/* ========================================================================= */}
      {/* RIGHT PANE: Pure React Bits Silk Ambient Shader Background (Full Bleed)   */}
      {/* ========================================================================= */}
      <div className="hidden lg:flex flex-1 relative bg-zinc-950 items-center justify-center overflow-hidden">
        {/* React Bits Silk Shader WebGL */}
        <Silk
          className="w-full h-full"
          color="#3f3f46"
          speed={0.8}
          scale={1.15}
          noiseIntensity={0.20}
          rotation={0.52}
        />

        {/* 
          ===========================================================================
          [FEATURE PRESERVED]: ASCII Waves & Real-Time ASCII Video Stream Player
          De-comment to re-enable ASCII Modes:
          ===========================================================================
          <AsciiWaveBackground speed={0.008} glowColor="#a1a1aa" />
          <AsciiVideoPlayer
            videoSrc="/video/official.mp4"
            isPlaying={isPlaying}
            onTogglePlay={() => setIsPlaying(!isPlaying)}
          />
        */}
      </div>

      {/* 
        ===========================================================================
        [FEATURE PRESERVED]: Easter Egg Music Controller & Background Audio
        De-comment to restore synchronized background music:
        ===========================================================================
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 animate-slide-up">
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className={cn(
              "px-3 py-1.5 rounded-full border text-xs font-mono transition-all flex items-center gap-2 cursor-pointer shadow-lg backdrop-blur-md select-none group",
              isPlaying
                ? "bg-[#161028]/90 border-purple-500/40 text-purple-300 hover:bg-[#201538] hover:border-purple-400 shadow-purple-500/10"
                : "bg-[#11131a]/80 border-[#232734] text-ink-tertiary hover:text-white hover:border-[#353a4c]"
            )}
            title={isPlaying ? "Disattiva audio e pausa video" : "Attiva musica e avvia video"}
          >
            {isPlaying ? (
              <>
                <div className="flex items-end gap-0.5 h-3">
                  <span className="w-0.5 h-full bg-purple-400 animate-pulse" />
                  <span className="w-0.5 h-2/3 bg-purple-300 animate-bounce" />
                  <span className="w-0.5 h-4/5 bg-purple-400 animate-pulse" />
                </div>
                <Volume2 className="w-3.5 h-3.5 text-purple-400 group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-sans font-medium text-purple-300">Sound ON</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 text-ink-tertiary" />
                <span className="text-[11px] font-sans font-medium text-ink-tertiary">Muted</span>
              </>
            )}
          </button>
        </div>

        <div className="fixed -bottom-96 -right-96 w-1 h-1 pointer-events-none opacity-0 overflow-hidden" aria-hidden="true">
          <iframe
            ref={iframeRef}
            width="100"
            height="100"
            src="https://www.youtube.com/embed/VSXT4a2kRHA?enablejsapi=1&autoplay=1&loop=1&playlist=VSXT4a2kRHA&playsinline=1"
            allow="autoplay"
            title="Background Music Synchronized"
          />
        </div>
      */}
    </div>
  );
}
