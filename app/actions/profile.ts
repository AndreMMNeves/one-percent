"use server";

import { auth } from "@/auth";
import { db } from "@/db/client";
import { profiles, type SelectProfile } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { UserProfile } from "@/lib/types";

function toUserProfile(row: SelectProfile): UserProfile {
  return {
    name: row.name,
    age: row.age,
    sex: row.sex,
    heightCm: row.heightCm,
    weightKg: row.weightKg,
    bodyFatPct: row.bodyFatPct ?? undefined,
    waistCm: row.waistCm ?? undefined,
    neckCm: row.neckCm ?? undefined,
    hipCm: row.hipCm ?? undefined,
    activity: row.activity,
    goal: row.goal,
    tone: row.tone,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function getMyProfile(): Promise<{ profile?: UserProfile; xp: number } | null> {
  const session = await auth();
  if (!session?.user?.id) return null;
  const [row] = await db.select().from(profiles).where(eq(profiles.userId, session.user.id));
  if (!row) return { xp: 0 };
  return { profile: toUserProfile(row), xp: row.xp };
}

export async function upsertProfile(p: UserProfile): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");
  const userId = session.user.id;
  await db
    .insert(profiles)
    .values({
      userId,
      name: p.name,
      age: p.age,
      sex: p.sex,
      heightCm: p.heightCm,
      weightKg: p.weightKg,
      bodyFatPct: p.bodyFatPct,
      waistCm: p.waistCm,
      neckCm: p.neckCm,
      hipCm: p.hipCm,
      activity: p.activity,
      goal: p.goal,
      tone: p.tone,
      xp: 0,
    })
    .onConflictDoUpdate({
      target: profiles.userId,
      set: {
        name: p.name,
        age: p.age,
        sex: p.sex,
        heightCm: p.heightCm,
        weightKg: p.weightKg,
        bodyFatPct: p.bodyFatPct,
        waistCm: p.waistCm,
        neckCm: p.neckCm,
        hipCm: p.hipCm,
        activity: p.activity,
        goal: p.goal,
        tone: p.tone,
        updatedAt: new Date(),
      },
    });
}

export async function setXp(xp: number): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");
  await db
    .update(profiles)
    .set({ xp, updatedAt: new Date() })
    .where(eq(profiles.userId, session.user.id));
}
