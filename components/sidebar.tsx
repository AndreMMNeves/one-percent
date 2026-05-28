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
    <aside className="lg:w-72 lg:min-h-screen lg:border-r lg:border-white/5 px-4 lg:px-5 py-5 lg:py-8 flex flex-col gap-6 bg-ink-950/40 backdrop-blur">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-flame-500 grid place-items-center shadow-lg shadow-flame-500/30">
          <Flame className="w-5 h-5 text-ink-950" />
        </div>
        <div className="leading-tight">
          <div className="heading text-xl">ONE PERCENT</div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-ink-400">
            1% melhor todo dia
          </div>
        </div>
      </div>

      {profile && (
        <div className="card !p-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-ink-400">
                Nível {lvl.level}
              </div>
              <div className="font-semibold" style={{ color: tierColor(lvl.tier) }}>
                {lvl.name}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-wider text-ink-400">XP</div>
              <div className="font-bold text-flame-400">{xp}</div>
            </div>
          </div>
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full transition-all"
              style={{
                width: `${progressPct}%`,
                background: `linear-gradient(90deg, ${tierColor(lvl.tier)}, #fb923c)`,
              }}
            />
          </div>
          {next && (
            <div className="text-[10px] text-ink-400 mt-1.5">
              próximo: <span className="text-ink-200">{next.name}</span>
            </div>
          )}
        </div>
      )}

      <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm whitespace-nowrap transition",
                active
                  ? "bg-flame-500/10 text-flame-400 border border-flame-500/20"
                  : "text-ink-300 hover:bg-white/5 hover:text-ink-50",
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
