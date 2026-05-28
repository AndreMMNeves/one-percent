"use server";

import { auth } from "@/auth";
import { db } from "@/db/client";
import { assessments, challengeCompletions, dailyLogs, notes, profiles } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import type { AppState } from "@/lib/types";

/**
 * One-shot migration: takes local Zustand state and pushes it to the DB.
 * Idempotent-ish: profile is upserted; logs are upserted by (user, date);
 * notes/completions/assessments are inserted only if no rows exist for the user.
 */
export async function syncLocalToCloud(state: AppState): Promise<{ ok: true }> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");
  const userId = session.user.id;

  if (state.profile) {
    const { createdAt: _ignored, ...profileFields } = state.profile;
    void _ignored;
    await db
      .insert(profiles)
      .values({
        userId,
        ...profileFields,
        xp: state.xp ?? 0,
      })
      .onConflictDoUpdate({
        target: profiles.userId,
        set: {
          ...profileFields,
          xp: sql`GREATEST(${profiles.xp}, ${state.xp ?? 0})`,
          updatedAt: new Date(),
        },
      });
  }

  if (state.logs?.length) {
    for (const log of state.logs) {
      await db
        .insert(dailyLogs)
        .values({ userId, ...log })
        .onConflictDoUpdate({
          target: [dailyLogs.userId, dailyLogs.date],
          set: { ...log, updatedAt: new Date() },
        });
    }
  }

  const [{ count: notesCount }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(notes)
    .where(eq(notes.userId, userId));
  if (notesCount === 0 && state.notes?.length) {
    await db.insert(notes).values(
      state.notes.map((n) => ({
        id: n.id,
        userId,
        title: n.title,
        body: n.body,
        category: n.category,
        createdAt: new Date(n.createdAt),
      })),
    );
  }

  const [{ count: compCount }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(challengeCompletions)
    .where(eq(challengeCompletions.userId, userId));
  if (compCount === 0 && state.completedChallenges?.length) {
    await db.insert(challengeCompletions).values(
      state.completedChallenges.map((c) => ({
        id: c.id,
        userId,
        challengeId: c.challengeId,
        completedAt: new Date(c.completedAt),
        verifiedBy: c.verifiedBy,
        proof: c.proof,
        xpAwarded: c.xpAwarded,
      })),
    );
  }

  const [{ count: assessCount }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(assessments)
    .where(eq(assessments.userId, userId));
  if (assessCount === 0 && state.assessments?.length) {
    await db.insert(assessments).values(
      state.assessments.map((a) => ({
        userId,
        date: a.date,
        physical: a.physical,
        mental: a.mental,
        spiritual: a.spiritual,
        energy: a.energy,
        focus: a.focus,
        notes: a.notes,
      })),
    );
  }

  return { ok: true };
}

export async function getAllMyData(): Promise<Partial<AppState>> {
  const session = await auth();
  if (!session?.user?.id) return {};
  const userId = session.user.id;

  const [profileRow] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, userId));

  const logRows = await db
    .select()
    .from(dailyLogs)
    .where(eq(dailyLogs.userId, userId));

  const noteRows = await db.select().from(notes).where(eq(notes.userId, userId));

  const compRows = await db
    .select()
    .from(challengeCompletions)
    .where(eq(challengeCompletions.userId, userId));

  const assessRows = await db
    .select()
    .from(assessments)
    .where(eq(assessments.userId, userId));

  return {
    profile: profileRow
      ? {
          name: profileRow.name,
          age: profileRow.age,
          sex: profileRow.sex,
          heightCm: profileRow.heightCm,
          weightKg: profileRow.weightKg,
          bodyFatPct: profileRow.bodyFatPct ?? undefined,
          waistCm: profileRow.waistCm ?? undefined,
          neckCm: profileRow.neckCm ?? undefined,
          hipCm: profileRow.hipCm ?? undefined,
          activity: profileRow.activity,
          goal: profileRow.goal,
          tone: profileRow.tone,
          createdAt: profileRow.createdAt.toISOString(),
        }
      : undefined,
    xp: profileRow?.xp ?? 0,
    logs: logRows
      .map((r) => ({
        date: r.date,
        weightKg: r.weightKg ?? undefined,
        workoutMinutes: r.workoutMinutes ?? undefined,
        workoutType: r.workoutType ?? undefined,
        steps: r.steps ?? undefined,
        caloriesIn: r.caloriesIn ?? undefined,
        proteinG: r.proteinG ?? undefined,
        waterMl: r.waterMl ?? undefined,
        sleepHours: r.sleepHours ?? undefined,
        mood: (r.mood ?? undefined) as 1 | 2 | 3 | 4 | 5 | undefined,
        diet: r.diet ?? undefined,
        followedPlan: r.followedPlan ?? undefined,
        notes: r.notes ?? undefined,
      }))
      .sort((a, b) => a.date.localeCompare(b.date)),
    notes: noteRows
      .map((r) => ({
        id: r.id,
        title: r.title,
        body: r.body,
        category: r.category,
        createdAt: r.createdAt.toISOString(),
      }))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    completedChallenges: compRows.map((r) => ({
      id: r.id,
      challengeId: r.challengeId,
      completedAt: r.completedAt.toISOString(),
      verifiedBy: r.verifiedBy,
      proof: r.proof ?? undefined,
      xpAwarded: r.xpAwarded,
    })),
    assessments: assessRows
      .map((r) => ({
        date: r.date,
        physical: r.physical,
        mental: r.mental,
        spiritual: r.spiritual,
        energy: r.energy,
        focus: r.focus,
        notes: r.notes ?? undefined,
      }))
      .sort((a, b) => a.date.localeCompare(b.date)),
  };
}
