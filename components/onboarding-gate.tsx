"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useStore } from "@/lib/store";

export function OnboardingGate({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const hydrated = useStore((s) => s.hydrated);
  const profile = useStore((s) => s.profile);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted || !hydrated) return;
    if (!profile && pathname !== "/cadastro") {
      router.replace("/cadastro");
    }
    if (profile && pathname === "/cadastro") {
      router.replace("/");
    }
  }, [mounted, hydrated, profile, pathname, router]);

  if (!mounted || !hydrated) {
    return (
      <div className="min-h-screen grid place-items-center">
        <div className="text-ink-400 text-sm animate-pulse">Carregando…</div>
      </div>
    );
  }

  return <>{children}</>;
}
