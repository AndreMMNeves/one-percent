export interface Challenge {
  id: string;
  title: string;
  description: string;
  xp: number;
  category: "fisico" | "mental" | "espiritual" | "habito" | "nutricao";
  verification: "manual" | "geolocation" | "steps" | "timer";
  target?: number; // steps, minutes, etc.
  recurrence: "diario" | "semanal" | "unico";
}

export const CHALLENGES: Challenge[] = [
  {
    id: "steps-3k",
    title: "3.000 passos",
    description: "Movimento mínimo do dia. Sem desculpas.",
    xp: 30,
    category: "fisico",
    verification: "steps",
    target: 3000,
    recurrence: "diario",
  },
  {
    id: "steps-10k",
    title: "10.000 passos",
    description: "O clássico. Caminhe até bater a meta.",
    xp: 80,
    category: "fisico",
    verification: "steps",
    target: 10000,
    recurrence: "diario",
  },
  {
    id: "workout-30",
    title: "Treino de 30 minutos",
    description: "Musculação, corrida, calistenia. O que for, mas suado.",
    xp: 60,
    category: "fisico",
    verification: "timer",
    target: 30,
    recurrence: "diario",
  },
  {
    id: "water-3l",
    title: "Beber 3L de água",
    description: "Hidrate. Seu corpo é 60% água, lembra?",
    xp: 25,
    category: "habito",
    verification: "manual",
    recurrence: "diario",
  },
  {
    id: "no-sugar",
    title: "Dia sem açúcar refinado",
    description: "Nada de doce, refrigerante ou processado adoçado.",
    xp: 70,
    category: "nutricao",
    verification: "manual",
    recurrence: "diario",
  },
  {
    id: "meditate-10",
    title: "Meditar 10 minutos",
    description: "Silêncio. Respiração. Foco no presente.",
    xp: 40,
    category: "mental",
    verification: "timer",
    target: 10,
    recurrence: "diario",
  },
  {
    id: "read-20",
    title: "Ler 20 páginas",
    description: "Alimente a mente. Ficção, técnico ou espiritual.",
    xp: 35,
    category: "mental",
    verification: "manual",
    recurrence: "diario",
  },
  {
    id: "bible-study",
    title: "Estudo bíblico (15 min)",
    description: "Leitura, reflexão e oração.",
    xp: 50,
    category: "espiritual",
    verification: "timer",
    target: 15,
    recurrence: "diario",
  },
  {
    id: "cold-shower",
    title: "Banho gelado",
    description: "Desconforto controlado fortalece a vontade.",
    xp: 45,
    category: "fisico",
    verification: "manual",
    recurrence: "diario",
  },
  {
    id: "no-screen-1h",
    title: "1h sem tela após acordar",
    description: "Comece o dia com sua mente, não com a do algoritmo.",
    xp: 35,
    category: "habito",
    verification: "manual",
    recurrence: "diario",
  },
  {
    id: "outdoor-run",
    title: "Corrida ao ar livre",
    description: "Validado por geolocalização (com sua permissão).",
    xp: 100,
    category: "fisico",
    verification: "geolocation",
    recurrence: "semanal",
  },
  {
    id: "fast-16",
    title: "Jejum de 16h",
    description: "Janela alimentar de 8h. Disciplina nutricional.",
    xp: 90,
    category: "nutricao",
    verification: "manual",
    recurrence: "semanal",
  },
];

export function challengesForToday(): Challenge[] {
  // Daily set: rotate based on day of year so it stays consistent
  const day = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000,
  );
  const daily = CHALLENGES.filter((c) => c.recurrence === "diario");
  const weekly = CHALLENGES.filter((c) => c.recurrence === "semanal");
  // pick 5 daily + 1 weekly
  const picks: Challenge[] = [];
  for (let i = 0; i < 5; i++) {
    picks.push(daily[(day + i) % daily.length]);
  }
  picks.push(weekly[day % weekly.length]);
  return picks;
}
