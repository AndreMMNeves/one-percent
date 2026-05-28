import type { ActivityLevel, Goal, Sex, UserProfile } from "./types";

export function calcBMI(weightKg: number, heightCm: number): number {
  const h = heightCm / 100;
  if (h <= 0) return 0;
  return +(weightKg / (h * h)).toFixed(1);
}

export function bmiCategory(bmi: number): {
  label: string;
  tone: "good" | "warn" | "bad";
} {
  if (bmi < 18.5) return { label: "Abaixo do peso", tone: "warn" };
  if (bmi < 25) return { label: "Peso saudável", tone: "good" };
  if (bmi < 30) return { label: "Sobrepeso", tone: "warn" };
  if (bmi < 35) return { label: "Obesidade I", tone: "bad" };
  if (bmi < 40) return { label: "Obesidade II", tone: "bad" };
  return { label: "Obesidade III", tone: "bad" };
}

// Mifflin-St Jeor
export function calcBMR(p: UserProfile): number {
  const s = p.sex === "masculino" ? 5 : -161;
  return Math.round(10 * p.weightKg + 6.25 * p.heightCm - 5 * p.age + s);
}

const ACTIVITY_FACTOR: Record<ActivityLevel, number> = {
  sedentario: 1.2,
  leve: 1.375,
  moderado: 1.55,
  intenso: 1.725,
  atleta: 1.9,
};

export function calcTDEE(p: UserProfile): number {
  return Math.round(calcBMR(p) * ACTIVITY_FACTOR[p.activity]);
}

export function calcCalorieTarget(p: UserProfile): number {
  const tdee = calcTDEE(p);
  const deltas: Record<Goal, number> = {
    perder_gordura: -500,
    ganhar_massa: +350,
    manter_peso: 0,
    saude_geral: -150,
    performance: +200,
  };
  return Math.max(1200, tdee + deltas[p.goal]);
}

export function calcProteinTargetG(p: UserProfile): number {
  const factor: Record<Goal, number> = {
    perder_gordura: 2.0,
    ganhar_massa: 2.2,
    manter_peso: 1.6,
    saude_geral: 1.4,
    performance: 2.0,
  };
  return Math.round(p.weightKg * factor[p.goal]);
}

// US Navy body fat estimate (fallback)
export function estimateBodyFatNavy(
  sex: Sex,
  heightCm: number,
  waistCm?: number,
  neckCm?: number,
  hipCm?: number,
): number | undefined {
  if (!waistCm || !neckCm) return undefined;
  const log10 = Math.log10;
  if (sex === "masculino") {
    const v = 86.01 * log10(waistCm - neckCm) - 70.041 * log10(heightCm) + 36.76;
    return +Math.max(3, Math.min(60, v)).toFixed(1);
  }
  if (!hipCm) return undefined;
  const v =
    163.205 * log10(waistCm + hipCm - neckCm) - 97.684 * log10(heightCm) - 78.387;
  return +Math.max(8, Math.min(60, v)).toFixed(1);
}

export function calcWaterTargetMl(weightKg: number): number {
  return Math.round(weightKg * 35);
}

export function activityLabel(a: ActivityLevel): string {
  return {
    sedentario: "Sedentário",
    leve: "Leve (1-3x semana)",
    moderado: "Moderado (3-5x semana)",
    intenso: "Intenso (6-7x semana)",
    atleta: "Atleta (2x ao dia)",
  }[a];
}

export function goalLabel(g: Goal): string {
  return {
    perder_gordura: "Perder gordura",
    ganhar_massa: "Ganhar massa",
    manter_peso: "Manter peso",
    saude_geral: "Saúde geral",
    performance: "Performance",
  }[g];
}
