"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";

export function SignInForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [magicState, setMagicState] = useState<string | null>(null);

  const invite = searchParams.get("invite");
  const callbackUrl = invite ? `/invite/${invite}?accept=1` : "/app-redirect";

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMagicState(null);

    if (!privacyConsent) {
      setError("Debes aceptar la politica de privacidad para continuar.");
      return;
    }

    setLoading(true);

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

  async function requestMagicLink() {
    setError(null);

    if (!privacyConsent) {
      setMagicState("Debes aceptar la politica de privacidad antes de solicitar acceso.");
      return;
    }

    if (!email) {
      setMagicState("Escribe primero tu email para recibir el acceso.");
      return;
    }

    setMagicState("Enviando magic link...");
    const result = await signIn("email", {
      email,
      callbackUrl,
      redirect: false,
    });

    if (!result || result.error) {
      setMagicState("No fue posible enviar el magic link. Verifica SMTP.");
      return;
    }

    setMagicState("Magic link enviado. Revisa tu bandeja de entrada.");
  }

  return (
    <div className="glass-panel mx-auto w-full max-w-md p-6">
      <Link href="/" className="text-xs font-semibold uppercase tracking-[0.18em] text-text-secondary">
        Volver al inicio
      </Link>
      <h1 className="text-2xl font-semibold tracking-tight">MetricFlow</h1>
      <p className="mt-2 text-sm text-text-secondary">
        Accede a tu workspace multi-tenant con aislamiento de datos por agencia.
      </p>

      {invite ? (
        <p className="mt-4 rounded-lg border border-accent/50 bg-accent/10 p-3 text-sm text-text-primary">
          Invitacion detectada. Al entrar, se intentara vincular este usuario al workspace.
        </p>
      ) : null}

      <form className="mt-5 space-y-4" onSubmit={onSubmit}>
        <label className="block text-sm text-text-primary">
          Email
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-1 w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 outline-none transition focus:border-accent"
          />
        </label>
        <label className="block text-sm text-text-primary">
          Password
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-1 w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 outline-none transition focus:border-accent"
          />
        </label>

        <label className="flex items-start gap-2 rounded-lg border border-border bg-bg-elevated p-3 text-sm text-text-primary">
          <input
            type="checkbox"
            required
            checked={privacyConsent}
            onChange={(event) => setPrivacyConsent(event.target.checked)}
            className="mt-0.5 h-4 w-4 accent-accent"
          />
          <span>
            Confirmo que autorizo el tratamiento de mi email y datos de acceso segun la{" "}
            <Link href="/privacidad" className="text-accent underline underline-offset-2">
              politica de privacidad
            </Link>
            .
          </span>
        </label>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg border border-accent bg-accent/15 px-3 py-2 text-sm font-semibold text-text-primary transition hover:bg-accent/25 disabled:cursor-not-allowed disabled:border-border disabled:bg-bg-elevated disabled:text-text-secondary"
        >
          {loading ? "Ingresando..." : "Ingresar"}
        </button>
      </form>

      <button
        type="button"
        onClick={requestMagicLink}
        className="mt-3 w-full rounded-lg border border-border bg-bg-surface px-3 py-2 text-sm text-text-primary transition hover:border-accent"
      >
        Enviar magic link
      </button>

      {error ? <p className="mt-3 text-sm text-danger">{error}</p> : null}
      {magicState ? <p className="mt-2 text-sm text-text-secondary">{magicState}</p> : null}
    </div>
  );
}
