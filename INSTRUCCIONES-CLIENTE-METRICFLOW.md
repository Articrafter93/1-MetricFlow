# INSTRUCCIONES DEL CLIENTE - METRICFLOW

> Objetivo: documento fuente para revisar en cualquier momento el cumplimiento de las exigencias del cliente.
> Fuente: brief original entregado por cliente en sesion inicial.
> Fecha de consolidacion: 2026-03-07
> Proyecto: MetricFlow

## 1) Vision del proyecto (texto del cliente consolidado)

Construir "MetricFlow", un SaaS B2B de analitica multi-tenant para agencias de marketing digital y franquicias.  
Cada agencia debe operar en su propio entorno aislado, gestionar sus clientes y visualizar metricas complejas en tiempo real.

## 2) Contexto de negocio y arquitectura exigida

### 2.1 Multi-tenancy y aislamiento de datos
- Una sola instancia de aplicacion para multiples empresas.
- Aislamiento estricto de datos entre inquilinos por seguridad empresarial.
- Cada agencia debe tener un `Workspace` unico en base de datos.

### 2.2 Base de datos
- Requisito: PostgreSQL robusto.
- Preferencia de hosting: Supabase o AWS.
- Condicion: no debe existir cruce de datos entre workspaces.

### 2.3 Roles y permisos
Roles requeridos:
- `Owner`: ve facturacion y configura accesos.
- `Manager`: gestiona integraciones y reportes diarios.
- `Client`: solo visualiza su panel, sin edicion.

### 2.4 Backend e infraestructura
- Backend contenerizado con Docker.
- Debe facilitar escalado y migracion futura (ejemplo: de Vercel a AWS).

## 3) Requerimientos funcionales core

### 3.1 Visualizacion de datos
- Integrar graficos avanzados (Recharts o Tremor).
- Incluir como minimo:
  - embudos de conversion
  - ingresos recurrentes (MRR)
  - retencion
- Filtros por rango de fechas con respuesta instantanea.

### 3.2 Gestion de roles/equipo
- Modulo "Configuracion de Equipo".
- El `Owner` debe poder invitar miembros por:
  - enlace magico
  - correo electronico
- Debe asignar nivel de acceso (rol) al invitar.

### 3.3 Reportes automatizados
- El `Manager` debe poder seleccionar graficas clave.
- Exportacion a PDF limpio y bien formateado.
- White-labeling: PDF con logo de la agencia.

## 4) Requerimientos visuales y UX

### 4.1 Estetica
- Estilo minimalista dark mode (referencia: Linear).
- Paleta limitada para reducir carga cognitiva.
- Fondos oscuros y glassmorphism sutil en barras laterales.

### 4.2 Micro-interacciones y animaciones
- Transiciones para cambios de contexto.
- Ejemplo obligatorio: detalle de tarjeta que se expande suavemente sin recarga completa.

### 4.3 Tipografia y espaciado
- Una sola fuente sans-serif consistente (ejemplo: Inter o Geist).
- Sistema de espaciado basado en multiplos de 8px.

## 5) Entregables tecnicos obligatorios

- Repositorio GitHub con commits semanticos.
- `README.md` pulido explicando arquitectura.
- Entorno replicable con `docker-compose.yml`.
- Deploy productivo en Vercel.
- CI/CD para desplegar en cada push.
- Login seguro con NextAuth o Clerk manejando roles.

## 6) Matriz de cumplimiento (control rapido)

> Estado sugerido: `Cumple`, `Parcial`, `Pendiente`, `Bloqueado`.

| ID | Exigencia del cliente | Estado actual | Evidencia / referencia |
|---|---|---|---|
| ARQ-01 | Multi-tenant con aislamiento por workspace | Cumple | `prisma/schema.prisma`, `src/lib/workspace.ts` |
| ARQ-02 | PostgreSQL robusto (preferencia Supabase/AWS) | Cumple (temporal) | cliente aprobó fase mock DB; pendiente migracion a PostgreSQL gestionado en siguiente fase |
| ARQ-03 | Roles Owner/Manager/Client | Cumple | `src/lib/rbac.ts`, `src/types/next-auth.d.ts` |
| INF-01 | Backend contenerizado con Docker | Cumple | `Dockerfile`, `docker-compose.yml` |
| FUN-01 | Graficos avanzados + MRR/funnel/retencion | Cumple | `src/components/charts/*`, `src/app/dashboard/page.tsx` |
| FUN-02 | Filtro instantaneo por fechas | Cumple | `src/components/date-range-filter.tsx` |
| FUN-03 | Team settings + invitacion + asignacion de rol | Cumple | `src/app/dashboard/team/page.tsx`, `src/app/api/team/invite/route.ts` |
| FUN-04 | Exportacion PDF white-label | Cumple | `src/app/api/reports/pdf/route.ts` |
| UX-01 | Dark mode minimalista + glassmorphism | Cumple | `src/app/globals.css`, layout dashboard |
| UX-02 | Micro-interacciones de expansion | Cumple | tarjetas expandibles en dashboard |
| UX-03 | Tipografia unica + grid 8px | Cumple | sistema visual implementado en estilos globales/componentes |
| DEV-01 | GitHub con commits semanticos | Cumple | historial de commits en `main` |
| DEV-02 | README pulido de arquitectura | Cumple | `README.md` |
| DEV-03 | Deploy en Vercel + CI/CD | Cumple | proyecto enlazado a GitHub en Vercel (`productionBranch=main`, `createDeployments=enabled`) + workflow CI |
| SEC-01 | Login seguro con NextAuth/Clerk + roles | Cumple (temporal) | NextAuth operativo en produccion con modo mock DB y RBAC activo |

## 7) Condicion de cierre para cumplimiento total

Para considerar cumplimiento completo del brief en fase actual (mock aprobada por cliente):
- `GATE 9` cerrado.
- `GATE 10` cerrado.

Pendiente para siguiente fase:
- Migrar de mock DB a PostgreSQL gestionado (Supabase/AWS).
- Configurar `DATABASE_URL` productiva y ejecutar migracion/seed real.
