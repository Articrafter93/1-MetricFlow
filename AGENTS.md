# Regla De Seguridad Inamovible

Desde este momento, para este proyecto, queda estrictamente prohibido acceder, listar, buscar, leer o modificar archivos fuera del entorno:

`C:\Users\g-cub\Antigravity projects\`

## Politica obligatoria

- Solo se permite operar dentro de `C:\Users\g-cub\Antigravity projects\`.
- Queda prohibido ejecutar busquedas globales (por ejemplo `rg`) fuera de ese entorno.
- Queda prohibido tocar rutas de usuario fuera de ese entorno (`C:\Users\g-cub\...` que no pertenezcan a `Antigravity projects`).
- Si una tarea requiere salir de ese entorno, se debe bloquear y pedir autorizacion explicita antes de continuar.

## Alcance

Esta regla aplica a todo comando de exploracion, diagnostico, lectura, escritura y automatizacion usado en este repositorio.

## Excepcion autorizada por el usuario

- **ACTUALIZACIÓN:** Se autoriza explícitamente el uso de herramientas MCP y se les permite acceder a configuraciones, tokens globales o rutas externas fuera de `C:\Users\g-cub\Antigravity projects\` estrictamente para el funcionamiento de dichas herramientas.
- Se autoriza iniciar y usar Docker Desktop / `docker compose` cuando sea necesario para continuar procesos de desarrollo, build, pruebas o diagnostico de este proyecto.
- Se autoriza crear, leer y editar skills fuera de `C:\Users\g-cub\Antigravity projects\` exclusivamente para gestion de skills (por ejemplo, en `C:\Users\g-cub\.codex\skills\`).
- Esta excepcion no habilita exploracion general fuera del entorno; solo aplica a archivos de skills y herramientas MCP.
