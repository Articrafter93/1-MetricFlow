# RUNBOOK CIERRE GO-LIVE (GATE 9/10)

## Objetivo
Cerrar los pendientes finales del cliente para dejar MetricFlow en cumplimiento total.

## 1) Configurar base de datos productiva (bloqueante)

1. Provisionar PostgreSQL gestionado (preferido: Supabase o AWS).
2. Copiar la cadena de conexion (`DATABASE_URL`) productiva.
3. Cargarla en Vercel:

```powershell
'postgresql://USER:PASS@HOST:5432/DB?sslmode=require' | vercel env add DATABASE_URL production
```

## 2) Inicializar esquema y datos base en la DB productiva

```powershell
$env:DATABASE_URL='postgresql://USER:PASS@HOST:5432/DB?sslmode=require'
npm run db:push
npm run db:seed
```

## 3) Redeploy de produccion

```powershell
vercel --prod --yes
```

## 4) Smoke test de autenticacion

Validar:
- `/sign-in` carga correctamente.
- Login `owner@metricflow.dev / Demo12345!` entra a `/dashboard`.
- Acceso a `/dashboard/team` y `/dashboard/reports`.
- Export PDF responde sin error.

## 5) Cierre formal de control

Actualizar:
- `CHECKLIST-CONTROL.md`
  - Marcar `DATABASE_URL` en production como resuelto.
  - Cerrar `GATE 9` y `GATE 10`.
- `REDO-TRACKING.md`
  - `GATE_9_STATUS: APROBADO`
  - `GATE_10_STATUS: APROBADO`
- `INSTRUCCIONES-CLIENTE-METRICFLOW.md`
  - Cambiar `ARQ-02`, `DEV-03`, `SEC-01` a `Cumple` (si aplica tras validacion).
