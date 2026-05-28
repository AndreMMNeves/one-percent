import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/sidebar";
import { OnboardingGate } from "@/components/onboarding-gate";
import { NotificationsHost } from "@/components/notifications-host";
import { ThemeProvider } from "@/components/theme-provider";

export const metadata: Metadata = {
  title: "One Percent — 1% melhor todo dia",
  description:
    "Sistema de desenvolvimento pessoal: corpo, mente e espírito. Suba de nível com tarefas verificadas.",
};

const themeInitScript = `
(function(){
  try {
    var s = localStorage.getItem('one-percent-theme') || 'system';
    var resolved = s === 'system'
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : s;
    if (resolved === 'dark') document.documentElement.classList.add('dark');
    document.documentElement.style.colorScheme = resolved;
  } catch(e){}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <ThemeProvider>
          <OnboardingGate>
            <div className="min-h-screen flex flex-col lg:flex-row">
              <Sidebar />
              <main className="flex-1 px-4 sm:px-8 lg:px-12 py-6 lg:py-10 w-full">
                <div className="max-w-[1600px] mx-auto">{children}</div>
              </main>
            </div>
            <NotificationsHost />
          </OnboardingGate>
        </ThemeProvider>
      </body>
    </html>
  );
}
