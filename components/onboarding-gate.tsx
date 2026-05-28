"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useStore } from "@/lib/store";

const PUBLIC_PATHS = ["/login", "/cadastro"];

export function OnboardingGate({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const hydrated = useStore((s) => s.hydrated);
  const profile = useStore((s) => s.profile);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted || !hydrated) return;
    const isPublic = PUBLIC_PATHS.includes(pathname);
    if (!profile && !isPublic) {
      router.replace("/cadastro");
    }
    if (profile && pathname === "/cadastro") {
      router.replace("/");
    }
  }, [mounted, hydrated, profile, pathname, router]);

  if (!mounted || !hydrated) {
    return (
      <div className="min-h-screen grid place-items-center">
        <div className="text-muted text-sm animate-pulse">Carregando…</div>
      </div>
    );
  }

  return <>{children}</>;
}
