# One Percent

> 1% melhor todo dia. Sistema completo de desenvolvimento pessoal — corpo, mente e espírito.

Aplicação web (Next.js + TypeScript + Tailwind) para acompanhar metas físicas, dieta, treino, saúde mental e crescimento espiritual. Funciona offline (dados em `localStorage` do navegador). Sem cadastro em servidor — seu progresso fica no seu dispositivo.

## Funcionalidades

- **Cadastro completo**: nome, idade, sexo, altura, peso, nível de atividade, objetivo e tom de comunicação.
- **Cálculos automáticos**: IMC, BMR, TDEE, calorias-alvo, meta de proteína, meta de água, % de gordura corporal (Navy method).
- **Diário diário**: peso, treino, passos, sono, humor e refeições. O sistema avalia se a dieta está alinhada à meta.
- **Gráficos de progresso**: peso, calorias, passos e XP nos últimos 14 dias.
- **Sistema de 50 níveis** com nomes inspirados em ficção (Iniciante → Vagabundo → Samurai → Saiyajin → All Might → One Above All).
- **Desafios verificados**:
  - **Geolocalização** (GPS) — ex.: corrida ao ar livre.
  - **Passos** — usuário informa, validado contra meta.
  - **Timer** — meditação, leitura, jejum.
  - **Manual** — banho gelado, sem açúcar, etc.
- **Frases motivacionais** — Arnold, Goggins, Coleman, anime (Naruto, Goku, All Might, Erwin Smith, Kamina), filósofos estoicos.
- **Notas**: ideias, reflexões, planos.
- **Espiritual**: versículo do dia, pergunta para meditação, registro de estudo bíblico.
- **Autoavaliação**: físico, mental, espiritual, energia, foco → sugestões personalizadas.
- **Tom ajustável** (leve / normal / agressivo): todas as mensagens, notificações e cobranças seguem o tom escolhido.
- **Notificações** dentro do app (e nativas do navegador, opcional) quando você perde o foco.

## Como rodar

```bash
# 1. Instale as dependências
npm install

# 2. Inicie o servidor de desenvolvimento
npm run dev

# 3. Abra http://localhost:3000
```

Na primeira visita você é levado ao **/cadastro** para preencher o perfil. Depois, todas as outras páginas ficam liberadas.

### Build de produção

```bash
npm run build
npm run start
```

## Stack

- [Next.js 15](https://nextjs.org/) — App Router
- React 19 + TypeScript
- Tailwind CSS
- Zustand (estado + persistência em `localStorage`)
- Recharts (gráficos)
- Lucide (ícones)

## Estrutura

```
app/
  cadastro/         onboarding multi-step
  page.tsx          dashboard
  diario/           registro diário + avaliação de dieta
  desafios/         desafios verificados (GPS, passos, timer, manual)
  progresso/        gráficos e mapa de níveis
  avaliacao/        autoavaliação + sugestões personalizadas
  notas/            ideias / reflexões / planos
  espiritual/       versículo do dia + reflexões
  configuracoes/    perfil, tom, notificações, reset

components/
  sidebar.tsx               navegação + nível
  onboarding-gate.tsx       redireciona quando não há perfil
  notifications-host.tsx    alertas de perda de foco
  quote-banner.tsx          frase do dia
  stat-card.tsx, page-header.tsx

lib/
  store.ts          zustand + persist
  types.ts          domínio
  calculations.ts   IMC, BMR, TDEE, gordura corporal
  levels.ts         50 níveis com nomes de ficção
  quotes.ts         catálogo de citações
  tone.ts           variações de tom
  challenges.ts     catálogo de desafios
  utils.ts          helpers
```

## Próximos passos (sugeridos)

- Sincronização opcional (Supabase, Vercel KV) para multi-dispositivo.
- Integração com smartwatch (Google Fit / Apple Health).
- IA para análise de dieta a partir de texto livre.
- Cursos e planos de treino integrados.
- Modo família / grupo (ranking entre amigos).

---

Feito com fogo. 🔥
