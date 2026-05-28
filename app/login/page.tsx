"use client";

import { signIn } from "next-auth/react";
import { Flame } from "lucide-react";
import { useState } from "react";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen grid place-items-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-12 h-12 rounded-xl bg-accent grid place-items-center shadow-lg shadow-flame-500/40">
            <Flame className="w-6 h-6 text-accent-foreground" />
          </div>
          <div>
            <div className="heading text-3xl">ONE PERCENT</div>
            <div className="text-xs uppercase tracking-[0.25em] text-muted">
              entrar
            </div>
          </div>
        </div>

        <div className="card space-y-5">
          <div>
            <h1 className="heading text-2xl mb-1">Acesse sua conta</h1>
            <p className="text-sm text-muted-foreground">
              Seus dados ficam salvos na nuvem — acesse do celular ou do PC, sem perder
              o progresso.
            </p>
          </div>

          <button
            onClick={() => {
              setLoading(true);
              signIn("google", { callbackUrl: "/" });
            }}
            disabled={loading}
            className="btn-ghost w-full justify-center gap-3 py-3 disabled:opacity-50"
          >
            <GoogleLogo />
            <span>{loading ? "Conectando…" : "Continuar com Google"}</span>
          </button>

          <div className="text-xs text-muted-foreground text-center">
            Sem conta? Você consegue continuar usando localmente, mas seus dados
            ficam só nesse dispositivo.
          </div>
        </div>
      </div>
    </div>
  );
}

function GoogleLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18">
      <path
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.49h4.84a4.14 4.14 0 0 1-1.79 2.72v2.26h2.9c1.7-1.56 2.69-3.87 2.69-6.63z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.43 0 4.47-.81 5.96-2.18l-2.9-2.26c-.81.55-1.84.87-3.06.87-2.35 0-4.34-1.59-5.05-3.71H.96v2.33A9 9 0 0 0 9 18z"
        fill="#34A853"
      />
      <path
        d="M3.95 10.72A5.4 5.4 0 0 1 3.66 9c0-.6.1-1.18.29-1.72V4.95H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.05l2.99-2.33z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58A9 9 0 0 0 9 0 9 9 0 0 0 .96 4.95l2.99 2.33C4.66 5.16 6.65 3.58 9 3.58z"
        fill="#EA4335"
      />
    </svg>
  );
}
