# Matriz de decisión — selección de metodología

**Proyecto:** TecnoMovil · **Equipo:** 3 integrantes (Backend, Frontend, Documentación/BD)
**Metodologías comparadas:** Scrum vs. Kanban
**Fecha:** 2026-08-29

Puntuación de 1 (bajo ajuste) a 5 (alto ajuste), evaluada contra el estado real del repositorio, no contra la teoría de cada metodología.

| Criterio (alineado a GCS) | Scrum | Kanban | Notas de decisión |
| --- | :---: | :---: | --- |
| **Control de cambios** (aprobación/registro) | 4 | 4 | Empate real: el control ya no depende de la metodología sino del *gate* de PR + revisión cruzada + CI que exige `CM_PLAN.md`, y ese gate es idéntico en ambas. |
| **Visibilidad del estado** (seguimiento) | 5 | 4 | Scrum gana: el corte de Sprint Review y el burndown dan una fotografía formal del avance que un flujo continuo no ofrece por sí solo. |
| **Trazabilidad** (requerimiento → cambio → versión) | 3 | 5 | En Kanban la tarjeta **es** el issue de GitHub: el enlace a rama, PR, commit y tag es automático. En Scrum esa cadena depende de que cada historia se referencie manualmente al backlog del sprint. |
| **Riesgo / problemas frecuentes** (prevención) | 3 | 4 | El límite de WIP reduce ramas abiertas en paralelo y conflictos de merge — el riesgo real observado en este equipo de 3 (ver el problema de CI detectado esta semana, causado por un cambio grande integrado sin revisión incremental). |
| **Adaptación al equipo** (tamaño/ritmo) | 2 | 5 | Con 3 integrantes, sin Product Owner dedicado y con carga académica irregular entre semanas, los sprints de duración fija se rompen en época de exámenes o entregas de otras materias; el flujo continuo de Kanban no exige ese compromiso de calendario. |
| **Total** | **17** | **22** | |

## Resultado

**Metodología elegida: Kanban.**

## Justificación breve

Kanban gana por 5 puntos, concentrados exactamente en los dos criterios donde el proyecto tenía déficit real: trazabilidad y adaptación al equipo. El historial de TecnoMovil antes de establecer GCS (commits como `k`, `ll`, `fin`, `cambios`) muestra el costo de no tener esa trazabilidad — imposible saber qué cambió y por qué sin leer el diff completo. Kanban resuelve esto de forma estructural, porque cada tarjeta del tablero es el mismo issue que aparece en el PR y en el commit, sin pasos manuales adicionales. Se reconoce honestamente que Scrum es superior en visibilidad del estado gracias a sus ceremonias formales; se compensa manteniendo una columna `Doing` visible en todo momento y un límite de WIP de 2 tarjetas por integrante, que cumple un propósito similar sin exigir sprints de duración fija. Control de cambios quedó en empate porque, en la práctica, ese control lo impone el flujo de PR obligatorio del `CM_PLAN.md`, no la metodología elegida.
