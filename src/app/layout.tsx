import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
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

const interDisplay = localFont({
  src: [
    {
      path: "../../public/fonts/InterDisplay-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/InterDisplay-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/InterDisplay-SemiBold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../public/fonts/InterDisplay-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-inter-display",
  display: "swap",
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
    <html lang="it" className={`dark h-full ${geist.variable} ${geistMono.variable} ${interDisplay.variable}`}>
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
