import {
  pgTable,
  text,
  timestamp,
  integer,
  real,
  boolean,
  primaryKey,
  smallint,
  jsonb,
} from "drizzle-orm/pg-core";
import type { AdapterAccount } from "next-auth/adapters";

// ============================================================
// NextAuth / Auth.js tables — required by @auth/drizzle-adapter
// ============================================================
export const users = pgTable("users", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
});

export const accounts = pgTable(
  "accounts",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccount["type"]>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (a) => [primaryKey({ columns: [a.provider, a.providerAccountId] })],
);

export const sessions = pgTable("sessions", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verificationTokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (v) => [primaryKey({ columns: [v.identifier, v.token] })],
);

// ============================================================
// Domain tables
// ============================================================

export const profiles = pgTable("profiles", {
  userId: text("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  age: smallint("age").notNull(),
  sex: text("sex").$type<"masculino" | "feminino">().notNull(),
  heightCm: real("height_cm").notNull(),
  weightKg: real("weight_kg").notNull(),
  bodyFatPct: real("body_fat_pct"),
  waistCm: real("waist_cm"),
  neckCm: real("neck_cm"),
  hipCm: real("hip_cm"),
  activity: text("activity")
    .$type<"sedentario" | "leve" | "moderado" | "intenso" | "atleta">()
    .notNull(),
  goal: text("goal")
    .$type<
      "perder_gordura" | "ganhar_massa" | "manter_peso" | "saude_geral" | "performance"
    >()
    .notNull(),
  tone: text("tone").$type<"leve" | "normal" | "agressivo">().notNull(),
  xp: integer("xp").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const dailyLogs = pgTable(
  "daily_logs",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    date: text("date").notNull(), // yyyy-MM-dd
    weightKg: real("weight_kg"),
    workoutMinutes: integer("workout_minutes"),
    workoutType: text("workout_type"),
    steps: integer("steps"),
    caloriesIn: integer("calories_in"),
    proteinG: integer("protein_g"),
    waterMl: integer("water_ml"),
    sleepHours: real("sleep_hours"),
    mood: smallint("mood"),
    diet: text("diet"),
    followedPlan: boolean("followed_plan"),
    notes: text("notes"),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.date] })],
);

export const notes = pgTable("notes", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  body: text("body").notNull(),
  category: text("category")
    .$type<"ideia" | "reflexao" | "plano" | "espiritual">()
    .notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const challengeCompletions = pgTable("challenge_completions", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  challengeId: text("challenge_id").notNull(),
  completedAt: timestamp("completed_at").notNull().defaultNow(),
  verifiedBy: text("verified_by")
    .$type<"auto" | "geolocation" | "manual">()
    .notNull(),
  proof: text("proof"),
  xpAwarded: integer("xp_awarded").notNull(),
});

export const assessments = pgTable("assessments", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  date: text("date").notNull(),
  physical: smallint("physical").notNull(),
  mental: smallint("mental").notNull(),
  spiritual: smallint("spiritual").notNull(),
  energy: smallint("energy").notNull(),
  focus: smallint("focus").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type SelectProfile = typeof profiles.$inferSelect;
export type SelectDailyLog = typeof dailyLogs.$inferSelect;
export type SelectNote = typeof notes.$inferSelect;
export type SelectCompletion = typeof challengeCompletions.$inferSelect;
export type SelectAssessment = typeof assessments.$inferSelect;
