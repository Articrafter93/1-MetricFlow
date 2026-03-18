# 03-DISENO-UI - MetricFlow

## Direccion visual aprobada
- Estilo: dark minimalista con jerarquía clara y baja carga cognitiva.
- Referencias: Linear / Notion / Figma dashboards.
- Tipografia: stack sans limpia con variables CSS de marca.
- Grid: espaciado basado en múltiplos de 8px.
- Excepcion aprobada: `TailwindCSS v4` se usa solo como capa utilitaria de maquetacion; la direccion visual, tokens y componentes siguen siendo custom del proyecto.

## Tokens principales
- Background: `#0a0a0f`
- Surface: `#111118`
- Elevated: `#1a1a24`
- Border: `#2a2a3a`
- Foreground: `#f0f0ff`
- Accent: `#7c6fcd`

## Interacciones clave implementadas
1. Tarjetas KPI con hover + elevación sutil.
2. Expansión animada del bloque de detalle sin recargar página.
3. Transiciones suaves en botones, tabs de rango y navegacion lateral.
4. Respeto de `prefers-reduced-motion` en animaciones globales.

## Responsividad
- Mobile-first con layout de 1 columna.
- Desktop con sidebar fija y panel principal expandido.

## Estado GATE 4
Aprobado: diseño implementado en código con consistencia visual del brief.
