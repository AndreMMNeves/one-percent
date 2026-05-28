"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  AppState,
  Assessment,
  ChallengeResult,
  DailyLog,
  Note,
  UserProfile,
} from "./types";
import { uid, todayISO } from "./utils";
import { levelFromXp } from "./levels";

interface CloudState {
  cloudEnabled: boolean;
}

interface Actions {
  setProfile: (p: UserProfile) => void;
  updateProfile: (patch: Partial<UserProfile>) => void;
  resetAll: () => void;

  upsertLog: (log: DailyLog) => void;
  getLog: (dateISO: string) => DailyLog | undefined;

  addNote: (note: Omit<Note, "id" | "createdAt">) => void;
  removeNote: (id: string) => void;

  completeChallenge: (
    challengeId: string,
    xp: number,
    verifiedBy: ChallengeResult["verifiedBy"],
    proof?: string,
  ) => void;
  hasCompletedToday: (challengeId: string) => boolean;

  addAssessment: (a: Assessment) => void;

  awardXp: (amount: number) => { leveledUp: boolean; newLevelName?: string };
  markNotificationShown: () => void;

  // cloud sync
  setCloudEnabled: (b: boolean) => void;
  replaceFromCloud: (partial: Partial<AppState>) => void;
}

const initial: AppState & CloudState = {
  profile: undefined,
  xp: 0,
  logs: [],
  notes: [],
  completedChallenges: [],
  assessments: [],
  hydrated: false,
  cloudEnabled: false,
};

function fireSync(promise: Promise<unknown>) {
  if (typeof window === "undefined") return;
  promise.catch((err) => console.warn("[cloud sync] failed:", err));
}

export const useStore = create<AppState & CloudState & Actions>()(
  persist(
    (set, get) => ({
      ...initial,

      setProfile: (p) => {
        set({ profile: p });
        if (get().cloudEnabled) {
          fireSync(
            import("@/app/actions/profile").then(({ upsertProfile }) => upsertProfile(p)),
          );
        }
      },

      updateProfile: (patch) => {
        const cur = get().profile;
        if (!cur) return;
        const next = { ...cur, ...patch };
        set({ profile: next });
        if (get().cloudEnabled) {
          fireSync(
            import("@/app/actions/profile").then(({ upsertProfile }) =>
              upsertProfile(next),
            ),
          );
        }
      },

      resetAll: () => set({ ...initial, hydrated: true }),

      upsertLog: (log) => {
        set((s) => {
          const idx = s.logs.findIndex((l) => l.date === log.date);
          const next = [...s.logs];
          if (idx >= 0) next[idx] = { ...next[idx], ...log };
          else next.push(log);
          next.sort((a, b) => a.date.localeCompare(b.date));
          return { logs: next };
        });
        if (get().cloudEnabled) {
          fireSync(
            import("@/app/actions/logs").then(({ upsertLogAction }) =>
              upsertLogAction(log),
            ),
          );
        }
      },

      getLog: (dateISO) => get().logs.find((l) => l.date === dateISO),

      addNote: (note) => {
        const local: Note = {
          ...note,
          id: uid("note"),
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ notes: [local, ...s.notes] }));
        if (get().cloudEnabled) {
          fireSync(
            import("@/app/actions/notes").then(async ({ addNoteAction }) => {
              const persisted = await addNoteAction(note);
              // Swap local optimistic id with persisted id
              set((s) => ({
                notes: s.notes.map((n) => (n.id === local.id ? persisted : n)),
              }));
            }),
          );
        }
      },

      removeNote: (id) => {
        set((s) => ({ notes: s.notes.filter((n) => n.id !== id) }));
        if (get().cloudEnabled) {
          fireSync(
            import("@/app/actions/notes").then(({ removeNoteAction }) =>
              removeNoteAction(id),
            ),
          );
        }
      },

      completeChallenge: (challengeId, xp, verifiedBy, proof) => {
        const today = todayISO();
        const already = get().completedChallenges.some(
          (c) => c.challengeId === challengeId && c.completedAt.slice(0, 10) === today,
        );
        if (already) return;
        const local: ChallengeResult = {
          id: uid("ch"),
          challengeId,
          completedAt: new Date().toISOString(),
          verifiedBy,
          proof,
          xpAwarded: xp,
        };
        set((s) => ({
          completedChallenges: [...s.completedChallenges, local],
          xp: s.xp + xp,
        }));
        if (get().cloudEnabled) {
          fireSync(
            import("@/app/actions/challenges").then(
              ({ completeChallengeAction }) =>
                completeChallengeAction(challengeId, xp, verifiedBy, proof),
            ),
          );
        }
      },

      hasCompletedToday: (challengeId) => {
        const today = todayISO();
        return get().completedChallenges.some(
          (c) => c.challengeId === challengeId && c.completedAt.slice(0, 10) === today,
        );
      },

      addAssessment: (a) => {
        set((s) => ({ assessments: [...s.assessments, a] }));
        if (get().cloudEnabled) {
          fireSync(
            import("@/app/actions/assessments").then(({ addAssessmentAction }) =>
              addAssessmentAction(a),
            ),
          );
        }
      },

      awardXp: (amount) => {
        const before = levelFromXp(get().xp);
        set((s) => ({ xp: s.xp + amount }));
        const after = levelFromXp(get().xp);
        if (get().cloudEnabled) {
          fireSync(
            import("@/app/actions/profile").then(({ setXp }) => setXp(get().xp)),
          );
        }
        if (after.level > before.level) {
          return { leveledUp: true, newLevelName: after.name };
        }
        return { leveledUp: false };
      },

      markNotificationShown: () =>
        set({ lastNotificationAt: new Date().toISOString() }),

      setCloudEnabled: (b) => set({ cloudEnabled: b }),

      replaceFromCloud: (partial) =>
        set((s) => ({
          profile: partial.profile ?? s.profile,
          xp: partial.xp ?? s.xp,
          logs: partial.logs ?? s.logs,
          notes: partial.notes ?? s.notes,
          completedChallenges: partial.completedChallenges ?? s.completedChallenges,
          assessments: partial.assessments ?? s.assessments,
        })),
    }),
    {
      name: "one-percent-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        profile: s.profile,
        xp: s.xp,
        logs: s.logs,
        notes: s.notes,
        completedChallenges: s.completedChallenges,
        assessments: s.assessments,
        lastNotificationAt: s.lastNotificationAt,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) state.hydrated = true;
      },
    },
  ),
);
