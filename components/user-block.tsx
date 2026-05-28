"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { LogIn, LogOut, Cloud, CloudOff } from "lucide-react";
import { useStore } from "@/lib/store";

export function UserBlock() {
  const { data: session, status } = useSession();
  const cloudEnabled = useStore((s) => s.cloudEnabled);

  if (status === "loading") {
    return <div className="h-10" />;
  }

  if (!session) {
    return (
      <Link
        href="/login"
        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition border border-border-strong hover:bg-card-hover"
      >
        <LogIn className="w-4 h-4" />
        <span>Entrar / Sincronizar</span>
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {session.user?.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={session.user.image}
            alt={session.user.name ?? ""}
            className="w-8 h-8 rounded-full border border-border"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-card-hover grid place-items-center text-xs font-bold">
            {(session.user?.name ?? "?")[0]}
          </div>
        )}
        <div className="leading-tight min-w-0 flex-1">
          <div className="text-xs font-semibold truncate">
            {session.user?.name}
          </div>
          <div className="text-[10px] text-muted flex items-center gap-1">
            {cloudEnabled ? (
              <>
                <Cloud className="w-2.5 h-2.5 text-good" />
                <span>sincronizado</span>
              </>
            ) : (
              <>
                <CloudOff className="w-2.5 h-2.5" />
                <span>aguardando…</span>
              </>
            )}
          </div>
        </div>
      </div>
      <button
        onClick={() => signOut({ callbackUrl: "/" })}
        title="Sair"
        className="w-8 h-8 rounded-lg grid place-items-center text-muted hover:text-foreground hover:bg-card-hover"
      >
        <LogOut className="w-4 h-4" />
      </button>
    </div>
  );
}
