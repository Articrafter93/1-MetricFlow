# 02-ALCANCE-Y-EXITO - MetricFlow

## Alcance MVP

### MUST HAVE
1. Autenticación segura con roles (Owner, Manager, Client).
   Criterio de aceptación: login exitoso redirige al dashboard y cada rol ve sólo acciones permitidas.
2. Aislamiento multi-tenant por workspace.
   Criterio de aceptación: toda consulta de datos usa `workspaceId` y no cruza tenants.
3. Dashboard analítico dark mode con filtros por rango de fecha.
   Criterio de aceptación: usuario cambia 7/30/90 días sin recargar página y actualiza gráficas.
4. Team settings con invitación por magic link/email.
   Criterio de aceptación: Owner genera link con rol y el invitado puede asociarse al workspace.
5. Exportación de reportes PDF white-label.
   Criterio de aceptación: Manager/Owner selecciona métricas y descarga PDF con logo del workspace.
6. Docker Compose reproducible (web + postgres).
   Criterio de aceptación: `docker compose up --build` levanta stack.

### SHOULD HAVE
1. Métricas en vivo con polling cada 15s.
2. Seed de datos demo por rol.
3. Pipeline CI con lint/build y job de deploy Vercel.

### COULD HAVE
1. Integración nativa con conectores publicitarios (Meta/Google Ads).
2. Facturación recurrente integrada.
3. Alertas automáticas por anomalías de KPI.

## Fuera de alcance en esta iteración
- Pasarela de pagos y cobro de suscripciones.
- Integración de CRM externo.
- Motor de permisos granular por feature flag.
- Soporte multidioma i18n.

## Mapa preliminar de páginas
- `/` Landing técnica del producto.
- `/sign-in` Acceso.
- `/dashboard` Overview de métricas.
- `/dashboard/team` Configuración de equipo.
- `/dashboard/reports` Reportes PDF.

## KPIs de éxito post-lanzamiento
1. Tiempo de carga inicial dashboard menor a 2.5s en entorno productivo.
2. 0 incidentes de cruce de datos entre tenants.
3. Al menos 80% de reportes exportados sin error.
4. 90% de invitaciones aceptadas antes de 72 horas en agencias piloto.
5. Retención mensual de agencias piloto >= 85%.

## Riesgos/dependencias
- Riesgo de brecha de aislamiento si se omite filtro por `workspaceId`.
- Dependencia de SMTP para envío real de invitaciones.
- Dependencia de configuración Vercel secrets para deploy automático.

## Gate 2
Estado: APROBADO (alcance derivado del brief detallado entregado por cliente).
