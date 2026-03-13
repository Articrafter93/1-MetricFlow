# RUNBOOK CIERRE GO-LIVE (GATE 9/10)

## 1) Variables de entorno y seguridad minima
Validar en Vercel/GitHub:
- `DATABASE_URL` (pooling habilitado).
- `NEXTAUTH_SECRET` y `NEXTAUTH_URL`.
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM` (si hay magic link/invitaciones por correo).
- `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` para deploy CI.

Controles:
- No exponer secretos en logs/commits.
- Dominio y callback de auth con HTTPS en produccion.
- `MOCK_DB_ENABLED` deshabilitado en produccion.

Verificacion automatizada de secretos en Vercel:
```powershell
pwsh -NoProfile -ExecutionPolicy Bypass -File scripts/vercel-env-ensure.ps1 -Target production
```

Aplicar faltantes desde variables del proceso actual:
```powershell
$env:DATABASE_URL="postgresql://USER:PASS@HOST:6543/DB?sslmode=require"
$env:SMTP_HOST="smtp.provider.com"
$env:SMTP_PORT="587"
$env:SMTP_USER="usuario"
$env:SMTP_PASS="password"
$env:MAIL_FROM="noreply@tu-dominio.com"
pwsh -NoProfile -ExecutionPolicy Bypass -File scripts/vercel-env-ensure.ps1 -Target production -ApplyFromProcessEnv
```

## 2) Inicializacion de datos (tenant demo)
```powershell
$env:DATABASE_URL='postgresql://USER:PASS@HOST:5432/DB?sslmode=require'
npm run db:push
npm run db:seed
```

Esperado:
- Workspace demo con slug `metricflow-demo`.
- Usuarios demo Owner/Manager/Client.

## 3) Quality gate local antes de deploy
```powershell
npm run lint
npm run test
npm run build
npm run test:smoke
```

## 4) Deploy de produccion
```powershell
vercel --prod --yes
```

## 5) Smoke multi-tenant por rutas con slug
Con un tenant valido (`metricflow-demo`):
- `/login`
- `/metricflow-demo/dashboard`
- `/metricflow-demo/analytics`
- `/metricflow-demo/clients`
- `/metricflow-demo/reports`
- `/metricflow-demo/settings/team`
- `/metricflow-demo/settings/workspace`
- `/metricflow-demo/settings/billing` (Owner only)

APIs:
- `GET /api/tenants/metricflow-demo/metrics/live?range=30d`
- `POST /api/tenants/metricflow-demo/reports`
- `PATCH /api/tenants/metricflow-demo/settings/workspace`

## 6) Cierre documental
Actualizar:
- `CHECKLIST-CONTROL.md` con estado de PR-01..PR-05 y evidencias.
- `docs/multi-tenancy.md` y `docs/rbac.md` si cambia politica.
