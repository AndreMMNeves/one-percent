"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { ArrowRight, ArrowLeft, Flame, Check } from "lucide-react";
import type { ActivityLevel, Goal, Sex, Tone } from "@/lib/types";
import { activityLabel, goalLabel } from "@/lib/calculations";

const STEPS = ["perfil", "corpo", "objetivo", "tom"] as const;

export default function CadastroPage() {
  const router = useRouter();
  const setProfile = useStore((s) => s.setProfile);

  const [step, setStep] = useState<(typeof STEPS)[number]>("perfil");

  const [name, setName] = useState("");
  const [age, setAge] = useState<number | "">("");
  const [sex, setSex] = useState<Sex>("masculino");
  const [heightCm, setHeightCm] = useState<number | "">("");
  const [weightKg, setWeightKg] = useState<number | "">("");
  const [bodyFatPct, setBodyFatPct] = useState<number | "">("");
  const [waistCm, setWaistCm] = useState<number | "">("");
  const [neckCm, setNeckCm] = useState<number | "">("");
  const [hipCm, setHipCm] = useState<number | "">("");
  const [activity, setActivity] = useState<ActivityLevel>("moderado");
  const [goal, setGoal] = useState<Goal>("perder_gordura");
  const [tone, setTone] = useState<Tone>("normal");

  const stepIdx = STEPS.indexOf(step);
  const canNext =
    (step === "perfil" && name && age && sex) ||
    (step === "corpo" && heightCm && weightKg) ||
    step === "objetivo" ||
    step === "tom";

  function next() {
    if (stepIdx < STEPS.length - 1) setStep(STEPS[stepIdx + 1]);
    else finish();
  }
  function back() {
    if (stepIdx > 0) setStep(STEPS[stepIdx - 1]);
  }

  function finish() {
    if (!name || !age || !heightCm || !weightKg) return;
    setProfile({
      name,
      age: Number(age),
      sex,
      heightCm: Number(heightCm),
      weightKg: Number(weightKg),
      bodyFatPct: bodyFatPct ? Number(bodyFatPct) : undefined,
      waistCm: waistCm ? Number(waistCm) : undefined,
      neckCm: neckCm ? Number(neckCm) : undefined,
      hipCm: hipCm ? Number(hipCm) : undefined,
      activity,
      goal,
      tone,
      createdAt: new Date().toISOString(),
    });
    router.replace("/");
  }

  return (
    <div className="min-h-screen grid place-items-center px-4 py-8">
      <div className="w-full max-w-xl">
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-12 h-12 rounded-xl bg-flame-500 grid place-items-center shadow-lg shadow-flame-500/40">
            <Flame className="w-6 h-6 text-ink-950" />
          </div>
          <div>
            <div className="heading text-3xl">ONE PERCENT</div>
            <div className="text-xs uppercase tracking-[0.25em] text-ink-400">
              começa aqui
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-2 mb-6">
            {STEPS.map((s, i) => (
              <div
                key={s}
                className={`h-1.5 flex-1 rounded-full transition ${
                  i <= stepIdx ? "bg-flame-500" : "bg-white/10"
                }`}
              />
            ))}
          </div>

          {step === "perfil" && (
            <div className="space-y-4 animate-fade-in">
              <h2 className="heading text-2xl">Sobre você</h2>
              <p className="text-ink-400 text-sm">
                Vamos começar pelo essencial.
              </p>
              <div>
                <label className="label">Nome</label>
                <input
                  className="field"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Idade</label>
                  <input
                    type="number"
                    className="field"
                    value={age}
                    onChange={(e) =>
                      setAge(e.target.value ? Number(e.target.value) : "")
                    }
                  />
                </div>
                <div>
                  <label className="label">Sexo biológico</label>
                  <select
                    className="field"
                    value={sex}
                    onChange={(e) => setSex(e.target.value as Sex)}
                  >
                    <option value="masculino">Masculino</option>
                    <option value="feminino">Feminino</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {step === "corpo" && (
            <div className="space-y-4 animate-fade-in">
              <h2 className="heading text-2xl">Medidas atuais</h2>
              <p className="text-ink-400 text-sm">
                Usaremos para calcular IMC, calorias e gordura corporal.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Altura (cm)</label>
                  <input
                    type="number"
                    className="field"
                    value={heightCm}
                    onChange={(e) =>
                      setHeightCm(e.target.value ? Number(e.target.value) : "")
                    }
                  />
                </div>
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
              </div>

              <div>
                <label className="label">Nível de atividade</label>
                <select
                  className="field"
                  value={activity}
                  onChange={(e) => setActivity(e.target.value as ActivityLevel)}
                >
                  {(
                    ["sedentario", "leve", "moderado", "intenso", "atleta"] as ActivityLevel[]
                  ).map((a) => (
                    <option key={a} value={a}>
                      {activityLabel(a)}
                    </option>
                  ))}
                </select>
              </div>

              <details className="text-sm">
                <summary className="cursor-pointer text-ink-300 hover:text-ink-50">
                  Opcional: medidas para estimar gordura corporal
                </summary>
                <div className="grid grid-cols-3 gap-3 mt-3">
                  <div>
                    <label className="label">Cintura (cm)</label>
                    <input
                      type="number"
                      className="field"
                      value={waistCm}
                      onChange={(e) =>
                        setWaistCm(e.target.value ? Number(e.target.value) : "")
                      }
                    />
                  </div>
                  <div>
                    <label className="label">Pescoço (cm)</label>
                    <input
                      type="number"
                      className="field"
                      value={neckCm}
                      onChange={(e) =>
                        setNeckCm(e.target.value ? Number(e.target.value) : "")
                      }
                    />
                  </div>
                  {sex === "feminino" && (
                    <div>
                      <label className="label">Quadril (cm)</label>
                      <input
                        type="number"
                        className="field"
                        value={hipCm}
                        onChange={(e) =>
                          setHipCm(e.target.value ? Number(e.target.value) : "")
                        }
                      />
                    </div>
                  )}
                  <div className="col-span-3">
                    <label className="label">Ou informe % de gordura, se já souber</label>
                    <input
                      type="number"
                      step="0.1"
                      className="field"
                      value={bodyFatPct}
                      onChange={(e) =>
                        setBodyFatPct(
                          e.target.value ? Number(e.target.value) : "",
                        )
                      }
                    />
                  </div>
                </div>
              </details>
            </div>
          )}

          {step === "objetivo" && (
            <div className="space-y-4 animate-fade-in">
              <h2 className="heading text-2xl">Qual seu objetivo?</h2>
              <p className="text-ink-400 text-sm">
                Vamos ajustar dieta, calorias e desafios em torno disso.
              </p>
              <div className="grid gap-2">
                {(
                  [
                    "perder_gordura",
                    "ganhar_massa",
                    "manter_peso",
                    "saude_geral",
                    "performance",
                  ] as Goal[]
                ).map((g) => (
                  <button
                    key={g}
                    onClick={() => setGoal(g)}
                    className={`text-left p-4 rounded-lg border transition ${
                      goal === g
                        ? "border-flame-500 bg-flame-500/10"
                        : "border-white/10 hover:border-white/30"
                    }`}
                  >
                    <div className="font-semibold">{goalLabel(g)}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === "tom" && (
            <div className="space-y-4 animate-fade-in">
              <h2 className="heading text-2xl">Como devo falar com você?</h2>
              <p className="text-ink-400 text-sm">
                Notificações, frases e cobranças seguem esse tom. Pode mudar depois.
              </p>
              <div className="grid gap-2">
                {(
                  [
                    {
                      t: "leve" as Tone,
                      title: "Leve",
                      desc: "Suave, encorajador, sem pressão.",
                    },
                    {
                      t: "normal" as Tone,
                      title: "Normal",
                      desc: "Motivacional, direto, enérgico.",
                    },
                    {
                      t: "agressivo" as Tone,
                      title: "Agressivo",
                      desc: "Cobrança dura, sem rodeios. Para quem quer pressão.",
                    },
                  ]
                ).map((o) => (
                  <button
                    key={o.t}
                    onClick={() => setTone(o.t)}
                    className={`text-left p-4 rounded-lg border transition ${
                      tone === o.t
                        ? "border-flame-500 bg-flame-500/10"
                        : "border-white/10 hover:border-white/30"
                    }`}
                  >
                    <div className="font-semibold">{o.title}</div>
                    <div className="text-sm text-ink-400">{o.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mt-8">
            <button
              onClick={back}
              disabled={stepIdx === 0}
              className="btn-ghost disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-4 h-4" /> Voltar
            </button>
            <button
              onClick={next}
              disabled={!canNext}
              className="btn-primary disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {stepIdx === STEPS.length - 1 ? (
                <>
                  Começar <Check className="w-4 h-4" />
                </>
              ) : (
                <>
                  Próximo <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
