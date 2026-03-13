# RBAC - MetricFlow

## Objetivo
Centralizar autorizacion de Owner/Manager/Client en un unico mapa declarativo.

## Fuente de verdad
- Politica: `src/lib/rbac.ts`
- Guardas server: `src/lib/tenant-context.ts`
- Wrapper UI declarativo: `src/components/require-role.tsx`

## Recursos y acciones
- `dashboard:view` -> Owner, Manager, Client
- `analytics:view` -> Owner, Manager, Client
- `clients:view` -> Owner, Manager, Client
- `clients:manage` -> Owner, Manager
- `reports:view` -> Owner, Manager, Client
- `reports:export` -> Owner, Manager
- `team:view` -> Owner, Manager
- `team:invite` -> Owner
- `workspaceSettings:view/manage` -> Owner
- `billingInternal:view/manage` -> Owner

## Flujo API
1. Resolver membresia por tenant en `requireTenantApiContext`.
2. Evaluar permiso requerido con `hasRequiredPermission`.
3. Si no cumple: `403 Forbidden`.

## Flujo UI
1. Paginas server usan `requireTenantPageContext(..., permission)`.
2. Secciones client usan `<RequireRole permission={...}>`.
3. Fallback visual sin exponer acciones sensibles.

## Cobertura de pruebas
- `tests/rbac.test.ts` valida restricciones Owner/Manager/Client incluyendo billing interno.
