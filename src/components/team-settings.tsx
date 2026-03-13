"use client";

import Link from "next/link";
import { useState } from "react";
import type { Role } from "@prisma/client";
import { hasPermission } from "@/lib/rbac";
import { ROLE_LABELS } from "@/lib/roles";

type TeamMember = {
  id: string;
  name: string | null;
  email: string | null;
  role: Role;
};

type TeamSettingsProps = {
  tenantSlug: string;
  currentRole: Role;
  members: TeamMember[];
};

export function TeamSettings({ tenantSlug, currentRole, members }: TeamSettingsProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("MANAGER");
  const [sendEmail, setSendEmail] = useState(false);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const canInvite = hasPermission(currentRole, "team", "invite");

  async function onInviteSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("Creando invitacion...");
    setInviteUrl(null);

    const response = await fetch(`/api/tenants/${tenantSlug}/team/invite`, {
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
        <p className="mt-1 text-sm text-text-secondary">
          Solo el Owner puede invitar y definir roles.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
        <div className="glass-panel p-4">
          <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-text-secondary">
            Miembros activos
          </h3>
          <div className="mt-4 space-y-3">
            {members.map((member) => (
              <article
                key={member.id}
                className="rounded-xl border border-border bg-bg-elevated p-3"
              >
                <p className="font-medium">{member.name ?? "Sin nombre"}</p>
                <p className="text-sm text-text-secondary">{member.email ?? "Sin email"}</p>
                <p className="mt-1 text-xs text-accent">{ROLE_LABELS[member.role]}</p>
              </article>
            ))}
          </div>
        </div>

        <form className="glass-panel space-y-4 p-4" onSubmit={onInviteSubmit}>
          <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-text-secondary">
            Invitar miembro
          </h3>
          {!canInvite ? (
            <p className="rounded-lg border border-warning/50 bg-warning/10 p-3 text-sm text-warning">
              Tu rol no tiene permisos para generar invitaciones.
            </p>
          ) : null}

          <label className="block text-sm text-text-primary">
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 outline-none transition focus:border-accent"
              placeholder="nuevo-miembro@agencia.com"
              disabled={!canInvite}
            />
          </label>

          <label className="block text-sm text-text-primary">
            Rol
            <select
              value={role}
              onChange={(event) => setRole(event.target.value as Role)}
              className="mt-1 w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 outline-none transition focus:border-accent"
              disabled={!canInvite}
            >
              <option value="MANAGER">Manager</option>
              <option value="CLIENT">Client</option>
            </select>
          </label>

          <label className="flex items-center gap-2 text-sm text-text-primary">
            <input
              type="checkbox"
              checked={sendEmail}
              onChange={(event) => setSendEmail(event.target.checked)}
              className="h-4 w-4 accent-accent"
              disabled={!canInvite}
            />
            Enviar tambien por email (SMTP)
          </label>

          <button
            type="submit"
            disabled={!canInvite}
            className="w-full rounded-lg border border-accent bg-accent/15 px-3 py-2 text-sm font-semibold text-text-primary transition hover:bg-accent/25 disabled:cursor-not-allowed disabled:border-border disabled:bg-bg-elevated disabled:text-text-secondary"
          >
            Generar invitacion
          </button>

          <p className="text-xs text-text-secondary">
            El email invitado se procesa segun la{" "}
            <Link href="/privacidad" className="text-accent underline underline-offset-2">
              politica de privacidad
            </Link>
            .
          </p>

          {status ? <p className="text-sm text-text-secondary">{status}</p> : null}
          {inviteUrl ? (
            <div className="rounded-lg border border-border bg-bg-elevated p-3 text-xs text-text-primary">
              <p className="mb-2 text-text-secondary">Magic link</p>
              <p className="break-all">{inviteUrl}</p>
            </div>
          ) : null}
        </form>
      </div>
    </section>
  );
}
