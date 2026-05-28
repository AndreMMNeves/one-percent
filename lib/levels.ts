export interface LevelInfo {
  level: number;
  name: string;
  tier: "humano" | "guerreiro" | "elite" | "lendario" | "divino";
  xpRequired: number;
}

const NAMES: string[] = [
  "Iniciante",
  "Despertando",
  "Vagabundo",
  "Aprendiz",
  "Sobrevivente",
  "Guerreiro",
  "Caçador",
  "Espadachim",
  "Mercenário",
  "Cavaleiro",
  "Samurai",
  "Ninja",
  "Caçador de Sombras",
  "Goblin Slayer",
  "Berserker",
  "Templário",
  "Paladino",
  "Mago de Batalha",
  "Lobo Solitário",
  "Dragon Slayer",
  "Caçador de Demônios",
  "Hashira",
  "Senhor da Guerra",
  "Almirante",
  "Yonko",
  "Hokage",
  "Super Saiyajin",
  "Super Saiyajin 2",
  "Super Saiyajin 3",
  "Super Saiyajin Blue",
  "Ultra Instinto",
  "Herói Classe C",
  "Herói Classe B",
  "Herói Classe A",
  "Herói Classe S",
  "Super-Herói",
  "All Might",
  "Caped Baldy",
  "Soul Reaper",
  "Bankai Master",
  "Stand User",
  "Joestar",
  "Hunter Lendário",
  "Imortal",
  "Semideus",
  "Titã",
  "Deus do Aço",
  "Deus da Destruição",
  "Anjo Sagrado",
  "One Above All",
];

const COLORS: Record<LevelInfo["tier"], string> = {
  humano: "#94a3b8",
  guerreiro: "#fb923c",
  elite: "#f43f5e",
  lendario: "#a855f7",
  divino: "#fde047",
};

function tierFor(level: number): LevelInfo["tier"] {
  if (level <= 10) return "humano";
  if (level <= 25) return "guerreiro";
  if (level <= 38) return "elite";
  if (level <= 47) return "lendario";
  return "divino";
}

// Exponential curve: level n requires roughly n^1.6 * 90 XP cumulative
function xpForLevel(level: number): number {
  if (level <= 1) return 0;
  return Math.round(Math.pow(level - 1, 1.65) * 95);
}

export const LEVELS: LevelInfo[] = NAMES.map((name, i) => ({
  level: i + 1,
  name,
  tier: tierFor(i + 1),
  xpRequired: xpForLevel(i + 1),
}));

export const MAX_LEVEL = LEVELS.length;

export function levelFromXp(xp: number): LevelInfo {
  let current = LEVELS[0];
  for (const lvl of LEVELS) {
    if (xp >= lvl.xpRequired) current = lvl;
    else break;
  }
  return current;
}

export function nextLevelInfo(xp: number): { next?: LevelInfo; progressPct: number } {
  const current = levelFromXp(xp);
  const next = LEVELS[current.level]; // levels are 1-indexed, array 0-indexed
  if (!next) return { progressPct: 100 };
  const span = next.xpRequired - current.xpRequired;
  const gained = xp - current.xpRequired;
  const pct = Math.max(0, Math.min(100, Math.round((gained / span) * 100)));
  return { next, progressPct: pct };
}

export function tierColor(tier: LevelInfo["tier"]): string {
  return COLORS[tier];
}

export function tierLabel(tier: LevelInfo["tier"]): string {
  return {
    humano: "Humano",
    guerreiro: "Guerreiro",
    elite: "Elite",
    lendario: "Lendário",
    divino: "Divino",
  }[tier];
}
