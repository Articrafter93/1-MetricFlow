# MetricFlow

SaaS B2B multi-tenant para analítica de agencias y franquicias, construido con `Next.js + Prisma + PostgreSQL`, con dashboard dark mode, roles RBAC, invitaciones por magic link y exportación de reportes PDF white-label.

## Arquitectura resumida

- Frontend + Backend BFF: `Next.js App Router` + Route Handlers.
- Auth: `NextAuth/Auth.js v5` con adapter Prisma y sesión persistente en DB.
- RBAC: roles `OWNER`, `MANAGER`, `CLIENT`.
- Multi-tenancy: aislamiento estricto por `workspaceId` en modelos y consultas.
- DB: `PostgreSQL` vía `Prisma ORM`.
- Visualización: `Recharts`.
- Reportería: `@react-pdf/renderer`.
- Infra local: `Dockerfile` + `docker-compose.yml`.

## Estructura

- `src/app/[tenantSlug]/*` módulos tenant-aware (dashboard, analytics, clients, reports, settings).
- `src/app/api/tenants/[tenantSlug]/*` rutas backend privadas por tenant.
- `src/lib/*` auth, tenancy, RBAC, métricas y utilidades.
- `prisma/schema.prisma` modelo de datos multi-tenant.
- `prisma/seed.ts` datos demo (Owner/Manager/Client).
- `.github/workflows/ci-cd.yml` lint + build + deploy a Vercel.

## Variables de entorno

Usa `.env.example` como base:

```env
DATABASE_URL="postgresql://metricflow:metricflow@localhost:5432/metricflow?schema=public"
NEXTAUTH_SECRET="replace-with-strong-secret"
NEXTAUTH_URL="http://localhost:3000"
SMTP_HOST=""
SMTP_PORT="587"
SMTP_USER=""
SMTP_PASS=""
MAIL_FROM=""
```

## Desarrollo local (sin Docker)

1. `npm install`
2. Configura `.env.local`
3. Levanta PostgreSQL (local o Docker)
4. `npm run db:push`
5. `npm run db:seed`
6. `npm run dev`

## Dependencias sin bloqueos (registry interno)

Para evitar bloqueos recurrentes por VPN/firewall, este repo soporta bootstrap via registry interno:

1. Define `NPM_REGISTRY_URL`:
   - PowerShell: `$env:NPM_REGISTRY_URL = "https://npm.company.internal/"`
2. Verifica conectividad/config:
   - `npm run deps:bootstrap:check`
3. Instala dependencias base y valida build/test:
   - `npm run deps:bootstrap`
4. Si necesitas Tremor:
   - `npm run deps:bootstrap:tremor`

Referencia completa: `docs/dependency-registry-policy.md`.

### Scripts operativos (entorno restringido)

- `npm run deps:preflight`: valida conectividad TCP/HTTPS al registry configurado (`npm_config_registry` o `registry.npmjs.org`) y falla rapido con pasos de remediacion si no hay salida de red.
- `npm run deps:bootstrap`: configura `.npmrc` del proyecto con `NPM_REGISTRY_URL`, valida acceso (`npm ping`), instala dependencias base y ejecuta `build` + `test`.
- `npm run deps:bootstrap:tremor`: mismo flujo de `deps:bootstrap`, agregando `@tremor/react` para ciclos que lo requieran.
- `npm run deps:offline:check`: valida manifest y checksums SHA-512 del bundle offline sin instalar paquetes.
- `npm run deps:offline`: instala dependencias desde `vendor/npm-bundle` en modo `npm --offline --prefer-offline` y ejecuta checks de build/test.
- `npm run ops:vercel:env:check`: auditoria de variables requeridas en Vercel (`production`), reporta faltantes y retorna error si hay huecos.

`ops:vercel:env:check` no debe ejecutarse a ciegas en pipelines no controlados: trabaja sobre variables de entorno productivas y su script subyacente (`scripts/vercel-env-ensure.ps1`) solo debe usarse con `-ApplyFromProcessEnv` cuando exista aprobacion explicita para escribir/rotar secretos.

## Desarrollo local (Docker Compose)

1. `docker compose up -d db`
2. `npm run db:push`
3. `npm run db:seed`
4. `docker compose up --build web`

## Usuarios demo

- `owner@metricflow.dev` / `Demo12345!`
- `manager@metricflow.dev` / `Demo12345!`
- `client@metricflow.dev` / `Demo12345!`

## Flujos funcionales implementados

- Dashboard de métricas con filtros instantáneos `7d/30d/90d`.
- Tarjetas con expansión animada para detalle de gráficos.
- Team settings con invitación por magic link y envío SMTP opcional.
- Exportación de PDF white-label para Owner/Manager.
- Restricción de permisos por rol.

## CI/CD

Workflow en `.github/workflows/quality-gate.yml`:

1. Ejecuta `npm ci`, `npm run check`, `npm run test`, `npm run build`, `npm run test:smoke`.
2. En `main`, despliega por `Git Integration` de Vercel (repo conectado).
3. Opcionalmente, si existen secretos en GitHub, tambien ejecuta deploy por CLI:
   - `VERCEL_TOKEN`
   - `VERCEL_ORG_ID`
   - `VERCEL_PROJECT_ID`

## Entregables del protocolo init

- `01-BRIEFING.md`
- `MATRIZ-BACKEND.md`
- `00-ARQUITECTURA-PROYECTO.md`
- `02-ALCANCE-Y-EXITO.md`
- `02-ARQUITECTURA-SITIO.md`
- `03-DISENO-UI.md`

## Validación

Comandos de cierre:

- `npm run lint`
- `npm run test`
- `npm run build`

## Operación (producción)

Validar secretos mínimos en Vercel:

```powershell
npm run ops:vercel:env:check
```
