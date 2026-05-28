"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { PageHeader } from "@/components/page-header";
import { Save, Sparkles } from "lucide-react";
import { todayISO } from "@/lib/utils";
import { messages } from "@/lib/tone";

interface Suggestion {
  area: string;
  text: string;
}

function buildSuggestions(a: {
  physical: number;
  mental: number;
  spiritual: number;
  energy: number;
  focus: number;
}, tone: "leve" | "normal" | "agressivo"): Suggestion[] {
  const s: Suggestion[] = [];
  const harsh = tone === "agressivo";

  if (a.physical <= 4)
    s.push({
      area: "Físico",
      text: harsh
        ? "Seu corpo está fraco. Treina 3x essa semana, sem desculpa."
        : "Adicione 3 sessões de treino esta semana. Pode ser 30min de caminhada.",
    });
  else if (a.physical <= 7)
    s.push({
      area: "Físico",
      text: "Bom nível. Aumente progressivamente: +5min de treino ou +1 sessão semanal.",
    });

  if (a.mental <= 4)
    s.push({
      area: "Mental",
      text: harsh
        ? "Você está mentalmente travado. Para de rolar feed. Lê 10 páginas e medita 10min hoje."
        : "Reserve 15min de silêncio diário: meditação, journaling ou leitura.",
    });
  else if (a.mental <= 7)
    s.push({
      area: "Mental",
      text: "Continue cultivando: leitura diária e revisão das suas metas semanal.",
    });

  if (a.spiritual <= 4)
    s.push({
      area: "Espiritual",
      text: "Crie um momento diário fixo de oração/leitura espiritual (10min).",
    });
  else if (a.spiritual <= 7)
    s.push({
      area: "Espiritual",
      text: "Aprofunde: estudo dirigido + intercessão por alguém esta semana.",
    });

  if (a.energy <= 4)
    s.push({
      area: "Energia",
      text: harsh
        ? "Sua energia tá no chão. Dorme 8h, corta café depois das 14h, sem álcool essa semana."
        : "Foque em sono (7-9h), hidratação e luz solar pela manhã.",
    });

  if (a.focus <= 4)
    s.push({
      area: "Foco",
      text: "Aplique blocos de 25min sem celular (Pomodoro). 4 blocos por dia.",
    });

  if (s.length === 0) {
    s.push({
      area: "Geral",
      text: harsh
        ? "Tudo alto. Então sobe a régua. Você não vai parar agora."
        : "Você está em ótimo equilíbrio. Mantenha consistência e suba a régua aos poucos.",
    });
  }

  return s;
}

export default function AvaliacaoPage() {
  const profile = useStore((s) => s.profile);
  const addAssessment = useStore((s) => s.addAssessment);
  const assessments = useStore((s) => s.assessments);
  const awardXp = useStore((s) => s.awardXp);

  const [physical, setPhysical] = useState(5);
  const [mental, setMental] = useState(5);
  const [spiritual, setSpiritual] = useState(5);
  const [energy, setEnergy] = useState(5);
  const [focus, setFocus] = useState(5);
  const [notes, setNotes] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[] | null>(null);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  if (!profile) return null;

  function submit() {
    addAssessment({
      date: todayISO(),
      physical,
      mental,
      spiritual,
      energy,
      focus,
      notes: notes || undefined,
    });
    const s = buildSuggestions(
      { physical, mental, spiritual, energy, focus },
      profile!.tone,
    );
    setSuggestions(s);
    const res = awardXp(20);
    setSavedMsg(
      `+20 XP por se autoavaliar. ${res.leveledUp ? messages(profile!.tone).levelUp(res.newLevelName!) : ""}`,
    );
  }

  const last = assessments[assessments.length - 1];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Autoavaliação"
        subtitle="Como você está em cada dimensão? Receba sugestões personalizadas."
      />

      <div className="card space-y-5">
        <SliderRow label="Físico" value={physical} onChange={setPhysical} />
        <SliderRow label="Mental" value={mental} onChange={setMental} />
        <SliderRow label="Espiritual" value={spiritual} onChange={setSpiritual} />
        <SliderRow label="Energia" value={energy} onChange={setEnergy} />
        <SliderRow label="Foco" value={focus} onChange={setFocus} />

        <div>
          <label className="label">Notas (opcional)</label>
          <textarea
            className="field min-h-[80px]"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="O que está pesando? O que está fluindo bem?"
          />
        </div>

        <button onClick={submit} className="btn-primary">
          <Save className="w-4 h-4" /> Avaliar e receber sugestões
        </button>
        {savedMsg && (
          <div className="text-sm text-good">{savedMsg}</div>
        )}
      </div>

      {suggestions && (
        <div className="card border-accent/30">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-accent" />
            <h3 className="heading text-xl">Sugestões personalizadas</h3>
          </div>
          <ul className="space-y-3">
            {suggestions.map((s, i) => (
              <li key={i} className="flex gap-3">
                <div className="text-accent font-bold text-sm w-24 shrink-0">
                  {s.area}
                </div>
                <div className="text-sm">{s.text}</div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {last && !suggestions && (
        <div className="card">
          <div className="text-xs text-muted uppercase tracking-wider mb-1">
            Última avaliação ({new Date(last.date).toLocaleDateString("pt-BR")})
          </div>
          <div className="grid grid-cols-5 gap-2 text-center">
            {[
              ["Físico", last.physical],
              ["Mental", last.mental],
              ["Espiritual", last.spiritual],
              ["Energia", last.energy],
              ["Foco", last.focus],
            ].map(([label, v]) => (
              <div key={label as string} className="p-3 bg-card-hover rounded-lg">
                <div className="text-2xl font-bold text-accent">{v}</div>
                <div className="text-[10px] text-muted uppercase tracking-wider">
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SliderRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-semibold">{label}</label>
        <span className="text-2xl font-bold text-accent tabular-nums">{value}</span>
      </div>
      <input
        type="range"
        min={1}
        max={10}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-orange-500"
      />
      <div className="flex justify-between text-[10px] text-muted mt-1">
        <span>fraco</span>
        <span>excelente</span>
      </div>
    </div>
  );
}
