"use client";

import Link from "next/link";
import { useState } from "react";
import type { Role } from "@prisma/client";
import { ROLE_LABELS } from "@/lib/roles";

type TeamMember = {
  id: string;
  name: string | null;
  email: string | null;
  role: Role;
};

type TeamSettingsProps = {
  currentRole: Role;
  members: TeamMember[];
};

export function TeamSettings({ currentRole, members }: TeamSettingsProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("MANAGER");
  const [sendEmail, setSendEmail] = useState(false);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const canInvite = currentRole === "OWNER";

  async function onInviteSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("Creando invitacion...");
    setInviteUrl(null);

    const response = await fetch("/api/team/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, role, sendEmail }),
    });

    const json = (await response.json()) as
      | { inviteUrl: string; sentEmail: boolean }
      | { error: string };

    if (!response.ok || !("inviteUrl" in json)) {
      setStatus(("error" in json && json.error) || "No fue posible generar la invitacion.");
      return;
    }

    setInviteUrl(json.inviteUrl);
    setStatus(
      json.sentEmail
        ? "Invitacion enviada por email y link generado."
        : "Invitacion creada. Comparte el link magico.",
    );
    setEmail("");
  }

  return (
    <section className="space-y-6">
      <div className="glass-panel p-4">
        <h2 className="text-lg font-semibold">Configuracion de Equipo</h2>
        <p className="mt-1 text-sm text-slate-400">
          Solo el Owner puede invitar y definir roles.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
        <div className="glass-panel p-4">
          <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-300">
            Miembros activos
          </h3>
          <div className="mt-4 space-y-3">
            {members.map((member) => (
              <article
                key={member.id}
                className="rounded-xl border border-slate-800 bg-slate-900/60 p-3"
              >
                <p className="font-medium">{member.name ?? "Sin nombre"}</p>
                <p className="text-sm text-slate-400">{member.email ?? "Sin email"}</p>
                <p className="mt-1 text-xs text-cyan-300">{ROLE_LABELS[member.role]}</p>
              </article>
            ))}
          </div>
        </div>

        <form className="glass-panel space-y-4 p-4" onSubmit={onInviteSubmit}>
          <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-300">
            Invitar miembro
          </h3>
          {!canInvite ? (
            <p className="rounded-lg border border-amber-400/50 bg-amber-500/10 p-3 text-sm text-amber-200">
              Tu rol no tiene permisos para generar invitaciones.
            </p>
          ) : null}

          <label className="block text-sm text-slate-300">
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 outline-none transition focus:border-cyan-400/70"
              placeholder="nuevo-miembro@agencia.com"
              disabled={!canInvite}
            />
          </label>

          <label className="block text-sm text-slate-300">
            Rol
            <select
              value={role}
              onChange={(event) => setRole(event.target.value as Role)}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 outline-none transition focus:border-cyan-400/70"
              disabled={!canInvite}
            >
              <option value="MANAGER">Manager</option>
              <option value="CLIENT">Client</option>
            </select>
          </label>

          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={sendEmail}
              onChange={(event) => setSendEmail(event.target.checked)}
              className="h-4 w-4 accent-cyan-400"
              disabled={!canInvite}
            />
            Enviar tambien por email (SMTP)
          </label>

          <button
            type="submit"
            disabled={!canInvite}
            className="w-full rounded-lg border border-cyan-400/60 bg-cyan-500/20 px-3 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-500/30 disabled:cursor-not-allowed disabled:border-slate-700 disabled:bg-slate-900 disabled:text-slate-500"
          >
            Generar invitacion
          </button>

          <p className="text-xs text-slate-400">
            El email invitado se procesa segun la{" "}
            <Link href="/privacidad" className="text-cyan-300 underline underline-offset-2">
              politica de privacidad
            </Link>
            .
          </p>

          {status ? <p className="text-sm text-slate-300">{status}</p> : null}
          {inviteUrl ? (
            <div className="rounded-lg border border-slate-700 bg-slate-950/80 p-3 text-xs text-slate-300">
              <p className="mb-2 text-slate-400">Magic link</p>
              <p className="break-all">{inviteUrl}</p>
            </div>
          ) : null}
        </form>
      </div>
    </section>
  );
}
