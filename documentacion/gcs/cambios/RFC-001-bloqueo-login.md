# RFC-001: Bloqueo de login tras intentos fallidos

| Campo | Valor |
| --- | --- |
| Estado | Aprobado |
| Autor | Ramirez Juan |
| Fecha | 2026-08-29 |
| Issue relacionado | #5 |
| Prioridad | Alta |
| Responsable técnico | Ramirez Juan (backend), Jeremy Haro (frontend) |
| Aprobación QA | Henry Alvarez |

## Problema y objetivo

El endpoint `POST /api/auth/login` ([AuthController.cs:34](../../../backend/Controllers/AuthController.cs#L34)) no tiene ningún límite de intentos: acepta credenciales indefinidamente sin penalizar los fallos. El mismo controlador ya resuelve este problema para el flujo de recuperación de contraseña ([AuthController.cs:20](../../../backend/Controllers/AuthController.cs#L20) y [AuthController.cs:185-194](../../../backend/Controllers/AuthController.cs#L185-L194)), pero esa protección nunca se extendió al login. Objetivo: bloquear temporalmente una cuenta tras 5 intentos fallidos consecutivos, reutilizando el mismo patrón ya validado en el proyecto.

## Alcance y criterios de aceptación

- [x] Tras 5 intentos fallidos consecutivos con una identificación válida, el login queda bloqueado 15 minutos.
- [x] Mientras está bloqueado, el backend responde `Success = false` indicando los minutos restantes, sin revelar si la contraseña era correcta.
- [x] Un login exitoso reinicia el contador de intentos fallidos.
- [x] El mensaje para identificación inexistente sigue siendo genérico (no debe distinguirse de una contraseña incorrecta), para no filtrar qué identificaciones existen.
- [x] El frontend deshabilita el formulario y muestra el tiempo restante mientras dura el bloqueo.

## Impacto en elementos de configuración

| EC | Cambio previsto | Riesgo | Mitigación o reversión |
| --- | --- | --- | --- |
| EC-01 | Nueva lógica de bloqueo en `AuthController.Login` | Un usuario legítimo que olvida su contraseña queda bloqueado 15 min | Mensaje explícito con el tiempo restante; el flujo de "olvidé mi contraseña" (`solicitar-codigo`) sigue disponible durante el bloqueo |
| EC-03 | Migración `AddBloqueoLogin` agrega `intentos_fallidos` y `bloqueado_hasta` a `Usuario` | Migración mal aplicada podría bloquear el login de todos los usuarios | Columnas nullable/con default; probado en base temporal antes de mergear; `Down()` de la migración revierte limpio |
| EC-02 | `LoginResponse` y `login.component.ts` muestran el estado de bloqueo | Ninguno relevante (solo UI) | Revisión visual en PR |
| EC-07 | Nuevas pruebas: `login.component.spec.ts` (frontend) | Ninguno | — |

## Implementación y validación

- Rama y pull request: `feat/5-login-lockout` → PR #6
- Migración/script de base de datos: `AddBloqueoLogin` (EF Core); no requiere cambios en `DatabaseScripts/01_schema.sql` porque las migraciones son la fuente de verdad del esquema (ver `README.MD`, paso 3)
- Configuración o secretos requeridos: ninguno nuevo
- Pruebas manuales/automatizadas:
  - Manual: fallar 5 veces el login de un usuario válido → 6.º intento responde bloqueo con minutos restantes → login correcto tras expirar el bloqueo restablece el contador.
  - Automatizada: `frontend/src/app/auth/login/login.component.spec.ts` (nuevo).
- Resultado de CI: pendiente de PR #6 (backend y frontend deben quedar en verde antes de mergear).

## Decisión

| Decisión | Responsable | Fecha | Observaciones |
| --- | --- | --- | --- |
| Aprobado para implementación | Henry Alvarez (QA) | 2026-08-29 | Se aprueba con el criterio de mensaje genérico para identificación inexistente, para no introducir una fuga de información nueva. |
