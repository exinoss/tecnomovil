# Plan de Gestión de Configuración de Software (GCS)

**Proyecto:** TecnoMovil  
**Versión del documento:** 1.0  
**Estado:** Vigente  
**Línea base objetivo:** `v1.0.0`  
**Responsable de GCS y aprobación de releases:** Henry Alvarez, QA (líder)

## Objetivo

Controlar de forma trazable los cambios de TecnoMovil para que cada release pueda reconstruirse, verificarse y relacionarse con su requisito, solicitud de cambio, revisión, pruebas y tag de Git.

## Roles

| Integrante | Rol | Responsabilidades de GCS |
| --- | --- | --- |
| Ramirez Juan | Dev Backend | Mantiene API, lógica de negocio, configuración backend, migraciones EF Core y scripts SQL; evalúa su impacto técnico. |
| Jeremy Haro | Dev Frontend | Mantiene Angular, Ionic/Capacitor, dependencias, interfaz y pruebas frontend; evalúa su impacto técnico. |
| Henry Alvarez | QA (líder) | Controla este plan, criterios de aceptación y evidencias de prueba; aprueba la preparación de release y autoriza tags. |

Ninguna persona aprueba su propio pull request. Los cambios de base de datos, seguridad, despliegue o release necesitan la validación técnica del responsable del área y la verificación de QA.

## Elementos de configuración

| ID | Elemento | Ubicación | Responsable | Control requerido |
| --- | --- | --- | --- | --- |
| EC-01 | API y lógica de negocio | `backend/Controllers`, `Services`, `Models`, `DTOs`, `Data` | Ramirez Juan | PR, build y pruebas. |
| EC-02 | Cliente web y móvil | `frontend/src`, `frontend/android` | Jeremy Haro | PR, build y pruebas. |
| EC-03 | Esquema y datos de base | `backend/Migrations`, `backend/DatabaseScripts` | Ramirez Juan | Migración y/o script revisado, orden de ejecución y prueba en BD temporal. |
| EC-04 | Configuración pública | `appsettings*.json`, `.env.example`, entornos Angular | Responsable del componente | Sin secretos; valores por ambiente documentados. |
| EC-05 | Dependencias y build | `*.csproj`, `package.json`, `pnpm-lock.yaml`, `Dockerfile` | Responsable del componente | Lockfile actualizado y compilación reproducible. |
| EC-06 | Secretos | `.env` local y secretos de CI | Ramirez Juan / Henry Alvarez | Nunca se versionan; se gestionan por entorno. |
| EC-07 | Pruebas | proyectos .NET y `*.spec.ts` | Henry Alvarez | Se ejecutan en CI y se adjunta evidencia al PR. |
| EC-08 | Automatización | `.github/workflows/ci.yml` | Henry Alvarez | Revisión adicional cuando afecta seguridad o despliegue. |
| EC-09 | Documentación y releases | `README.MD`, `documentacion/gcs/`, `CHANGELOG.md`, tags | Henry Alvarez | Actualización con cada cambio o release aplicable. |

Las cargas de ejecución en `backend/wwwroot/uploads/` no se consideran EC por defecto. Antes de retirarlas de Git, el equipo debe clasificarlas como fixture de prueba o dato operativo y definir su respaldo/almacenamiento.

## Flujo de cambio

1. Registrar el trabajo como issue o RFC. Una RFC es obligatoria si el cambio afecta requisitos, modelo de datos, endpoints públicos, seguridad, despliegue, dependencias importantes o arquitectura.
2. Crear una rama corta: `feat/123-descripcion`, `fix/123-descripcion` o `docs/123-descripcion`.
3. Crear commits convencionales y coherentes: `feat`, `fix`, `docs`, `test`, `refactor`, `build`, `ci`, `chore`, `perf` o `security`.
4. Abrir pull request con EC afectados, impacto, pruebas, migraciones y actualización documental que corresponda.
5. Integrar a `main` únicamente tras revisión aprobada y CI en verde.

Ejemplos:

```text
feat(inventario): alert when stock reaches minimum
fix(facturacion): calculate repair subtotal correctly
docs(gcs): add release checklist
```

## Calidad y verificación

El workflow CI se ejecuta en pull requests y cambios a `main`.

| Componente | Verificación mínima |
| --- | --- |
| Backend | Restaurar dependencias y compilar en modo `Release`; ejecutar proyectos de prueba .NET cuando existan. |
| Frontend | Instalar con `pnpm install --frozen-lockfile`, compilar y ejecutar pruebas de Karma en ChromeHeadless. |
| Base de datos | Todo cambio incluye migración/script, su orden de aplicación y prueba en base temporal antes de release. |
| Seguridad | Sin `.env`, llaves, tokens ni contraseñas en Git; revisar cambios de autenticación y configuración. |

Los módulos prioritarios para pruebas de backend son autenticación, facturación, inventario y reparaciones. Los objetivos de cobertura y rendimiento se fijarán cuando QA obtenga una medición inicial reproducible.

## Versionado y releases

Se usa `vMAJOR.MINOR.PATCH`:

- **MAJOR:** cambio incompatible de API, datos o comportamiento.
- **MINOR:** nueva funcionalidad compatible.
- **PATCH:** corrección compatible, seguridad o mantenimiento.

La primera línea base es `v1.0.0`: TecnoMovil ya integra módulos de negocio, API .NET, frontend Angular/Ionic, Android, migraciones, scripts SQL y Docker. No se crea el tag hasta que la checklist [`releases/v1.0.0.md`](releases/v1.0.0.md) esté aprobada.

Al liberar una versión:

1. Verificar árbol de trabajo limpio, PR de release aprobado y CI en verde.
2. Actualizar `CHANGELOG.md` y la checklist con la evidencia.
3. Crear y publicar un tag anotado; los tags publicados no se modifican.

```bash
git tag -a v1.0.0 -m "Baseline v1.0.0: primera línea base formal de TecnoMovil"
git push origin v1.0.0
```

## Evidencia y auditoría

Para cada release se conserva: enlace a issue/RFC, PR y commits; resultados de CI/pruebas; migraciones o scripts aplicados; changelog; checklist aprobada; y tag/release publicado. Henry Alvarez mantiene el registro y valida que esté completo antes de autorizar el tag.
