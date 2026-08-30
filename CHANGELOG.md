# Changelog

Todos los cambios relevantes de TecnoMovil se registran en este archivo.
El formato se basa en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/)
y el proyecto usa [versionado semántico](https://semver.org/lang/es/).

## [Unreleased]

## [1.1.0] - 2026-08-19

### Added

- Acceso biométrico (huella) y por PIN en la app Android.
- Bloqueo de sesión por inactividad y control del botón físico de retroceso en Android.

### Known issues

- La CI de frontend quedó en rojo tras esta versión (`app.spec.ts` no provee `HttpClient` para el nuevo árbol de inyección de `App`). Corrección planeada en `v1.1.1`. Ver `documentacion/gcs/releases/v1.1.0.md`.

## [1.0.0] - 2026-08-29

Línea base formal de TecnoMovil, etiquetada de forma retroactiva sobre el
commit `3c48404` (previo a la integración biométrica). Ver checklist en
`documentacion/gcs/releases/v1.0.0.md`.

### Added

- Artefactos iniciales de Gestión de Configuración de Software (GCS): plan de configuración, plantillas de RFC/ADR y checklist de release.
- Validación continua (GitHub Actions) para el backend (.NET) y el frontend (Angular).
- Compatibilidad de Karma con el builder de Angular para las pruebas automatizadas.

### Changed

- Se establece pnpm 11 como gestor de dependencias del frontend.
- Las pruebas de Karma se ejecutan sin modo watch en CI y usan ChromeHeadless.
- Las pruebas de componentes aíslan servicios externos e importan las dependencias de plantilla necesarias.
