# 00-ARQUITECTURA-PROYECTO - MetricFlow

## Respuestas Formulario Pre-Scaffold
1. Tipo de proyecto: SaaS MVP (plataforma con auth + dashboards).
2. ¿CMS?: No.
3. ¿Base de datos?: Sí.
4. ¿Pasarela de pago?: No (MVP).
5. Sensibilidad de datos: Financiero.
6. ¿Docker?: Obligatorio.
7. ¿Google Stitch?: No aplicado en esta sesión (dirección visual implementada en código).
8. Mercado objetivo: Latinoamérica (potencial internacional).
9. Presupuesto hosting: Bajo/medio para MVP, escalable a AWS.
10. ¿VPS disponible?: Sí (objetivo futuro de portabilidad).
11. Preferencia backend: JavaScript/TypeScript.
12. ¿i18n?: No en v1.

## Stack decidido
- Framework/Lenguaje: Next.js 16 + TypeScript.
- Backend: Next.js Route Handlers (BFF) en runtime Node.
- CMS: Ninguno.
- Base de datos: PostgreSQL + Prisma ORM.
- Pasarela de pago: Ninguna en MVP.
- Docker: Obligatorio (Dockerfile + docker-compose).
- Diseño visual: Dark minimalista tipo Linear (implementación directa en Tailwind/CSS).
- Deploy objetivo: Vercel (web) + PostgreSQL administrado (Supabase/AWS RDS); alternativa full Docker en AWS.

## Decisiones de seguridad y aislamiento
1. Cada entidad de negocio incorpora `workspaceId`.
2. Toda consulta backend filtra por membresía del usuario autenticado.
3. RBAC por rol:
   - Owner: administración de equipo y visibilidad total.
   - Manager: operación de reportes y métricas.
   - Client: lectura de dashboard.
4. Variables sensibles sólo en `.env.local` y no versionadas.

## GAPS y validaciones manuales
- Política legal final (privacidad/DPA por país): REQUIERE VALIDACIÓN MANUAL.
- RLS en Supabase para producción: REQUIERE VALIDACIÓN MANUAL.
- Auditoría de hardening SMTP y rotación de secretos: REQUIERE VALIDACIÓN MANUAL.

## Gate 3
Estado: APROBADO (stack coherente con brief y sin combinaciones incompatibles).
