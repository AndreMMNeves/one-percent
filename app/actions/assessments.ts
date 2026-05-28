"use server";

import { auth } from "@/auth";
import { db } from "@/db/client";
import { assessments } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { Assessment } from "@/lib/types";

export async function listMyAssessments(): Promise<Assessment[]> {
  const session = await auth();
  if (!session?.user?.id) return [];
  const rows = await db
    .select()
    .from(assessments)
    .where(eq(assessments.userId, session.user.id));
  return rows
    .map((r) => ({
      date: r.date,
      physical: r.physical,
      mental: r.mental,
      spiritual: r.spiritual,
      energy: r.energy,
      focus: r.focus,
      notes: r.notes ?? undefined,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export async function addAssessmentAction(a: Assessment): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");
  await db.insert(assessments).values({
    userId: session.user.id,
    date: a.date,
    physical: a.physical,
    mental: a.mental,
    spiritual: a.spiritual,
    energy: a.energy,
    focus: a.focus,
    notes: a.notes,
  });
}
