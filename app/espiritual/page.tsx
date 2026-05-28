"use client";

import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { PageHeader } from "@/components/page-header";
import { Sparkles, BookOpen, Plus, Trash2 } from "lucide-react";

const VERSES = [
  { ref: "Filipenses 4:13", text: "Posso todas as coisas naquele que me fortalece." },
  { ref: "Provérbios 3:5-6", text: "Confia no Senhor de todo o teu coração e não te estribes no teu próprio entendimento." },
  { ref: "Isaías 40:31", text: "Os que esperam no Senhor renovarão as suas forças, subirão com asas como águias." },
  { ref: "Salmo 23:1", text: "O Senhor é o meu pastor, nada me faltará." },
  { ref: "Romanos 8:28", text: "Todas as coisas cooperam para o bem daqueles que amam a Deus." },
  { ref: "Josué 1:9", text: "Sê forte e corajoso; não temas, nem te espantes, porque o Senhor teu Deus é contigo." },
  { ref: "1 Coríntios 9:24", text: "Não sabeis vós que os que correm no estádio, todos, na verdade, correm, mas um só leva o prêmio? Correi de tal maneira que o alcanceis." },
  { ref: "2 Timóteo 4:7", text: "Combati o bom combate, acabei a carreira, guardei a fé." },
  { ref: "Mateus 6:33", text: "Buscai primeiro o reino de Deus e a sua justiça, e todas estas coisas vos serão acrescentadas." },
  { ref: "Tiago 1:12", text: "Bem-aventurado o varão que sofre a tentação; porque, quando for provado, receberá a coroa da vida." },
];

const REFLECTIONS = [
  "Em que área da minha vida preciso confiar mais em Deus?",
  "Que hábito não condiz com quem eu quero me tornar?",
  "Por quem posso interceder hoje?",
  "Como Deus tem me sustentado nessa fase?",
  "Qual virtude preciso cultivar mais essa semana?",
  "Estou guardando o coração e a mente do que entra em mim (mídia, conversas, redes)?",
  "Que pequeno ato de amor posso fazer hoje sem ninguém ver?",
];

export default function EspiritualPage() {
  const notes = useStore((s) => s.notes);
  const addNote = useStore((s) => s.addNote);
  const removeNote = useStore((s) => s.removeNote);

  const verseToday = useMemo(() => {
    const idx = new Date().getDate() % VERSES.length;
    return VERSES[idx];
  }, []);
  const reflectionToday = useMemo(() => {
    const idx = new Date().getDate() % REFLECTIONS.length;
    return REFLECTIONS[idx];
  }, []);

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const spiritualNotes = notes.filter((n) => n.category === "espiritual");

  function submit() {
    if (!title.trim() && !body.trim()) return;
    addNote({
      title: title.trim() || "(sem título)",
      body: body.trim(),
      category: "espiritual",
    });
    setTitle("");
    setBody("");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Espiritual"
        subtitle="Estudo, fé e reflexão. O corpo treina, a alma também."
      />

      <div className="card border-accent/20">
        <div className="flex items-center gap-2 text-xs text-muted uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5 text-accent" />
          Versículo do dia
        </div>
        <p className="text-lg leading-snug">&ldquo;{verseToday.text}&rdquo;</p>
        <div className="text-sm text-accent mt-2 font-semibold">{verseToday.ref}</div>
      </div>

      <div className="card">
        <div className="flex items-center gap-2 text-xs text-muted uppercase tracking-wider mb-2">
          <BookOpen className="w-3.5 h-3.5" />
          Pergunta para meditação
        </div>
        <p className="text-base text-foreground">{reflectionToday}</p>
      </div>

      <div className="card space-y-3">
        <h3 className="heading text-xl">Registrar reflexão / estudo</h3>
        <input
          className="field"
          placeholder="Tema / passagem"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          className="field min-h-[140px]"
          placeholder="O que Deus tem falado com você hoje?"
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
        <div className="flex justify-end">
          <button onClick={submit} className="btn-primary">
            <Plus className="w-4 h-4" /> Salvar
          </button>
        </div>
      </div>

      <div>
        <h3 className="heading text-xl mb-3">Suas reflexões</h3>
        {spiritualNotes.length === 0 ? (
          <div className="text-sm text-muted">Nenhuma reflexão ainda.</div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {spiritualNotes.map((n) => (
              <div key={n.id} className="card">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-xs text-muted">
                    {new Date(n.createdAt).toLocaleDateString("pt-BR")}
                  </div>
                  <button
                    onClick={() => removeNote(n.id)}
                    className="text-muted hover:text-bad"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="font-semibold mt-1">{n.title}</div>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap mt-1">{n.body}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
