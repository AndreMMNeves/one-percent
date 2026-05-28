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

interface Actions {
  setProfile: (p: UserProfile) => void;
  updateProfile: (patch: Partial<UserProfile>) => void;
  resetAll: () => void;

  upsertLog: (log: DailyLog) => void;
  getLog: (dateISO: string) => DailyLog | undefined;

  addNote: (note: Omit<Note, "id" | "createdAt">) => void;
  removeNote: (id: string) => void;

  completeChallenge: (challengeId: string, xp: number, verifiedBy: ChallengeResult["verifiedBy"], proof?: string) => void;
  hasCompletedToday: (challengeId: string) => boolean;

  addAssessment: (a: Assessment) => void;

  awardXp: (amount: number) => { leveledUp: boolean; newLevelName?: string };
  markNotificationShown: () => void;
}

const initial: AppState = {
  profile: undefined,
  xp: 0,
  logs: [],
  notes: [],
  completedChallenges: [],
  assessments: [],
  hydrated: false,
};

export const useStore = create<AppState & Actions>()(
  persist(
    (set, get) => ({
      ...initial,

      setProfile: (p) => set({ profile: p }),
      updateProfile: (patch) =>
        set((s) => (s.profile ? { profile: { ...s.profile, ...patch } } : s)),

      resetAll: () => set({ ...initial, hydrated: true }),

      upsertLog: (log) =>
        set((s) => {
          const idx = s.logs.findIndex((l) => l.date === log.date);
          const next = [...s.logs];
          if (idx >= 0) next[idx] = { ...next[idx], ...log };
          else next.push(log);
          next.sort((a, b) => a.date.localeCompare(b.date));
          return { logs: next };
        }),

      getLog: (dateISO) => get().logs.find((l) => l.date === dateISO),

      addNote: (note) =>
        set((s) => ({
          notes: [
            { ...note, id: uid("note"), createdAt: new Date().toISOString() },
            ...s.notes,
          ],
        })),

      removeNote: (id) =>
        set((s) => ({ notes: s.notes.filter((n) => n.id !== id) })),

      completeChallenge: (challengeId, xp, verifiedBy, proof) => {
        const today = todayISO();
        const already = get().completedChallenges.some(
          (c) => c.challengeId === challengeId && c.completedAt.slice(0, 10) === today,
        );
        if (already) return;
        set((s) => ({
          completedChallenges: [
            ...s.completedChallenges,
            {
              id: uid("ch"),
              challengeId,
              completedAt: new Date().toISOString(),
              verifiedBy,
              proof,
              xpAwarded: xp,
            },
          ],
          xp: s.xp + xp,
        }));
      },

      hasCompletedToday: (challengeId) => {
        const today = todayISO();
        return get().completedChallenges.some(
          (c) => c.challengeId === challengeId && c.completedAt.slice(0, 10) === today,
        );
      },

      addAssessment: (a) =>
        set((s) => ({ assessments: [...s.assessments, a] })),

      awardXp: (amount) => {
        const before = levelFromXp(get().xp);
        set((s) => ({ xp: s.xp + amount }));
        const after = levelFromXp(get().xp);
        if (after.level > before.level) {
          return { leveledUp: true, newLevelName: after.name };
        }
        return { leveledUp: false };
      },

      markNotificationShown: () =>
        set({ lastNotificationAt: new Date().toISOString() }),
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
