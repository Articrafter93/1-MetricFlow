# 02-ARQUITECTURA-SITIO - MetricFlow

## Sitemap funcional
1. `/`
   Objetivo: presentar propuesta de valor y entrada al producto.
2. `/sign-in`
   Objetivo: autenticación segura.
3. `/dashboard`
   Objetivo: métricas principales (MRR, embudo, retención/conversión) con filtros.
4. `/dashboard/team`
   Objetivo: gestión de miembros e invitaciones por rol.
5. `/dashboard/reports`
   Objetivo: configuración y exportación de reportes PDF.
6. `/api/*`
   Objetivo: capa backend (auth, métricas live, invitaciones, reportes).

## Componentes obligatorios por tipo de página
- Layout base:
  sidebar, header contextual, navegación por módulos.
- Dashboard:
  tarjetas KPI, gráficos expandibles, selector de rango, refresh periódico.
- Team Settings:
  listado de miembros, formulario de invitación y generación de magic link.
- Reports:
  selector de gráficas, rango temporal, exportación PDF.

## SEO técnico base
- Metadata global definida en layout.
- Idioma base `es`.
- Estructura App Router limpia para crecimiento.
- Preparado para agregar `sitemap.xml` y `robots.txt` en fase de hardening SEO.

## Arquitectura lógica de datos
- `Workspace`
- `User`
- `Membership (workspaceId + role)`
- `ClientAccount`
- `MetricSnapshot`
- `TeamInvite`
- `ReportTemplate`

## Flujo principal de usuario
1. Usuario inicia sesión.
2. Sistema resuelve membresía y workspace activo.
3. Dashboard carga métricas filtradas por `workspaceId`.
4. Owner/Manager ejecuta operaciones avanzadas (invitar/exportar).
5. Client consume datos en modo sólo lectura.
