"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { PageHeader } from "@/components/page-header";
import { Plus, Trash2, Lightbulb, BookOpen, Target as TargetIcon, Sparkles } from "lucide-react";
import type { Note } from "@/lib/types";

const CATEGORIES: { key: Note["category"]; label: string; icon: typeof Lightbulb }[] = [
  { key: "ideia", label: "Ideia", icon: Lightbulb },
  { key: "reflexao", label: "Reflexão", icon: BookOpen },
  { key: "plano", label: "Plano", icon: TargetIcon },
  { key: "espiritual", label: "Espiritual", icon: Sparkles },
];

export default function NotasPage() {
  const notes = useStore((s) => s.notes);
  const addNote = useStore((s) => s.addNote);
  const removeNote = useStore((s) => s.removeNote);

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState<Note["category"]>("ideia");
  const [filter, setFilter] = useState<"todas" | Note["category"]>("todas");

  function submit() {
    if (!title.trim() && !body.trim()) return;
    addNote({ title: title.trim() || "(sem título)", body: body.trim(), category });
    setTitle("");
    setBody("");
  }

  const visible = notes.filter((n) => filter === "todas" || n.category === filter);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notas"
        subtitle="Ideias, reflexões e planos. Sua mente externa."
      />

      <div className="card space-y-3">
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map((c) => {
            const Icon = c.icon;
            return (
              <button
                key={c.key}
                onClick={() => setCategory(c.key)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                  category === c.key
                    ? "bg-accent text-accent-foreground"
                    : "bg-card-hover text-muted-foreground hover:bg-card-hover"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {c.label}
              </button>
            );
          })}
        </div>
        <input
          className="field"
          placeholder="Título"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          className="field min-h-[120px]"
          placeholder="Escreva aqui..."
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
        <div className="flex justify-end">
          <button onClick={submit} className="btn-primary">
            <Plus className="w-4 h-4" /> Adicionar
          </button>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilter("todas")}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
            filter === "todas" ? "bg-accent text-accent-foreground" : "bg-card-hover text-muted-foreground"
          }`}
        >
          Todas ({notes.length})
        </button>
        {CATEGORIES.map((c) => {
          const count = notes.filter((n) => n.category === c.key).length;
          return (
            <button
              key={c.key}
              onClick={() => setFilter(c.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                filter === c.key ? "bg-accent text-accent-foreground" : "bg-card-hover text-muted-foreground"
              }`}
            >
              {c.label} ({count})
            </button>
          );
        })}
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        {visible.length === 0 && (
          <div className="text-sm text-muted">Nenhuma nota ainda.</div>
        )}
        {visible.map((n) => {
          const C = CATEGORIES.find((c) => c.key === n.category)!;
          const Icon = C.icon;
          return (
            <div key={n.id} className="card">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs text-muted">
                  <Icon className="w-3.5 h-3.5" />
                  {C.label} ·{" "}
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
          );
        })}
      </div>
    </div>
  );
}
