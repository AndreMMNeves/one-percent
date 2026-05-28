import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/sidebar";
import { OnboardingGate } from "@/components/onboarding-gate";
import { NotificationsHost } from "@/components/notifications-host";

export const metadata: Metadata = {
  title: "One Percent — 1% melhor todo dia",
  description:
    "Sistema de desenvolvimento pessoal: corpo, mente e espírito. Suba de nível com tarefas verificadas.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <OnboardingGate>
          <div className="min-h-screen flex flex-col lg:flex-row">
            <Sidebar />
            <main className="flex-1 px-4 sm:px-6 lg:px-10 py-6 lg:py-10 max-w-6xl w-full mx-auto">
              {children}
            </main>
          </div>
          <NotificationsHost />
        </OnboardingGate>
      </body>
    </html>
  );
}
