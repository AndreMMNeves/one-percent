import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  icon?: LucideIcon;
  tone?: "neutral" | "good" | "warn" | "bad";
}

const TONE_STYLES = {
  neutral: "text-foreground",
  good: "text-good",
  warn: "text-warn",
  bad: "text-bad",
};

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "neutral",
}: StatCardProps) {
  return (
    <div className="card flex flex-col gap-1.5 relative overflow-hidden">
      <div className="flex items-center justify-between">
        <span className="section-title">{label}</span>
        {Icon && <Icon className="w-4 h-4 text-muted" />}
      </div>
      <div className={cn("text-3xl heading", TONE_STYLES[tone])}>{value}</div>
      {hint && <div className="text-xs text-muted">{hint}</div>}
    </div>
  );
}
