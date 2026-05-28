import type { Tone } from "./types";

export interface Quote {
  text: string;
  author: string;
  source: "anime" | "coach" | "bodybuilder" | "filosofo" | "atleta";
}

export const QUOTES: Quote[] = [
  // Bodybuilders / atletas
  { text: "A dor que você sente hoje é a força que você terá amanhã.", author: "Arnold Schwarzenegger", source: "bodybuilder" },
  { text: "Você precisa querer ser melhor do que era ontem.", author: "Arnold Schwarzenegger", source: "bodybuilder" },
  { text: "Light weight, baby!", author: "Ronnie Coleman", source: "bodybuilder" },
  { text: "Todo mundo quer ser bodybuilder, mas ninguém quer levantar peso pesado.", author: "Ronnie Coleman", source: "bodybuilder" },
  { text: "Não pare quando estiver cansado. Pare quando terminar.", author: "David Goggins", source: "atleta" },
  { text: "Você nunca está realmente acabado. Você só está começando.", author: "David Goggins", source: "atleta" },
  { text: "A maioria das pessoas que falham nos seus sonhos não falha por falta de habilidade. Falha por falta de comprometimento.", author: "Zig Ziglar", source: "coach" },

  // Coaches / filósofos
  { text: "Disciplina é a ponte entre metas e realizações.", author: "Jim Rohn", source: "coach" },
  { text: "Sucesso é a soma de pequenos esforços repetidos dia após dia.", author: "Robert Collier", source: "coach" },
  { text: "Não há vento favorável para o marinheiro que não sabe aonde ir.", author: "Sêneca", source: "filosofo" },
  { text: "Conheça-te a ti mesmo.", author: "Sócrates", source: "filosofo" },
  { text: "O obstáculo é o caminho.", author: "Marco Aurélio", source: "filosofo" },
  { text: "Você não controla o que acontece. Controla como reage.", author: "Epicteto", source: "filosofo" },

  // Animes
  { text: "Vá além! Plus Ultra!", author: "All Might — My Hero Academia", source: "anime" },
  { text: "Se você não arriscar sua vida, não pode criar um futuro.", author: "Monkey D. Luffy — One Piece", source: "anime" },
  { text: "Acreditar em si mesmo é o primeiro passo para superar qualquer obstáculo.", author: "Naruto Uzumaki — Naruto", source: "anime" },
  { text: "O fraco não pode escolher como morre. Mas pode escolher como luta.", author: "Erwin Smith — Attack on Titan", source: "anime" },
  { text: "Lutem! Lutem! Lutem!", author: "Erwin Smith — Attack on Titan", source: "anime" },
  { text: "Quem é você para me dizer que é impossível?", author: "Kamina — Gurren Lagann", source: "anime" },
  { text: "Não fure ninguém na frente! Fure os céus!", author: "Kamina — Gurren Lagann", source: "anime" },
  { text: "Mesmo que eu morra mil vezes, eu vou continuar tentando.", author: "Goku — Dragon Ball", source: "anime" },
  { text: "O treino árduo é a única coisa que importa quando se trata de força.", author: "Saitama — One Punch Man", source: "anime" },
  { text: "Aquele que controla a respiração, controla a própria vida.", author: "Demon Slayer", source: "anime" },
  { text: "A força não vem da capacidade física. Vem de uma vontade indomável.", author: "Mahatma Gandhi", source: "filosofo" },
  { text: "O que importa não é o tamanho do cão na luta, mas o tamanho da luta no cão.", author: "Mark Twain", source: "filosofo" },
  { text: "Mesmo se eu cair sete vezes, vou me levantar oito.", author: "Provérbio Japonês", source: "filosofo" },
];

const HARSH_BY_TONE: Record<Tone, string[]> = {
  leve: [
    "Tudo bem se for devagar. O importante é não parar.",
    "Cada passo é progresso, mesmo o menor deles.",
    "Você está fazendo melhor do que pensa.",
    "Respire fundo. Você consegue.",
    "Hoje é um bom dia para um pequeno passo adiante.",
  ],
  normal: [
    "Bora. Você sabe o que tem que fazer.",
    "Disciplina hoje, liberdade amanhã.",
    "1% melhor todo dia. Faça acontecer.",
    "Sem desculpas. Só execução.",
    "Conforto é o cemitério dos sonhos. Levanta.",
  ],
  agressivo: [
    "Para de chorar e treina. Ninguém vai fazer por você.",
    "Você prometeu mudança. Cumpra ou cala a boca.",
    "Conforto é veneno. Desconforto é remédio. Engula.",
    "Toda vez que você desiste, alguém te ultrapassa. Bora.",
    "Não existe motivação. Existe disciplina. Mexe-se.",
  ],
};

export function quoteOfTheDay(tone: Tone, seed = new Date().toDateString()): Quote {
  const hash = [...seed].reduce((a, c) => a + c.charCodeAt(0), 0);
  const base = QUOTES[hash % QUOTES.length];
  // 50% chance to return a tone-pushed message instead
  if (hash % 2 === 0) {
    const arr = HARSH_BY_TONE[tone];
    const t = arr[hash % arr.length];
    return { text: t, author: "One Percent", source: "coach" };
  }
  return base;
}

export function randomQuote(): Quote {
  return QUOTES[Math.floor(Math.random() * QUOTES.length)];
}
