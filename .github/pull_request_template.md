## Qué cambia y por qué

<!-- Resumen breve. Enlaza el issue: Closes #___ -->

## Elementos de configuración afectados

<!-- Copiar de documentacion/gcs/CM_PLAN.md los EC que este PR modifica. -->

- EC-__: ___

## Migración / script de base de datos

- [ ] Este PR no toca `Migrations` ni `DatabaseScripts`.
- [ ] Sí los toca — migración/script probado en una base temporal y orden de ejecución documentado.

## Configuración o secretos requeridos

- [ ] No requiere variables nuevas.
- [ ] Requiere variables nuevas — ya están reflejadas en `.env.example`, sin valores reales.

## Pruebas

- [ ] Pruebas manuales realizadas (detallar abajo).
- [ ] Pruebas automatizadas nuevas o actualizadas.

<!-- Detalle de pruebas manuales o automatizadas: -->

## Resultado de CI

- [ ] Backend (.NET): verde
- [ ] Frontend (Angular): verde

## Revisión

- [ ] Nadie aprueba su propio PR (regla de `CM_PLAN.md`).
- [ ] Si el cambio es de seguridad, base de datos o despliegue, fue revisado además por el responsable de esa área.
