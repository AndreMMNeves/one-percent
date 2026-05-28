"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { CHALLENGES, type Challenge } from "@/lib/challenges";
import { PageHeader } from "@/components/page-header";
import {
  Check,
  Play,
  MapPin,
  Footprints,
  Clock,
  Sparkles,
  Trophy,
  X,
} from "lucide-react";
import { messages } from "@/lib/tone";
import { todayISO } from "@/lib/utils";

const CATEGORY_LABEL: Record<Challenge["category"], string> = {
  fisico: "Físico",
  mental: "Mental",
  espiritual: "Espiritual",
  habito: "Hábito",
  nutricao: "Nutrição",
};

export default function DesafiosPage() {
  const profile = useStore((s) => s.profile);
  const completeChallenge = useStore((s) => s.completeChallenge);
  const hasCompletedToday = useStore((s) => s.hasCompletedToday);
  const completed = useStore((s) => s.completedChallenges);

  const [activeTimer, setActiveTimer] = useState<{ id: string; endsAt: number } | null>(
    null,
  );
  const [feedback, setFeedback] = useState<string | null>(null);
  const [filter, setFilter] = useState<"todos" | Challenge["category"]>("todos");

  if (!profile) return null;
  const tone = profile.tone;

  const list = CHALLENGES.filter((c) => filter === "todos" || c.category === filter);
  const today = todayISO();
  const totalToday = completed
    .filter((c) => c.completedAt.slice(0, 10) === today)
    .reduce((s, c) => s + c.xpAwarded, 0);

  async function verifyGeolocation(c: Challenge) {
    if (!navigator.geolocation) {
      setFeedback("Seu navegador não suporta geolocalização.");
      return;
    }
    setFeedback("Solicitando localização…");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const proof = `lat:${pos.coords.latitude.toFixed(4)},lng:${pos.coords.longitude.toFixed(4)}`;
        completeChallenge(c.id, c.xp, "geolocation", proof);
        setFeedback(`+${c.xp} XP — validado por GPS. ${messages(tone).goodJob}`);
      },
      () => setFeedback("Permissão negada ou indisponível. Conclua manualmente."),
      { enableHighAccuracy: true, timeout: 15000 },
    );
  }

  function verifySteps(c: Challenge) {
    const input = prompt(
      `Quantos passos você deu hoje? (meta: ${c.target?.toLocaleString("pt-BR")})`,
    );
    if (!input) return;
    const n = Number(input);
    if (!n || n < (c.target ?? 0)) {
      setFeedback(
        `Você precisa atingir pelo menos ${c.target?.toLocaleString("pt-BR")} passos.`,
      );
      return;
    }
    completeChallenge(c.id, c.xp, "manual", `${n} passos`);
    setFeedback(`+${c.xp} XP — ${n.toLocaleString("pt-BR")} passos registrados.`);
  }

  function startTimer(c: Challenge) {
    if (!c.target) return;
    const ms = c.target * 60 * 1000;
    setActiveTimer({ id: c.id, endsAt: Date.now() + ms });
  }

  function manualComplete(c: Challenge) {
    completeChallenge(c.id, c.xp, "manual");
    setFeedback(`+${c.xp} XP — ${messages(tone).goodJob}`);
  }

  function cancelTimer() {
    setActiveTimer(null);
  }

  function finishTimer(c: Challenge) {
    completeChallenge(c.id, c.xp, "auto", `timer ${c.target} min`);
    setFeedback(`+${c.xp} XP — timer concluído. ${messages(tone).goodJob}`);
    setActiveTimer(null);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Desafios"
        subtitle="Tarefas verificadas. Complete, ganhe XP, suba de nível."
        action={
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-xs uppercase tracking-wider text-muted">
                XP hoje
              </div>
              <div className="text-2xl font-bold text-accent">+{totalToday}</div>
            </div>
          </div>
        }
      />

      <div className="flex gap-2 flex-wrap">
        {(
          ["todos", "fisico", "nutricao", "mental", "espiritual", "habito"] as const
        ).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f as typeof filter)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
              filter === f
                ? "bg-accent text-accent-foreground"
                : "bg-card-hover text-muted-foreground hover:bg-card-hover"
            }`}
          >
            {f === "todos" ? "Todos" : CATEGORY_LABEL[f as Challenge["category"]]}
          </button>
        ))}
      </div>

      {feedback && (
        <div className="card border-accent/30 animate-fade-in flex items-center justify-between">
          <div className="text-sm">{feedback}</div>
          <button
            className="text-muted hover:text-foreground"
            onClick={() => setFeedback(null)}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {activeTimer && (
        <TimerCard
          challenge={CHALLENGES.find((c) => c.id === activeTimer.id)!}
          endsAt={activeTimer.endsAt}
          onFinish={() => finishTimer(CHALLENGES.find((c) => c.id === activeTimer.id)!)}
          onCancel={cancelTimer}
        />
      )}

      <div className="grid sm:grid-cols-2 gap-3">
        {list.map((c) => {
          const done = hasCompletedToday(c.id);
          return (
            <div
              key={c.id}
              className={`card flex flex-col ${done ? "opacity-50" : ""}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="text-[10px] uppercase tracking-wider text-muted mb-0.5">
                    {CATEGORY_LABEL[c.category]} ·{" "}
                    {c.recurrence === "diario"
                      ? "diário"
                      : c.recurrence === "semanal"
                        ? "semanal"
                        : "único"}
                  </div>
                  <div className="font-semibold text-lg">{c.title}</div>
                  <div className="text-sm text-muted mt-1">{c.description}</div>
                </div>
                <div className="text-accent font-bold shrink-0">+{c.xp}xp</div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {done ? (
                  <button disabled className="btn-ghost opacity-60">
                    <Check className="w-4 h-4" /> Concluído hoje
                  </button>
                ) : (
                  <>
                    {c.verification === "geolocation" && (
                      <button onClick={() => verifyGeolocation(c)} className="btn-primary">
                        <MapPin className="w-4 h-4" /> Validar via GPS
                      </button>
                    )}
                    {c.verification === "steps" && (
                      <button onClick={() => verifySteps(c)} className="btn-primary">
                        <Footprints className="w-4 h-4" /> Validar passos
                      </button>
                    )}
                    {c.verification === "timer" && (
                      <button onClick={() => startTimer(c)} className="btn-primary">
                        <Play className="w-4 h-4" /> Iniciar {c.target}min
                      </button>
                    )}
                    {c.verification === "manual" && (
                      <button onClick={() => manualComplete(c)} className="btn-primary">
                        <Sparkles className="w-4 h-4" /> Marcar feito
                      </button>
                    )}
                    {c.verification !== "manual" && (
                      <button onClick={() => manualComplete(c)} className="btn-ghost">
                        marcar manualmente
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="card">
        <div className="flex items-center gap-2 mb-2">
          <Trophy className="w-5 h-5 text-accent" />
          <h3 className="heading text-xl">Conquistados hoje</h3>
        </div>
        {completed.filter((c) => c.completedAt.slice(0, 10) === today).length === 0 ? (
          <div className="text-sm text-muted">Nada ainda. Bora começar.</div>
        ) : (
          <ul className="text-sm space-y-1">
            {completed
              .filter((c) => c.completedAt.slice(0, 10) === today)
              .map((c) => {
                const ch = CHALLENGES.find((x) => x.id === c.challengeId);
                return (
                  <li key={c.id} className="flex items-center justify-between">
                    <span>{ch?.title ?? c.challengeId}</span>
                    <span className="text-accent font-semibold">+{c.xpAwarded}xp</span>
                  </li>
                );
              })}
          </ul>
        )}
      </div>
    </div>
  );
}

function TimerCard({
  challenge,
  endsAt,
  onFinish,
  onCancel,
}: {
  challenge: Challenge;
  endsAt: number;
  onFinish: () => void;
  onCancel: () => void;
}) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const remaining = Math.max(0, endsAt - now);
  const minutes = Math.floor(remaining / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);
  if (remaining === 0) {
    return (
      <div className="card border-accent/40">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-xs text-muted uppercase tracking-wider">Timer</div>
            <div className="heading text-2xl">{challenge.title} — Concluído!</div>
          </div>
          <button onClick={onFinish} className="btn-primary">
            <Check className="w-4 h-4" /> Reivindicar +{challenge.xp}xp
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="card border-accent/30">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <div className="text-xs text-muted uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-3 h-3" /> Timer ativo
          </div>
          <div className="heading text-2xl">{challenge.title}</div>
          <div className="text-4xl font-bold text-accent mt-1 tabular-nums">
            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
          </div>
        </div>
        <button onClick={onCancel} className="btn-ghost">
          <X className="w-4 h-4" /> Cancelar
        </button>
      </div>
    </div>
  );
}

