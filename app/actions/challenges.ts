"use server";

import { auth } from "@/auth";
import { db } from "@/db/client";
import { challengeCompletions, profiles } from "@/db/schema";
import { and, eq, gte, lte, sql } from "drizzle-orm";
import type { ChallengeResult } from "@/lib/types";

export async function listMyCompletions(): Promise<ChallengeResult[]> {
  const session = await auth();
  if (!session?.user?.id) return [];
  const rows = await db
    .select()
    .from(challengeCompletions)
    .where(eq(challengeCompletions.userId, session.user.id));
  return rows.map((r) => ({
    id: r.id,
    challengeId: r.challengeId,
    completedAt: r.completedAt.toISOString(),
    verifiedBy: r.verifiedBy,
    proof: r.proof ?? undefined,
    xpAwarded: r.xpAwarded,
  }));
}

export async function completeChallengeAction(
  challengeId: string,
  xp: number,
  verifiedBy: ChallengeResult["verifiedBy"],
  proof?: string,
): Promise<{ created: boolean; newXp: number }> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");
  const userId = session.user.id;

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const existing = await db
    .select({ id: challengeCompletions.id })
    .from(challengeCompletions)
    .where(
      and(
        eq(challengeCompletions.userId, userId),
        eq(challengeCompletions.challengeId, challengeId),
        gte(challengeCompletions.completedAt, startOfDay),
        lte(challengeCompletions.completedAt, endOfDay),
      ),
    )
    .limit(1);

  if (existing.length) {
    const [p] = await db.select({ xp: profiles.xp }).from(profiles).where(eq(profiles.userId, userId));
    return { created: false, newXp: p?.xp ?? 0 };
  }

  await db.insert(challengeCompletions).values({
    userId,
    challengeId,
    verifiedBy,
    proof,
    xpAwarded: xp,
  });

  const [updated] = await db
    .update(profiles)
    .set({ xp: sql`${profiles.xp} + ${xp}`, updatedAt: new Date() })
    .where(eq(profiles.userId, userId))
    .returning({ xp: profiles.xp });

  return { created: true, newXp: updated?.xp ?? 0 };
}
