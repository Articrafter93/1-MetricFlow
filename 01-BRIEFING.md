# 01-BRIEFING - MetricFlow

## Datos del cliente
- Nombre comercial: MetricFlow
- Sector: SaaS B2B (analytics multi-tenant)
- Persona de contacto: No definida en briefing inicial
- Fecha: 2026-03-07
- Ruta de trabajo: `c:\Users\g-cub\Antigravity projects\playground\1- MetricFlow`

## Objetivo principal (1-3 frases)
Construir una plataforma SaaS B2B multi-tenant para agencias y franquicias que permita gestionar clientes en workspaces aislados, visualizar métricas complejas en tiempo casi real y operar con control estricto de roles.

## Audiencia principal
- Agencias de marketing digital.
- Franquicias con equipos internos y clientes externos.
- Stakeholders: Owner, Manager, Client.

## Propuesta de valor
- Aislamiento estricto por tenant/workspace.
- Panel moderno con visualización de embudo, MRR y retención.
- Exportación de reportes PDF white-label por agencia.

## Requerimientos funcionales clave
1. Multi-tenancy con aislamiento de datos por workspace.
2. Roles y permisos: Owner / Manager / Client.
3. Dashboard analítico con filtros por rango de fecha instantáneos.
4. Team settings con invitación por magic link o email.
5. Reportes PDF con branding de agencia.
6. Auth segura con NextAuth + RBAC.
7. Backend containerizado y portable.

## Preguntas obligatorias del flujo y respuestas
1. Objetivo principal del sitio/aplicación:
   Plataforma SaaS de analítica multi-tenant para agencias/franquicias.
2. Acciones clave del usuario:
   Visualizar métricas, administrar equipo y exportar reportes.
3. Contenido editable sin developer:
   Configuración de equipo, logo del workspace para reportes.
4. Datos personales recolectados:
   Nombre, email, rol y datos de uso por cliente.
5. ¿Pagos online?
   No requerido en MVP actual (se contempla facturación interna visible para Owner).
6. Presupuesto mensual/anual hosting:
   No especificado por cliente.
7. Deadline:
   No especificado.
8. Herramientas actuales:
   No especificado.

## Sensibilidad y compliance
- Sensibilidad: Financiero (por métricas de ingresos/facturación y datos de clientes de agencia).
- Ley 1581/GDPR: aplica manejo de PII básica y consentimientos cuando haya formularios externos.

## Referencias visuales y activos de marca
- Referencia visual explícita: estilo Linear / Notion / Figma (dark minimalista).
- Logos/activos finales: no entregados aún (se habilita URL de logo por workspace).
- Redes oficiales: no definidas.

## Rubros backend identificados
- API: sí
- Auth: sí
- DB: sí
- Storage: no (MVP)
- Pagos: no (MVP)
- Email: opcional (invitaciones SMTP)
- CRM: no (MVP)
- CMS: no
- Analítica: sí
- Otros: exportación PDF

## Campos mínimos de protocolo (check explícito)
- Carpeta destino: `c:\Users\g-cub\Antigravity projects\playground\1- MetricFlow`
- API requerida: SI (BFF interna)
- Redes oficiales del cliente: Por definir (pendiente de entrega de URLs oficiales)

## Campos mínimos (formato auditoría)
- Ruta destino (ruta absoluta): `c:\Users\g-cub\Antigravity projects\playground\1- MetricFlow`
- API requerida para operación plena (si/no/por confirmar): si
- Redes sociales oficiales y URLs validadas:
  - Sitio corporativo: pendiente (https://por-definir)
  - LinkedIn: pendiente (https://por-definir)
  - Instagram: pendiente (https://por-definir)

## Riesgos y vacíos
- Falta definición de presupuesto/SLA de infraestructura.
- Falta definición de dominios/correos transaccionales productivos.
- Falta definición legal final para política de privacidad y DPA por tenant.

## Gate 1
Estado: APROBADO (implícito por briefing detallado entregado por cliente en esta sesión).
