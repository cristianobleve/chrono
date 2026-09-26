import type { Metadata } from "next";
import { Geist, Geist_Mono, DM_Sans } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";
import { SupabaseRealtimeProvider } from "@/components/providers/SupabaseRealtimeProvider";
import { NotificationSchedulerProvider } from "@/components/providers/NotificationSchedulerProvider";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Chrono | Il lavoro ha bisogno di direzione",
    template: "%s | Chrono",
  },
  description: "Chrono riunisce progetti, issue, scadenze e decisioni in un sistema chiaro per i team di prodotto e sviluppo.",
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it" className={`dark h-full ${geist.variable} ${geistMono.variable} ${dmSans.variable}`}>
      <body className="chrono-app bg-[#09090b] text-ink h-full w-full overflow-x-hidden antialiased font-sans">
        <SupabaseRealtimeProvider>
          <NotificationSchedulerProvider>
            <AppShell>{children}</AppShell>
          </NotificationSchedulerProvider>
        </SupabaseRealtimeProvider>
      </body>
    </html>
  );
}
