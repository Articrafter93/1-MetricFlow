# Multi-tenancy - MetricFlow

## Modelo de aislamiento
- Estrategia MVP: base compartida con filtro estricto por `workspaceId`.
- El tenant se resuelve por `tenantSlug` en URL y membresia de sesion.

## Puntos de control
- Rutas autenticadas: `/(app)/[tenantSlug]/*`.
- APIs privadas: `/api/tenants/[tenantSlug]/*`.
- Inyeccion de slug en request: `src/proxy.ts` (`x-tenant-slug`).
- Resolucion de contexto: `src/lib/tenant-context.ts`.

## Reglas obligatorias
1. Nunca usar `workspaceId` de payload/query del cliente.
2. Toda query de negocio debe incluir `tenantContext.workspaceId`.
3. `clientId` debe validarse contra el workspace activo antes de consultar metricas/reportes.

## Controles automatizados
- Regla Semgrep custom: `.semgrep/tenant-isolation.yml`.
- Pipeline: `.github/workflows/quality-gate.yml`.
- Test de aislamiento de cliente por tenant: `tests/tenant-isolation.test.ts`.

## Ejemplos de rutas protegidas
- `GET /api/tenants/[tenantSlug]/metrics/live`
- `POST /api/tenants/[tenantSlug]/reports`
- `PATCH /api/tenants/[tenantSlug]/settings/workspace`
