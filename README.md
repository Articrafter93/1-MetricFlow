# MetricFlow

SaaS B2B multi-tenant para analítica de agencias y franquicias, construido con `Next.js + Prisma + PostgreSQL`, con dashboard dark mode, roles RBAC, invitaciones por magic link y exportación de reportes PDF white-label.

## Arquitectura resumida

- Frontend + Backend BFF: `Next.js App Router` + Route Handlers.
- Auth: `NextAuth` con credenciales y sesión segura.
- RBAC: roles `OWNER`, `MANAGER`, `CLIENT`.
- Multi-tenancy: aislamiento estricto por `workspaceId` en modelos y consultas.
- DB: `PostgreSQL` vía `Prisma ORM`.
- Visualización: `Recharts`.
- Reportería: `@react-pdf/renderer`.
- Infra local: `Dockerfile` + `docker-compose.yml`.

## Estructura

- `src/app/dashboard/*` módulos de métricas, equipo y reportes.
- `src/app/api/*` rutas backend (`metrics/live`, `team/invite`, `reports/pdf`).
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

Workflow en `.github/workflows/ci-cd.yml`:

1. Ejecuta `npm ci`, `npm run lint`, `npm run build`.
2. En `main`, despliega a Vercel usando secretos:
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
- `npm run build`
