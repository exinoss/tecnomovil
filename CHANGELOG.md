# Changelog

Todos los cambios relevantes de TecnoMovil se registran en este archivo.
El formato se basa en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/)
y el proyecto usa [versionado semántico](https://semver.org/lang/es/).

## [Unreleased]

### Added

- Artefactos iniciales de Gestión de Configuración de Software (GCS).
- Validación continua para el backend y el frontend.
- Compatibilidad de Karma con el builder de Angular para las pruebas automatizadas.

### Changed

- Se establece pnpm 11 como gestor de dependencias del frontend.
- Las pruebas de Karma se ejecutan sin modo watch en CI y usan ChromeHeadless.
- Las pruebas de componentes aíslan servicios externos e importan las dependencias de plantilla necesarias.

## [1.0.0] - Pendiente de publicación

La primera línea base formal se publicará únicamente después de aprobar la
checklist de release, ejecutar las validaciones requeridas y crear el tag
anotado `v1.0.0`.
