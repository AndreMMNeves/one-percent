"use server";

import { auth } from "@/auth";
import { db } from "@/db/client";
import { dailyLogs } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import type { DailyLog } from "@/lib/types";

export async function listMyLogs(): Promise<DailyLog[]> {
  const session = await auth();
  if (!session?.user?.id) return [];
  const rows = await db
    .select()
    .from(dailyLogs)
    .where(eq(dailyLogs.userId, session.user.id));
  return rows
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
      mood: (r.mood ?? undefined) as DailyLog["mood"],
      diet: r.diet ?? undefined,
      followedPlan: r.followedPlan ?? undefined,
      notes: r.notes ?? undefined,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export async function upsertLogAction(log: DailyLog): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");
  const userId = session.user.id;

  const existing = await db
    .select()
    .from(dailyLogs)
    .where(and(eq(dailyLogs.userId, userId), eq(dailyLogs.date, log.date)))
    .limit(1);

  const merged = {
    userId,
    date: log.date,
    weightKg: log.weightKg ?? existing[0]?.weightKg ?? null,
    workoutMinutes: log.workoutMinutes ?? existing[0]?.workoutMinutes ?? null,
    workoutType: log.workoutType ?? existing[0]?.workoutType ?? null,
    steps: log.steps ?? existing[0]?.steps ?? null,
    caloriesIn: log.caloriesIn ?? existing[0]?.caloriesIn ?? null,
    proteinG: log.proteinG ?? existing[0]?.proteinG ?? null,
    waterMl: log.waterMl ?? existing[0]?.waterMl ?? null,
    sleepHours: log.sleepHours ?? existing[0]?.sleepHours ?? null,
    mood: log.mood ?? existing[0]?.mood ?? null,
    diet: log.diet ?? existing[0]?.diet ?? null,
    followedPlan: log.followedPlan ?? existing[0]?.followedPlan ?? null,
    notes: log.notes ?? existing[0]?.notes ?? null,
    updatedAt: new Date(),
  };

  await db
    .insert(dailyLogs)
    .values(merged)
    .onConflictDoUpdate({
      target: [dailyLogs.userId, dailyLogs.date],
      set: {
        weightKg: merged.weightKg,
        workoutMinutes: merged.workoutMinutes,
        workoutType: merged.workoutType,
        steps: merged.steps,
        caloriesIn: merged.caloriesIn,
        proteinG: merged.proteinG,
        waterMl: merged.waterMl,
        sleepHours: merged.sleepHours,
        mood: merged.mood,
        diet: merged.diet,
        followedPlan: merged.followedPlan,
        notes: merged.notes,
        updatedAt: merged.updatedAt,
      },
    });
}
