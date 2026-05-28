"use client";

import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { todayISO } from "@/lib/utils";
import { PageHeader } from "@/components/page-header";
import {
  calcCalorieTarget,
  calcProteinTargetG,
  calcWaterTargetMl,
} from "@/lib/calculations";
import { messages } from "@/lib/tone";
import { Check, Save, Smile, Frown, Meh } from "lucide-react";

export default function DiarioPage() {
  const profile = useStore((s) => s.profile);
  const upsertLog = useStore((s) => s.upsertLog);
  const getLog = useStore((s) => s.getLog);
  const awardXp = useStore((s) => s.awardXp);

  const [date, setDate] = useState(todayISO());
  const existing = getLog(date);

  const [weightKg, setWeightKg] = useState<number | "">(existing?.weightKg ?? "");
  const [workoutMinutes, setWorkoutMinutes] = useState<number | "">(
    existing?.workoutMinutes ?? "",
  );
  const [workoutType, setWorkoutType] = useState(existing?.workoutType ?? "");
  const [steps, setSteps] = useState<number | "">(existing?.steps ?? "");
  const [caloriesIn, setCaloriesIn] = useState<number | "">(existing?.caloriesIn ?? "");
  const [proteinG, setProteinG] = useState<number | "">(existing?.proteinG ?? "");
  const [waterMl, setWaterMl] = useState<number | "">(existing?.waterMl ?? "");
  const [sleepHours, setSleepHours] = useState<number | "">(existing?.sleepHours ?? "");
  const [mood, setMood] = useState<1 | 2 | 3 | 4 | 5>(existing?.mood ?? 3);
  const [diet, setDiet] = useState(existing?.diet ?? "");
  const [notes, setNotes] = useState(existing?.notes ?? "");
  const [saved, setSaved] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const targets = useMemo(() => {
    if (!profile) return null;
    return {
      cals: calcCalorieTarget(profile),
      protein: calcProteinTargetG(profile),
      water: calcWaterTargetMl(profile.weightKg),
    };
  }, [profile]);

  if (!profile || !targets) return null;
  const tone = profile.tone;

  function evaluateDiet(cals: number, prot: number): {
    onPlan: boolean;
    msg: string;
  } {
    const calDiff = cals - targets!.cals;
    const protDiff = prot - targets!.protein;
    const onPlan = Math.abs(calDiff) <= targets!.cals * 0.1 && protDiff >= -10;
    if (onPlan) {
      return { onPlan: true, msg: messages(tone).dietOn };
    }
    if (calDiff > targets!.cals * 0.1) {
      return {
        onPlan: false,
        msg:
          tone === "agressivo"
            ? `Estourou ${Math.round(calDiff)} kcal. Ou treina mais, ou come menos. Sem milagre.`
            : `Acima da meta em ${Math.round(calDiff)} kcal. Ajuste a próxima refeição.`,
      };
    }
    if (calDiff < -targets!.cals * 0.15) {
      return {
        onPlan: false,
        msg:
          tone === "agressivo"
            ? `Faltam ${Math.round(-calDiff)} kcal. Comer pouco também atrasa.`
            : `Você comeu pouco (${Math.round(-calDiff)} kcal abaixo). Não pula refeição.`,
      };
    }
    if (protDiff < -10) {
      return {
        onPlan: false,
        msg: `Proteína baixa (${prot}g de ${targets!.protein}g). Adiciona uma fonte na próxima refeição.`,
      };
    }
    return { onPlan: true, msg: messages(tone).dietOn };
  }

  function save() {
    const t = targets!;
    upsertLog({
      date,
      weightKg: weightKg === "" ? undefined : Number(weightKg),
      workoutMinutes: workoutMinutes === "" ? undefined : Number(workoutMinutes),
      workoutType: workoutType || undefined,
      steps: steps === "" ? undefined : Number(steps),
      caloriesIn: caloriesIn === "" ? undefined : Number(caloriesIn),
      proteinG: proteinG === "" ? undefined : Number(proteinG),
      waterMl: waterMl === "" ? undefined : Number(waterMl),
      sleepHours: sleepHours === "" ? undefined : Number(sleepHours),
      mood,
      diet: diet || undefined,
      notes: notes || undefined,
    });

    let earned = 10; // base for logging
    if (workoutMinutes && Number(workoutMinutes) >= 20) earned += 20;
    if (waterMl && Number(waterMl) >= t.water) earned += 10;
    if (sleepHours && Number(sleepHours) >= 7) earned += 10;
    let dietEval: { onPlan: boolean; msg: string } | null = null;
    if (caloriesIn && proteinG) {
      dietEval = evaluateDiet(Number(caloriesIn), Number(proteinG));
      if (dietEval.onPlan) earned += 25;
      upsertLog({ date, followedPlan: dietEval.onPlan });
    }

    const res = awardXp(earned);
    let msg = `Registro salvo. +${earned} XP.`;
    if (dietEval) msg += ` ${dietEval.msg}`;
    if (res.leveledUp) msg += ` 🔥 ${messages(tone).levelUp(res.newLevelName!)}`;

    setFeedback(msg);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Diário"
        subtitle="Registre seu dia. O sistema avalia se você está no caminho."
        action={
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="field !w-auto"
          />
        }
      />

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="card space-y-4">
          <h3 className="heading text-xl">Corpo</h3>
          <div>
            <label className="label">Peso (kg)</label>
            <input
              type="number"
              step="0.1"
              className="field"
              value={weightKg}
              onChange={(e) =>
                setWeightKg(e.target.value ? Number(e.target.value) : "")
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Treino (min)</label>
              <input
                type="number"
                className="field"
                value={workoutMinutes}
                onChange={(e) =>
                  setWorkoutMinutes(e.target.value ? Number(e.target.value) : "")
                }
              />
            </div>
            <div>
              <label className="label">Tipo</label>
              <input
                className="field"
                placeholder="Musculação, corrida..."
                value={workoutType}
                onChange={(e) => setWorkoutType(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Passos</label>
              <input
                type="number"
                className="field"
                value={steps}
                onChange={(e) => setSteps(e.target.value ? Number(e.target.value) : "")}
              />
            </div>
            <div>
              <label className="label">Sono (h)</label>
              <input
                type="number"
                step="0.5"
                className="field"
                value={sleepHours}
                onChange={(e) =>
                  setSleepHours(e.target.value ? Number(e.target.value) : "")
                }
              />
            </div>
          </div>
        </div>

        <div className="card space-y-4">
          <h3 className="heading text-xl">Dieta</h3>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="label">Calorias</label>
              <input
                type="number"
                className="field"
                value={caloriesIn}
                onChange={(e) =>
                  setCaloriesIn(e.target.value ? Number(e.target.value) : "")
                }
              />
              <div className="text-[10px] text-muted mt-1">meta {targets.cals}</div>
            </div>
            <div>
              <label className="label">Proteína (g)</label>
              <input
                type="number"
                className="field"
                value={proteinG}
                onChange={(e) =>
                  setProteinG(e.target.value ? Number(e.target.value) : "")
                }
              />
              <div className="text-[10px] text-muted mt-1">meta {targets.protein}g</div>
            </div>
            <div>
              <label className="label">Água (ml)</label>
              <input
                type="number"
                className="field"
                value={waterMl}
                onChange={(e) =>
                  setWaterMl(e.target.value ? Number(e.target.value) : "")
                }
              />
              <div className="text-[10px] text-muted mt-1">meta {targets.water}ml</div>
            </div>
          </div>
          <div>
            <label className="label">O que você comeu hoje?</label>
            <textarea
              className="field min-h-[80px]"
              value={diet}
              onChange={(e) => setDiet(e.target.value)}
              placeholder="Café: ovos e fruta. Almoço: arroz, frango, salada..."
            />
          </div>
        </div>

        <div className="card lg:col-span-2 space-y-4">
          <h3 className="heading text-xl">Mente</h3>
          <div>
            <label className="label">Humor</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((m) => (
                <button
                  key={m}
                  onClick={() => setMood(m as 1 | 2 | 3 | 4 | 5)}
                  className={`flex-1 py-3 rounded-lg border transition flex items-center justify-center gap-2 ${
                    mood === m
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-border hover:border-border-strong"
                  }`}
                >
                  {m === 1 && <Frown className="w-5 h-5" />}
                  {m === 2 && <Frown className="w-5 h-5" />}
                  {m === 3 && <Meh className="w-5 h-5" />}
                  {m === 4 && <Smile className="w-5 h-5" />}
                  {m === 5 && <Smile className="w-5 h-5" />}
                  <span className="font-semibold">{m}</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label">Notas do dia</label>
            <textarea
              className="field min-h-[80px]"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Como foi o dia, o que aprendeu, o que precisa ajustar..."
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button onClick={save} className="btn-primary">
          {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saved ? "Salvo" : "Salvar registro"}
        </button>
        {feedback && (
          <div className="text-sm text-muted-foreground animate-fade-in flex-1">
            {feedback}
          </div>
        )}
      </div>
    </div>
  );
}
