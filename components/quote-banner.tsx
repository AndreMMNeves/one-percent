"use client";

import { Quote as QuoteIcon } from "lucide-react";
import { useStore } from "@/lib/store";
import { quoteOfTheDay } from "@/lib/quotes";
import { useMemo } from "react";

export function QuoteBanner() {
  const tone = useStore((s) => s.profile?.tone ?? "normal");
  const quote = useMemo(() => quoteOfTheDay(tone), [tone]);

  return (
    <div className="card relative overflow-hidden">
      <div className="absolute -top-6 -right-6 opacity-10">
        <QuoteIcon className="w-32 h-32 text-flame-500" />
      </div>
      <div className="relative">
        <div className="section-title mb-2">Frase do dia</div>
        <p className="text-lg leading-snug font-medium text-foreground">
          &ldquo;{quote.text}&rdquo;
        </p>
        <div className="text-sm text-muted mt-2">— {quote.author}</div>
      </div>
    </div>
  );
}
