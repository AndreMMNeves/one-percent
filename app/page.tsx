"use client";

import Link from "next/link";
import { useStore } from "@/lib/store";
import {
  calcBMI,
  bmiCategory,
  calcCalorieTarget,
  calcProteinTargetG,
  calcTDEE,
  calcWaterTargetMl,
  estimateBodyFatNavy,
  goalLabel,
} from "@/lib/calculations";
import { messages } from "@/lib/tone";
import { Flame, Activity, Apple, Droplet, Dumbbell, Target, Trophy, Zap } from "lucide-react";
import { StatCard } from "@/components/stat-card";
import { QuoteBanner } from "@/components/quote-banner";
import { computeStreak, fmtNumber, todayISO } from "@/lib/utils";
import { challengesForToday } from "@/lib/challenges";
import { levelFromXp } from "@/lib/levels";

export default function DashboardPage() {
  const profile = useStore((s) => s.profile);
  const xp = useStore((s) => s.xp);
  const logs = useStore((s) => s.logs);
  const completed = useStore((s) => s.completedChallenges);

  if (!profile) return null;

  const bmi = calcBMI(profile.weightKg, profile.heightCm);
  const cat = bmiCategory(bmi);
  const tdee = calcTDEE(profile);
  const calTarget = calcCalorieTarget(profile);
  const proteinG = calcProteinTargetG(profile);
  const waterMl = calcWaterTargetMl(profile.weightKg);
  const bf =
    profile.bodyFatPct ??
    estimateBodyFatNavy(
      profile.sex,
      profile.heightCm,
      profile.waistCm,
      profile.neckCm,
      profile.hipCm,
    );
  const streak = computeStreak(logs.map((l) => l.date));
  const lvl = levelFromXp(xp);
  const todays = challengesForToday();
  const today = todayISO();
  const doneTodayIds = new Set(
    completed.filter((c) => c.completedAt.slice(0, 10) === today).map((c) => c.challengeId),
  );

  return (
    <div className="space-y-8">
      <div>
        <div className="text-sm text-ink-400 uppercase tracking-wider">
          {new Date().toLocaleDateString("pt-BR", {
            weekday: "long",
            day: "2-digit",
            month: "long",
          })}
        </div>
        <h1 className="heading text-3xl sm:text-5xl mt-1">
          {messages(profile.tone).greeting(profile.name)}
        </h1>
        <div className="mt-2 text-ink-300 text-sm">
          Objetivo: <span className="text-flame-400 font-semibold">{goalLabel(profile.goal)}</span>{" "}
          · Nível <span className="text-ink-100 font-semibold">{lvl.level} {lvl.name}</span>
        </div>
      </div>

      <QuoteBanner />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="IMC"
          value={bmi.toFixed(1)}
          hint={cat.label}
          icon={Activity}
          tone={cat.tone === "good" ? "good" : cat.tone === "warn" ? "warn" : "bad"}
        />
        <StatCard
          label="Calorias / dia"
          value={fmtNumber(calTarget)}
          hint={`TDEE: ${fmtNumber(tdee)} kcal`}
          icon={Apple}
        />
        <StatCard
          label="Proteína / dia"
          value={`${proteinG}g`}
          hint="meta para seu objetivo"
          icon={Dumbbell}
        />
        <StatCard
          label="Água / dia"
          value={`${(waterMl / 1000).toFixed(1)}L`}
          hint="35ml × kg"
          icon={Droplet}
        />
        <StatCard
          label="Gordura est."
          value={bf ? `${bf.toFixed(1)}%` : "—"}
          hint={bf ? "Navy / informada" : "informe medidas"}
          icon={Flame}
        />
        <StatCard
          label="XP total"
          value={fmtNumber(xp)}
          hint={`próximo nível em breve`}
          icon={Zap}
          tone="good"
        />
        <StatCard
          label="Streak"
          value={`${streak}d`}
          hint="dias seguidos com registro"
          icon={Trophy}
          tone={streak >= 3 ? "good" : "neutral"}
        />
        <StatCard
          label="Desafios hoje"
          value={`${doneTodayIds.size}/${todays.length}`}
          hint="concluídos"
          icon={Target}
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="heading text-2xl">Desafios de hoje</h2>
          <Link href="/desafios" className="text-sm text-flame-400 hover:text-flame-300">
            Ver todos →
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {todays.slice(0, 4).map((c) => {
            const done = doneTodayIds.has(c.id);
            return (
              <Link
                key={c.id}
                href="/desafios"
                className={`card flex items-start justify-between gap-3 hover:border-flame-500/40 transition ${
                  done ? "opacity-60" : ""
                }`}
              >
                <div>
                  <div className="font-semibold">{c.title}</div>
                  <div className="text-xs text-ink-400 mt-1">{c.description}</div>
                </div>
                <div className="text-flame-400 font-bold text-sm shrink-0">+{c.xp}xp</div>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-3">
        <Link href="/diario" className="card hover:border-flame-500/40 transition">
          <div className="font-semibold">Registrar o dia</div>
          <div className="text-sm text-ink-400 mt-1">
            Peso, treino, dieta, sono e humor.
          </div>
        </Link>
        <Link href="/progresso" className="card hover:border-flame-500/40 transition">
          <div className="font-semibold">Ver progresso</div>
          <div className="text-sm text-ink-400 mt-1">
            Gráficos, % de melhoria, evolução.
          </div>
        </Link>
        <Link href="/avaliacao" className="card hover:border-flame-500/40 transition">
          <div className="font-semibold">Autoavaliação</div>
          <div className="text-sm text-ink-400 mt-1">
            Físico, mental, espiritual. Receba ajustes.
          </div>
        </Link>
      </div>
    </div>
  );
}
