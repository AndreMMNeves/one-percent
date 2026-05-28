"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useStore } from "@/lib/store";
import { Cloud, CheckCircle2, Loader2, X } from "lucide-react";

type SyncState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "prompt"; localCount: number }
  | { kind: "syncing" }
  | { kind: "done" }
  | { kind: "error"; msg: string };

export function SessionSync() {
  const { data: session, status } = useSession();
  const cloudEnabled = useStore((s) => s.cloudEnabled);
  const setCloudEnabled = useStore((s) => s.setCloudEnabled);
  const replaceFromCloud = useStore((s) => s.replaceFromCloud);
  const localProfile = useStore((s) => s.profile);
  const localLogs = useStore((s) => s.logs);
  const localNotes = useStore((s) => s.notes);
  const localComps = useStore((s) => s.completedChallenges);
  const hydrated = useStore((s) => s.hydrated);

  const [state, setState] = useState<SyncState>({ kind: "idle" });

  useEffect(() => {
    if (status !== "authenticated" || !hydrated) {
      if (cloudEnabled && status === "unauthenticated") setCloudEnabled(false);
      return;
    }
    if (state.kind !== "idle") return;

    (async () => {
      setState({ kind: "loading" });
      try {
        const { getAllMyData } = await import("@/app/actions/sync");
        const remote = await getAllMyData();

        const remoteHasData =
          !!remote.profile ||
          (remote.logs?.length ?? 0) > 0 ||
          (remote.notes?.length ?? 0) > 0;

        const localHasData =
          !!localProfile ||
          localLogs.length > 0 ||
          localNotes.length > 0 ||
          localComps.length > 0;

        if (remoteHasData) {
          replaceFromCloud(remote);
          setCloudEnabled(true);
          setState({ kind: "idle" });
          return;
        }

        if (localHasData) {
          const localCount =
            (localProfile ? 1 : 0) +
            localLogs.length +
            localNotes.length +
            localComps.length;
          setState({ kind: "prompt", localCount });
          return;
        }

        setCloudEnabled(true);
        setState({ kind: "idle" });
      } catch (e) {
        setState({
          kind: "error",
          msg: e instanceof Error ? e.message : "Erro desconhecido",
        });
      }
    })();
  }, [
    status,
    hydrated,
    state.kind,
    cloudEnabled,
    setCloudEnabled,
    replaceFromCloud,
    localProfile,
    localLogs,
    localNotes,
    localComps,
  ]);

  async function syncUp() {
    setState({ kind: "syncing" });
    try {
      const { syncLocalToCloud } = await import("@/app/actions/sync");
      const state = useStore.getState();
      await syncLocalToCloud({
        profile: state.profile,
        xp: state.xp,
        logs: state.logs,
        notes: state.notes,
        completedChallenges: state.completedChallenges,
        assessments: state.assessments,
        hydrated: true,
      });
      setCloudEnabled(true);
      setState({ kind: "done" });
      setTimeout(() => setState({ kind: "idle" }), 2500);
    } catch (e) {
      setState({
        kind: "error",
        msg: e instanceof Error ? e.message : "Erro",
      });
    }
  }

  function skipSync() {
    setCloudEnabled(true);
    setState({ kind: "idle" });
  }

  if (state.kind === "idle" || !session) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 max-w-sm card border-accent/40 animate-slide-up">
      {state.kind === "loading" && (
        <div className="flex items-center gap-3 text-sm">
          <Loader2 className="w-4 h-4 animate-spin text-accent" />
          Carregando seus dados…
        </div>
      )}

      {state.kind === "syncing" && (
        <div className="flex items-center gap-3 text-sm">
          <Loader2 className="w-4 h-4 animate-spin text-accent" />
          Enviando seus dados pra nuvem…
        </div>
      )}

      {state.kind === "done" && (
        <div className="flex items-center gap-3 text-sm">
          <CheckCircle2 className="w-4 h-4 text-good" />
          Sincronizado. Seus dados estão na nuvem.
        </div>
      )}

      {state.kind === "prompt" && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Cloud className="w-5 h-5 text-accent" />
            <div className="font-semibold">Sincronizar dispositivo</div>
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            Encontrei <b>{state.localCount} itens</b> neste dispositivo que ainda
            não estão na sua conta. Quer enviar pra nuvem?
          </p>
          <div className="flex items-center gap-2">
            <button onClick={syncUp} className="btn-primary">
              Sincronizar
            </button>
            <button onClick={skipSync} className="btn-ghost">
              Agora não
            </button>
          </div>
        </div>
      )}

      {state.kind === "error" && (
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <div className="font-semibold text-bad">Erro no sync</div>
            <div className="text-xs text-muted-foreground mt-1">{state.msg}</div>
          </div>
          <button
            onClick={() => setState({ kind: "idle" })}
            className="text-muted hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
