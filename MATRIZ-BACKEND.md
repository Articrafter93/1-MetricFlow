# MATRIZ-BACKEND - MetricFlow

## Decision API
- API requerida para operación plena: SI
- Alcance API: Interna tipo BFF (Next.js Route Handlers) con contratos versionables.
- Consumidores iniciales: Web app dashboard.

## Matriz por rubro
| Rubro | Requerido | Proveedor / Tecnología | Owner | Estado |
|---|---|---|---|---|
| API | Sí | Next.js Route Handlers (Node runtime) | Equipo dev | Cerrado |
| Auth | Sí | NextAuth (Credentials + adapter Prisma) | Equipo dev | Cerrado |
| DB | Sí | PostgreSQL (Docker local; Supabase/AWS RDS en prod) | Equipo dev/infra | Cerrado |
| Storage | No (MVP) | N/A | N/A | No aplica |
| Pagos | No (MVP) | N/A | Negocio | No aplica |
| Email | Opcional | SMTP (nodemailer) para invitaciones | Equipo dev/ops | Parcial |
| CRM | No (MVP) | N/A | Negocio | No aplica |
| CMS | No | N/A | Negocio | No aplica |
| Analítica | Sí | Métricas en `MetricSnapshot` + Recharts | Producto/dev | Cerrado |
| Reportería | Sí | `@react-pdf/renderer` white-label | Producto/dev | Cerrado |

## Variables de entorno previstas
- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `MAIL_FROM`

## Notas operativas
- El aislamiento multi-tenant se aplica a nivel de modelo y consultas (`workspaceId` obligatorio).
- En producción se recomienda reforzar con RLS por workspace (Supabase) o políticas equivalentes en PostgreSQL administrado.
