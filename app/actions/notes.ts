"use server";

import { auth } from "@/auth";
import { db } from "@/db/client";
import { notes } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import type { Note } from "@/lib/types";

export async function listMyNotes(): Promise<Note[]> {
  const session = await auth();
  if (!session?.user?.id) return [];
  const rows = await db.select().from(notes).where(eq(notes.userId, session.user.id));
  return rows
    .map((r) => ({
      id: r.id,
      title: r.title,
      body: r.body,
      category: r.category,
      createdAt: r.createdAt.toISOString(),
    }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function addNoteAction(input: Omit<Note, "id" | "createdAt">): Promise<Note> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");
  const [row] = await db
    .insert(notes)
    .values({
      userId: session.user.id,
      title: input.title,
      body: input.body,
      category: input.category,
    })
    .returning();
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    category: row.category,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function removeNoteAction(id: string): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");
  await db
    .delete(notes)
    .where(and(eq(notes.id, id), eq(notes.userId, session.user.id)));
}
