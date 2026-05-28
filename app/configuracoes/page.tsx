"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { PageHeader } from "@/components/page-header";
import { Trash2, Save, Bell, BellOff } from "lucide-react";
import type { ActivityLevel, Goal, Tone, UserProfile } from "@/lib/types";
import { activityLabel, goalLabel } from "@/lib/calculations";

export default function ConfiguracoesPage() {
  const router = useRouter();
  const profile = useStore((s) => s.profile);
  const updateProfile = useStore((s) => s.updateProfile);
  const resetAll = useStore((s) => s.resetAll);

  const [saved, setSaved] = useState(false);
  const [notifPermission, setNotifPermission] = useState<NotificationPermission | "unsupported">(
    typeof Notification !== "undefined" ? Notification.permission : "unsupported",
  );

  if (!profile) return null;

  function save(patch: Partial<UserProfile>) {
    updateProfile(patch);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  async function requestNotif() {
    if (typeof Notification === "undefined") return;
    const p = await Notification.requestPermission();
    setNotifPermission(p);
    if (p === "granted") {
      new Notification("One Percent", {
        body: "Notificações ativadas. Bora.",
      });
    }
  }

  function reset() {
    if (!confirm("Apagar TUDO (perfil, logs, XP, notas)? Não dá pra voltar.")) return;
    resetAll();
    router.replace("/cadastro");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Configurações"
        subtitle="Ajuste seu perfil, tom de comunicação e notificações."
      />

      <div className="card space-y-4">
        <h3 className="heading text-xl">Perfil</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="label">Nome</label>
            <input
              className="field"
              defaultValue={profile.name}
              onBlur={(e) => save({ name: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Idade</label>
            <input
              type="number"
              className="field"
              defaultValue={profile.age}
              onBlur={(e) => save({ age: Number(e.target.value) })}
            />
          </div>
          <div>
            <label className="label">Altura (cm)</label>
            <input
              type="number"
              className="field"
              defaultValue={profile.heightCm}
              onBlur={(e) => save({ heightCm: Number(e.target.value) })}
            />
          </div>
          <div>
            <label className="label">Peso (kg)</label>
            <input
              type="number"
              step="0.1"
              className="field"
              defaultValue={profile.weightKg}
              onBlur={(e) => save({ weightKg: Number(e.target.value) })}
            />
          </div>
          <div>
            <label className="label">Atividade</label>
            <select
              className="field"
              defaultValue={profile.activity}
              onChange={(e) => save({ activity: e.target.value as ActivityLevel })}
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
          <div>
            <label className="label">Objetivo</label>
            <select
              className="field"
              defaultValue={profile.goal}
              onChange={(e) => save({ goal: e.target.value as Goal })}
            >
              {(
                [
                  "perder_gordura",
                  "ganhar_massa",
                  "manter_peso",
                  "saude_geral",
                  "performance",
                ] as Goal[]
              ).map((g) => (
                <option key={g} value={g}>
                  {goalLabel(g)}
                </option>
              ))}
            </select>
          </div>
        </div>
        {saved && (
          <div className="text-xs text-good flex items-center gap-1">
            <Save className="w-3 h-3" /> Salvo
          </div>
        )}
      </div>

      <div className="card space-y-3">
        <h3 className="heading text-xl">Tom de comunicação</h3>
        <p className="text-sm text-muted">
          Define como o sistema fala com você nas notificações e cobranças.
        </p>
        <div className="grid sm:grid-cols-3 gap-2">
          {(
            [
              { t: "leve" as Tone, label: "Leve", desc: "suave, encorajador" },
              { t: "normal" as Tone, label: "Normal", desc: "motivacional, direto" },
              { t: "agressivo" as Tone, label: "Agressivo", desc: "cobrança dura" },
            ]
          ).map((o) => (
            <button
              key={o.t}
              onClick={() => save({ tone: o.t })}
              className={`text-left p-4 rounded-lg border transition ${
                profile.tone === o.t
                  ? "border-accent bg-accent/10"
                  : "border-border hover:border-border-strong"
              }`}
            >
              <div className="font-semibold">{o.label}</div>
              <div className="text-xs text-muted">{o.desc}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="card space-y-3">
        <h3 className="heading text-xl">Notificações</h3>
        <p className="text-sm text-muted">
          O sistema mostra alertas dentro do app. Para notificações nativas do
          navegador, autorize abaixo.
        </p>
        {notifPermission === "granted" ? (
          <div className="flex items-center gap-2 text-good text-sm">
            <Bell className="w-4 h-4" /> Notificações nativas ativas
          </div>
        ) : notifPermission === "unsupported" ? (
          <div className="flex items-center gap-2 text-muted text-sm">
            <BellOff className="w-4 h-4" /> Não suportado neste navegador
          </div>
        ) : (
          <button onClick={requestNotif} className="btn-primary">
            <Bell className="w-4 h-4" /> Ativar notificações nativas
          </button>
        )}
      </div>

      <div className="card border-bad/30 space-y-3">
        <h3 className="heading text-xl text-bad">Zona perigosa</h3>
        <p className="text-sm text-muted">
          Apaga todos os dados deste dispositivo. Não há backup remoto.
        </p>
        <button onClick={reset} className="btn-danger">
          <Trash2 className="w-4 h-4" /> Resetar tudo
        </button>
      </div>
    </div>
  );
}
