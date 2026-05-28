"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Calendar,
  TrendingUp,
  Target,
  StickyNote,
  Sparkles,
  Settings as SettingsIcon,
  HeartPulse,
  Flame,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";
import { levelFromXp, nextLevelInfo, tierColor } from "@/lib/levels";
import { ThemeToggle } from "./theme-toggle";

const NAV = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/diario", label: "Diário", icon: Calendar },
  { href: "/desafios", label: "Desafios", icon: Target },
  { href: "/progresso", label: "Progresso", icon: TrendingUp },
  { href: "/avaliacao", label: "Avaliação", icon: HeartPulse },
  { href: "/notas", label: "Notas", icon: StickyNote },
  { href: "/espiritual", label: "Espiritual", icon: Sparkles },
  { href: "/configuracoes", label: "Configurações", icon: SettingsIcon },
];

export function Sidebar() {
  const pathname = usePathname();
  const xp = useStore((s) => s.xp);
  const profile = useStore((s) => s.profile);
  const lvl = levelFromXp(xp);
  const { next, progressPct } = nextLevelInfo(xp);

  return (
    <aside className="lg:w-72 lg:h-screen lg:sticky lg:top-0 lg:border-r border-border px-4 lg:px-5 py-5 lg:py-6 flex flex-col gap-5 bg-surface">
      <div className="flex items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent grid place-items-center shadow-md shadow-flame-500/30">
            <Flame className="w-5 h-5 text-accent-foreground" />
          </div>
          <div className="leading-tight">
            <div className="heading text-xl">ONE PERCENT</div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-muted">
              1% melhor todo dia
            </div>
          </div>
        </Link>
        <div className="lg:hidden">
          <ThemeToggle />
        </div>
      </div>

      {profile && (
        <div className="card !p-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted">
                Nível {lvl.level}
              </div>
              <div className="font-bold text-sm" style={{ color: tierColor(lvl.tier) }}>
                {lvl.name}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-wider text-muted">XP</div>
              <div className="font-bold text-accent">{xp}</div>
            </div>
          </div>
          <div className="h-1.5 bg-card-hover rounded-full overflow-hidden">
            <div
              className="h-full transition-all"
              style={{
                width: `${progressPct}%`,
                background: `linear-gradient(90deg, ${tierColor(lvl.tier)}, #fb923c)`,
              }}
            />
          </div>
          {next && (
            <div className="text-[10px] text-muted mt-1.5">
              próximo: <span className="text-foreground font-semibold">{next.name}</span>
            </div>
          )}
        </div>
      )}

      <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible flex-1 min-h-0">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm whitespace-nowrap transition font-medium",
                active
                  ? "bg-accent/10 text-accent border border-accent/20"
                  : "text-muted-foreground hover:bg-card-hover hover:text-foreground",
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="hidden lg:flex items-center justify-between gap-3 pt-3 border-t border-border">
        <div className="text-xs text-muted">tema</div>
        <ThemeToggle />
      </div>
    </aside>
  );
}
