"use client";

import { useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";
import { useStore } from "@/lib/store";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { calcBMI, calcCalorieTarget } from "@/lib/calculations";
import { fmtNumber } from "@/lib/utils";
import { LEVELS, levelFromXp, nextLevelInfo } from "@/lib/levels";
import { TrendingDown, TrendingUp, Target, Trophy } from "lucide-react";

export default function ProgressoPage() {
  const profile = useStore((s) => s.profile);
  const logs = useStore((s) => s.logs);
  const xp = useStore((s) => s.xp);
  const completed = useStore((s) => s.completedChallenges);

  const data = useMemo(() => {
    if (!profile) return [];
    return logs.map((l) => ({
      date: l.date.slice(5),
      peso: l.weightKg,
      bmi: l.weightKg ? calcBMI(l.weightKg, profile.heightCm) : undefined,
      cals: l.caloriesIn,
      passos: l.steps,
    }));
  }, [logs, profile]);

  if (!profile) return null;

  const weightLogs = logs.filter((l) => l.weightKg != null);
  const firstWeight = weightLogs[0]?.weightKg ?? profile.weightKg;
  const lastWeight = weightLogs[weightLogs.length - 1]?.weightKg ?? profile.weightKg;
  const weightDelta = +(lastWeight - firstWeight).toFixed(1);
  const pctChange = firstWeight
    ? +((Math.abs(weightDelta) / firstWeight) * 100).toFixed(1)
    : 0;

  const target = calcCalorieTarget(profile);
  const followed = logs.filter((l) => l.followedPlan).length;
  const totalLogs = logs.length;
  const adherence = totalLogs ? Math.round((followed / totalLogs) * 100) : 0;

  const lvl = levelFromXp(xp);
  const { next, progressPct } = nextLevelInfo(xp);

  // last 14d challenge XP
  const last14 = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    const iso = d.toISOString().slice(0, 10);
    const dayXp = completed
      .filter((c) => c.completedAt.slice(0, 10) === iso)
      .reduce((s, c) => s + c.xpAwarded, 0);
    return { date: iso.slice(5), xp: dayXp };
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Progresso"
        subtitle="Sua evolução em números e gráficos."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Δ Peso"
          value={`${weightDelta > 0 ? "+" : ""}${weightDelta} kg`}
          hint={`${pctChange}% de mudança`}
          icon={weightDelta < 0 ? TrendingDown : TrendingUp}
          tone={
            profile.goal === "perder_gordura"
              ? weightDelta < 0
                ? "good"
                : "warn"
              : profile.goal === "ganhar_massa"
                ? weightDelta > 0
                  ? "good"
                  : "warn"
                : "neutral"
          }
        />
        <StatCard
          label="Aderência à dieta"
          value={`${adherence}%`}
          hint={`${followed}/${totalLogs} dias no plano`}
          icon={Target}
          tone={adherence >= 70 ? "good" : adherence >= 40 ? "warn" : "bad"}
        />
        <StatCard
          label="XP total"
          value={fmtNumber(xp)}
          hint={`Nível ${lvl.level} · ${lvl.name}`}
          icon={Trophy}
          tone="good"
        />
        <StatCard
          label="Para próximo nível"
          value={next ? `${progressPct}%` : "MAX"}
          hint={next ? `→ ${next.name}` : "você atingiu o topo"}
          icon={Trophy}
        />
      </div>

      <div className="card">
        <h3 className="heading text-xl mb-4">Peso ao longo do tempo</h3>
        <div className="h-64">
          {data.filter((d) => d.peso).length > 1 ? (
            <ResponsiveContainer>
              <LineChart data={data.filter((d) => d.peso)}>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
                <XAxis dataKey="date" stroke="#888893" />
                <YAxis stroke="#888893" domain={["dataMin - 1", "dataMax + 1"]} />
                <Tooltip
                  contentStyle={{
                    background: "#18181c",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 8,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="peso"
                  stroke="#f97316"
                  strokeWidth={2.5}
                  dot={{ fill: "#f97316", r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full grid place-items-center text-muted text-sm">
              Registre seu peso por alguns dias para ver o gráfico.
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <h3 className="heading text-xl mb-4">XP nos últimos 14 dias</h3>
        <div className="h-56">
          <ResponsiveContainer>
            <BarChart data={last14}>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
              <XAxis dataKey="date" stroke="#888893" />
              <YAxis stroke="#888893" />
              <Tooltip
                contentStyle={{
                  background: "#18181c",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 8,
                }}
              />
              <Bar dataKey="xp" fill="#f97316" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="card">
          <h3 className="heading text-xl mb-4">Calorias vs meta ({target})</h3>
          <div className="h-56">
            {data.filter((d) => d.cals).length > 0 ? (
              <ResponsiveContainer>
                <BarChart data={data.filter((d) => d.cals)}>
                  <CartesianGrid stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
                  <XAxis dataKey="date" stroke="#888893" />
                  <YAxis stroke="#888893" />
                  <Tooltip
                    contentStyle={{
                      background: "#18181c",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 8,
                    }}
                  />
                  <Bar dataKey="cals" fill="#ff2d55" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full grid place-items-center text-muted text-sm">
                Sem dados ainda.
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <h3 className="heading text-xl mb-4">Passos por dia</h3>
          <div className="h-56">
            {data.filter((d) => d.passos).length > 0 ? (
              <ResponsiveContainer>
                <BarChart data={data.filter((d) => d.passos)}>
                  <CartesianGrid stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
                  <XAxis dataKey="date" stroke="#888893" />
                  <YAxis stroke="#888893" />
                  <Tooltip
                    contentStyle={{
                      background: "#18181c",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 8,
                    }}
                  />
                  <Bar dataKey="passos" fill="#fb923c" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full grid place-items-center text-muted text-sm">
                Sem dados ainda.
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="heading text-xl mb-4">Mapa de níveis (50)</h3>
        <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
          {LEVELS.map((l) => {
            const unlocked = xp >= l.xpRequired;
            return (
              <div
                key={l.level}
                title={`${l.name} (${l.xpRequired} XP)`}
                className={`aspect-square rounded text-[10px] font-bold grid place-items-center transition ${
                  unlocked
                    ? "bg-accent/80 text-accent-foreground"
                    : "bg-card-hover text-muted"
                } ${l.level === lvl.level ? "ring-2 ring-accent" : ""}`}
              >
                {l.level}
              </div>
            );
          })}
        </div>
        <div className="text-xs text-muted mt-3">
          Passe o mouse para ver o nome de cada nível.
        </div>
      </div>
    </div>
  );
}
