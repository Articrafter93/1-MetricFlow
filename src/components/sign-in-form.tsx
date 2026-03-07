"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";

export function SignInForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("owner@metricflow.dev");
  const [password, setPassword] = useState("Demo12345!");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const invite = searchParams.get("invite");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const callbackUrl = invite ? `/dashboard?invite=${invite}` : "/dashboard";
    const result = await signIn("credentials", {
      email,
      password,
      callbackUrl,
      redirect: false,
    });

    setLoading(false);

    if (!result || result.error) {
      setError("Credenciales invalidas.");
      return;
    }

    window.location.href = result.url ?? callbackUrl;
  }

  return (
    <div className="glass-panel mx-auto w-full max-w-md p-6">
      <h1 className="text-2xl font-semibold tracking-tight">MetricFlow</h1>
      <p className="mt-2 text-sm text-slate-400">
        Accede a tu workspace multi-tenant con aislamiento de datos por agencia.
      </p>

      {invite ? (
        <p className="mt-4 rounded-lg border border-cyan-400/40 bg-cyan-500/10 p-3 text-sm text-cyan-200">
          Invitacion detectada. Al entrar, se intentara vincular este usuario al workspace.
        </p>
      ) : null}

      <form className="mt-5 space-y-4" onSubmit={onSubmit}>
        <label className="block text-sm text-slate-300">
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 outline-none transition focus:border-cyan-400/70"
          />
        </label>
        <label className="block text-sm text-slate-300">
          Password
          <input
            type="password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 outline-none transition focus:border-cyan-400/70"
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg border border-cyan-400/60 bg-cyan-500/20 px-3 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-500/30 disabled:cursor-not-allowed disabled:border-slate-700 disabled:bg-slate-900 disabled:text-slate-500"
        >
          {loading ? "Ingresando..." : "Ingresar"}
        </button>
      </form>

      {error ? <p className="mt-3 text-sm text-rose-300">{error}</p> : null}

      <div className="mt-6 rounded-lg border border-slate-800 bg-slate-950/60 p-3 text-xs text-slate-400">
        <p>Demo users:</p>
        <p>`owner@metricflow.dev` / `Demo12345!`</p>
        <p>`manager@metricflow.dev` / `Demo12345!`</p>
        <p>`client@metricflow.dev` / `Demo12345!`</p>
        <p className="mt-2">
          Al continuar aceptas nuestra{" "}
          <Link href="/privacidad" className="text-cyan-300 underline underline-offset-2">
            politica de privacidad
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
