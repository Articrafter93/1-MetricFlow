"use client";

import { useState } from "react";

type WorkspaceSettingsFormProps = {
  tenantSlug: string;
  initialName: string;
  initialLogoUrl: string | null;
};

export function WorkspaceSettingsForm({
  tenantSlug,
  initialName,
  initialLogoUrl,
}: WorkspaceSettingsFormProps) {
  const [name, setName] = useState(initialName);
  const [logoUrl, setLogoUrl] = useState(initialLogoUrl ?? "");
  const [status, setStatus] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("Guardando...");

    const response = await fetch(`/api/tenants/${tenantSlug}/settings/workspace`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        logoUrl: logoUrl.trim() ? logoUrl.trim() : null,
      }),
    });

    if (!response.ok) {
      setStatus("No fue posible guardar la configuracion.");
      return;
    }

    setStatus("Configuracion actualizada.");
  }

  return (
    <section className="glass-panel max-w-xl space-y-4 p-4">
      <header>
        <h1 className="text-lg font-semibold text-text-primary">Workspace Settings</h1>
        <p className="text-sm text-text-secondary">
          White-label: nombre y logo usados en reportes y encabezados.
        </p>
      </header>

      <form onSubmit={onSubmit} className="space-y-3">
        <label className="block text-sm text-text-primary">
          Nombre del workspace
          <input
            type="text"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="mt-1 w-full rounded-md border border-border bg-bg-elevated px-3 py-2"
          />
        </label>
        <label className="block text-sm text-text-primary">
          Logo URL
          <input
            type="url"
            value={logoUrl}
            onChange={(event) => setLogoUrl(event.target.value)}
            className="mt-1 w-full rounded-md border border-border bg-bg-elevated px-3 py-2"
            placeholder="https://brand.com/logo.png"
          />
        </label>
        <button
          type="submit"
          className="rounded-md border border-accent bg-accent/15 px-3 py-2 text-sm text-text-primary"
        >
          Guardar
        </button>
      </form>

      {status ? <p className="text-sm text-text-secondary">{status}</p> : null}
    </section>
  );
}

