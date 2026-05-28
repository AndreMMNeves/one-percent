import type { Tone } from "./types";

export interface ToneMessages {
  greeting: (name: string) => string;
  missedDay: string;
  goodJob: string;
  pushHarder: string;
  dietOff: string;
  dietOn: string;
  levelUp: (lvl: string) => string;
}

const TABLE: Record<Tone, ToneMessages> = {
  leve: {
    greeting: (name) => `Olá, ${name}! Vamos com calma e constância hoje.`,
    missedDay: "Tudo bem. Hoje é uma nova chance. Pequenos passos.",
    goodJob: "Você está indo bem. Continue assim, no seu ritmo.",
    pushHarder: "Talvez dê pra ir só um pouquinho além hoje. Que tal?",
    dietOff: "Sem culpa. Volte ao plano na próxima refeição.",
    dietOn: "Lindo! Sua alimentação está alinhada. Continue.",
    levelUp: (lvl) => `Parabéns! Você evoluiu para ${lvl}. Que jornada bonita.`,
  },
  normal: {
    greeting: (name) => `Bora, ${name}. Hoje é dia de execução.`,
    missedDay: "Você sumiu ontem. Hoje compensa. Vamos.",
    goodJob: "Bom trabalho. Mantém o ritmo, não solta.",
    pushHarder: "Você consegue mais. Aumenta a pegada.",
    dietOff: "Saiu da dieta. Ajusta a próxima refeição e segue.",
    dietOn: "Dieta em dia. Esse é o caminho.",
    levelUp: (lvl) => `LEVEL UP! Agora você é ${lvl}. Continua subindo.`,
  },
  agressivo: {
    greeting: (name) => `${name}, levanta dessa cadeira e mostra o que tu vale.`,
    missedDay: "Você fugiu ontem como um covarde. Hoje paga em dobro.",
    goodJob: "Ok, fez o básico. Mas isso não é desculpa pra relaxar amanhã.",
    pushHarder: "Isso é tudo que você tem? Vamos, mais. Sem manha.",
    dietOff: "Comeu porcaria, né? Para de sabotar seu próprio objetivo.",
    dietOn: "Dieta cumprida. Continua nessa pegada ou volta pro buraco.",
    levelUp: (lvl) => `LEVEL UP, GUERREIRO! ${lvl}. Não relaxa, isso é só o começo.`,
  },
};

export function messages(tone: Tone): ToneMessages {
  return TABLE[tone];
}

export function toneAdjective(tone: Tone): string {
  return { leve: "leve", normal: "motivacional", agressivo: "intenso" }[tone];
}
