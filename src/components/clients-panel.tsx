"use client";

import { Role } from "@prisma/client";
import { useState } from "react";

type ClientRecord = {
  id: string;
  name: string;
  timezone: string;
  createdAt: string;
};

type ClientsPanelProps = {
  tenantSlug: string;
  role: Role;
  initialClients: ClientRecord[];
};

export function ClientsPanel({ tenantSlug, role, initialClients }: ClientsPanelProps) {
  const [clients, setClients] = useState(initialClients);
  const [name, setName] = useState("");
  const [timezone, setTimezone] = useState("UTC");
  const [status, setStatus] = useState<string | null>(null);

  const canManage = role === "OWNER" || role === "MANAGER";

  async function addClient(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("Creando cliente...");

    const response = await fetch(`/api/tenants/${tenantSlug}/clients`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, timezone }),
    });

    const json = (await response.json()) as
      | { client: ClientRecord }
      | { error: string };

    if (!response.ok || !("client" in json)) {
      setStatus(("error" in json && json.error) || "No fue posible crear cliente.");
      return;
    }

    setClients((current) => [json.client, ...current]);
    setName("");
    setTimezone("UTC");
    setStatus("Cliente creado.");
  }

  return (
    <section className="space-y-4">
      <div className="glass-panel p-4">
        <h1 className="text-lg font-semibold text-text-primary">Clients</h1>
        <p className="text-sm text-text-secondary">
          Gestion de clientes asignados por tenant.
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.1fr_1fr]">
        <div className="glass-panel p-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-text-secondary">
            Lista de clientes
          </h2>
          <div className="mt-3 space-y-2">
            {clients.map((client) => (
              <article
                key={client.id}
                className="rounded-lg border border-border bg-bg-elevated p-3"
              >
                <p className="font-medium text-text-primary">{client.name}</p>
                <p className="text-xs text-text-secondary">{client.timezone}</p>
              </article>
            ))}
          </div>
        </div>

        <form className="glass-panel space-y-3 p-4" onSubmit={addClient}>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-text-secondary">
            Nuevo cliente
          </h2>
          <label className="text-sm text-text-primary">
            Nombre
            <input
              type="text"
              required
              disabled={!canManage}
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="mt-1 w-full rounded-md border border-border bg-bg-elevated px-3 py-2"
            />
          </label>
          <label className="text-sm text-text-primary">
            Timezone
            <input
              type="text"
              required
              disabled={!canManage}
              value={timezone}
              onChange={(event) => setTimezone(event.target.value)}
              className="mt-1 w-full rounded-md border border-border bg-bg-elevated px-3 py-2"
            />
          </label>
          <button
            type="submit"
            disabled={!canManage}
            className="rounded-md border border-accent bg-accent/15 px-3 py-2 text-sm text-text-primary disabled:border-border disabled:bg-bg-elevated disabled:text-text-secondary"
          >
            Crear cliente
          </button>
          {status ? <p className="text-xs text-text-secondary">{status}</p> : null}
        </form>
      </div>
    </section>
  );
}

