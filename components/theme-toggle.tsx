"use client";

import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "./theme-provider";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const options: { value: "light" | "dark" | "system"; icon: React.ReactNode; label: string }[] = [
    { value: "light", icon: <Sun className="w-3.5 h-3.5" />, label: "Claro" },
    { value: "dark", icon: <Moon className="w-3.5 h-3.5" />, label: "Escuro" },
    { value: "system", icon: <Monitor className="w-3.5 h-3.5" />, label: "Auto" },
  ];

  return (
    <div className="inline-flex items-center rounded-lg p-0.5 gap-0.5 bg-card border border-border">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => setTheme(o.value)}
          title={o.label}
          className={`flex items-center justify-center w-7 h-7 rounded-md transition ${
            theme === o.value
              ? "bg-accent text-accent-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {o.icon}
        </button>
      ))}
    </div>
  );
}
