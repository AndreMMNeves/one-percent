export type Tone = "leve" | "normal" | "agressivo";

export type Goal =
  | "perder_gordura"
  | "ganhar_massa"
  | "manter_peso"
  | "saude_geral"
  | "performance";

export type Sex = "masculino" | "feminino";

export type ActivityLevel =
  | "sedentario"
  | "leve"
  | "moderado"
  | "intenso"
  | "atleta";

export interface UserProfile {
  name: string;
  age: number;
  sex: Sex;
  heightCm: number;
  weightKg: number;
  bodyFatPct?: number;
  waistCm?: number;
  neckCm?: number;
  hipCm?: number;
  activity: ActivityLevel;
  goal: Goal;
  tone: Tone;
  createdAt: string;
}

export interface DailyLog {
  date: string; // yyyy-MM-dd
  weightKg?: number;
  workoutMinutes?: number;
  workoutType?: string;
  steps?: number;
  caloriesIn?: number;
  proteinG?: number;
  waterMl?: number;
  sleepHours?: number;
  mood?: 1 | 2 | 3 | 4 | 5;
  diet?: string;
  followedPlan?: boolean;
  notes?: string;
}

export interface Note {
  id: string;
  createdAt: string;
  title: string;
  body: string;
  category: "ideia" | "reflexao" | "plano" | "espiritual";
}

export interface ChallengeResult {
  id: string;
  challengeId: string;
  completedAt: string;
  verifiedBy: "auto" | "geolocation" | "manual";
  proof?: string;
  xpAwarded: number;
}

export interface Assessment {
  date: string;
  physical: number; // 1-10
  mental: number; // 1-10
  spiritual: number; // 1-10
  energy: number; // 1-10
  focus: number; // 1-10
  notes?: string;
}

export interface AppState {
  profile?: UserProfile;
  xp: number;
  logs: DailyLog[];
  notes: Note[];
  completedChallenges: ChallengeResult[];
  assessments: Assessment[];
  lastNotificationAt?: string;
  hydrated: boolean;
}
