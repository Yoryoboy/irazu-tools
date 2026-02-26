# Monthly Goals Calculation (BAU + HS)

Este documento explica el procedimiento operativo para calcular Monthly Goals con una exportacion de tareas (por ejemplo en Excel), sin depender del codigo.

Alcance actual:
- BAU: puntos (`DESIGN POINTS`)
- HS: millas redondeadas (`ASBUILT ROUNDED MILES`, `DESIGN ROUNDED MILES`, `REDESIGN ROUNDED MILES`)

Fuente de verdad de la logica:
- `src/pages/MonthlyGoals/BauGoals/BauGoals.helpers.ts`
- `src/pages/MonthlyGoals/BauGoals/BauGoals.SearchParams.ts`
- `src/pages/MonthlyGoals/HsGoals/HsGoals.helpers.ts`
- `src/pages/MonthlyGoals/HsGoals/HsGoals.SearchParams.ts`

## 1) Reglas globales

1. Periodo mensual: evaluar fechas en zona horaria `America/Argentina/Buenos_Aires`.
2. Tareas cerradas: se incluyen (`include_closed = true`).
3. Criterio de inclusion mensual: solo por completion date en rango del mes (no se filtra por status para incluir/excluir).
4. Listas ClickUp usadas:
- BAU: `cciBau` (`901404730264`)
- HS: `cciHs` (`900200859937`)

## 2) Campos requeridos

Campos base:
- `Task ID` (o identificador unico de tarea)
- `Task Name`
- `Status`
- `Assignee` (campo nativo de tarea)

Campos BAU:
- `ACTUAL COMPLETION DATE`
- `DESIGN POINTS`
- `QC PERFORMED BY`

Campos HS:
- `PREASBUILT ACTUAL COMPLETION DATE`
- `ACTUAL COMPLETION DATE`
- `REDESIGN ACTUAL COMPLETION DATE`
- `ASBUILT ROUNDED MILES`
- `DESIGN ROUNDED MILES`
- `REDESIGN ROUNDED MILES`
- `DESIGN ASSIGNEE`
- `PREASBUILT QC BY`
- `DESIGN QC BY`
- `REDESIGN QC BY`
- `PROJECT TYPE` (consistencia)

## 3) BAU: procedimiento

1. Filtrar tareas por:
- `ACTUAL COMPLETION DATE` dentro del mes objetivo (zona Argentina)

2. Para cada tarea filtrada, leer:
- `DESIGN POINTS`
- `Assignee` (disenadores)
- `QC PERFORMED BY` (QC)

3. Reglas de warning BAU:
- Warning si falta `ACTUAL COMPLETION DATE`.
- Warning si falta `DESIGN POINTS` o no es numerico.
- Warning si no hay `Assignee`.
- Warning si no hay `QC PERFORMED BY`.

4. Regla de reparto de puntos:
- Si `DESIGN POINTS` es numerico y hay N assignees, cada disenador recibe `DESIGN POINTS / N`.
- Si `DESIGN POINTS` es numerico y hay M QC, cada QC recibe `DESIGN POINTS / M`.
- Si falta puntos o no hay usuarios, el aporte de ese grupo es 0.

5. Agregados BAU:
- `Total Tasks`: cantidad de tareas filtradas (incluye tareas con warnings).
- `Total Design Points`: suma de `DESIGN POINTS` numericos de tareas filtradas.
- Por persona:
- `totalPoints`: suma de sus aportes.
- `taskCount`: cantidad de tareas unicas donde tuvo aporte.

## 4) HS: procedimiento

HS se calcula por contribuciones de tipo de trabajo. Una misma tarea puede aportar en 1, 2 o 3 tipos.

### 4.1 Construir contribuciones por tipo

1. Asbuilt contribution:
- Fecha: `PREASBUILT ACTUAL COMPLETION DATE` dentro del mes.
- Millas: `ASBUILT ROUNDED MILES`
- Assignee source: `Assignee`
- QC source: `PREASBUILT QC BY`

2. Design contribution:
- Fecha: `ACTUAL COMPLETION DATE` dentro del mes.
- Millas: `DESIGN ROUNDED MILES`
- Assignee source: `DESIGN ASSIGNEE`
- QC source: `DESIGN QC BY`

3. Redesign contribution:
- Fecha: `REDESIGN ACTUAL COMPLETION DATE` dentro del mes.
- Millas: `REDESIGN ROUNDED MILES`
- Assignee source: `Assignee`
- QC source: `REDESIGN QC BY`

Si una tarea no tiene ninguna de esas 3 fechas en el mes, no participa en HS de ese mes.

### 4.2 Validacion de millas (regla actual)

1. Asbuilt:
- Valido solo si `ASBUILT ROUNDED MILES >= 1`.
- Invalido: `null`, `0`, cualquier valor `< 1`.

2. Design:
- Valido solo si `DESIGN ROUNDED MILES >= 1`.
- Invalido: `null`, `0`, cualquier valor `< 1`.

3. Redesign:
- Valido si `REDESIGN ROUNDED MILES` no es `null`.
- `0` es valido.

### 4.3 Warnings HS

Por cada contribucion activa del mes:
- Warning si millas invalidas segun regla del tipo.
- Warning si no hay assignee en la fuente del tipo.
- Warning si no hay QC en la fuente del tipo.

Warnings de consistencia (task-level):
- Si la tarea tiene `REDESIGN ACTUAL COMPLETION DATE` y tambien `ACTUAL COMPLETION DATE` o `PREASBUILT ACTUAL COMPLETION DATE`: warning y exclusion de metricas.
- Si `Status = redesign sent` y `PROJECT TYPE != REDESIGN`: warning.
- Si `Status = sent` y `PROJECT TYPE` no es `DESIGN` o `ASBUILT`: warning.
- Si `PROJECT TYPE = REDESIGN` y no hay `REDESIGN ACTUAL COMPLETION DATE`: warning.
- Si hay `REDESIGN ACTUAL COMPLETION DATE` y `PROJECT TYPE != REDESIGN`: warning.

Nota: en HS el `Status` se usa para validaciones de consistencia, pero no para filtrar inclusion mensual.

Regla de exclusion HS:
- Solo el caso de mezcla REDESIGN + DESIGN/ASBUILT excluye la tarea completa de metricas.
- Los demas warnings no excluyen por si solos.

### 4.4 Reparto y agregados HS

1. Reparto por contribucion:
- Asbuilt/Design: repartir solo si millas validas (`>= 1`) y hay usuarios.
- Redesign: repartir solo si millas `> 0` y hay usuarios.
- Nota: `REDESIGN ROUNDED MILES = 0` es valido, pero reparte 0.

2. Total miles del mes:
- Sumar millas de contribuciones no excluidas.
- Asbuilt/Design suman solo si `>= 1`.
- Redesign suma si no es `null` (incluye `0`).

3. Total tasks HS:
- Cantidad de tareas no excluidas que tienen al menos una contribucion activa en el mes.

4. Performance por persona:
- `designerPerformance`: suma de aportes de assignee por contribucion.
- `qcPerformance`: suma de aportes de QC por contribucion.
- `taskCount` por persona: tareas unicas donde tuvo aporte.

5. Combined Production:
- Por disenador, separar acumulados en:
- `asbuiltMiles`
- `designMiles`
- `redesignMiles`
- `totalMiles` (suma de los tres)

## 5) Como replicarlo en Excel (recomendado)

1. Crear hoja `BAU_RAW` con tareas BAU y hoja `HS_RAW` con tareas HS.
2. Si HS se arma desde 3 exportaciones separadas (asbuilt/design/redesign), deduplicar primero por `Task ID`.
3. Crear hoja `BAU_CALC`:
- Filtrar por fecha de completion del mes.
- Calcular puntos por disenador y por QC con division por cantidad de usuarios.
- Hacer tabla dinamica por persona para totales.
4. Crear hoja `HS_CALC` en formato "una fila por contribucion":
- Generar filas tipo `asbuilt`, `design`, `redesign` segun fecha en mes.
- Aplicar regla de millas por tipo.
- Calcular warnings por fila y warnings de consistencia por tarea.
- Excluir de metricas tareas con mezcla REDESIGN + DESIGN/ASBUILT.
- Repartir millas por cantidad de usuarios cuando aplique.
- Agregar por persona (designer y QC) y para combined production.

### 5.1 Formulas operativas (pseudo-Excel)

BAU (fila por tarea):
- `bau_points_valid = ISNUMBER(DESIGN_POINTS)`
- `designer_share = IF(bau_points_valid AND assignee_count>0, DESIGN_POINTS/assignee_count, 0)`
- `qc_share = IF(bau_points_valid AND qc_count>0, DESIGN_POINTS/qc_count, 0)`

HS (fila por contribucion):
- `miles_valid = IF(type=\"redesign\", miles<>BLANK, miles>=1)`
- `count_in_total_miles = IF(type=\"redesign\", miles<>BLANK, miles>=1)`
- `share_enabled = IF(type=\"redesign\", miles>0, miles>=1)`
- `designer_share = IF(share_enabled AND assignee_count>0, miles/assignee_count, 0)`
- `qc_share = IF(share_enabled AND qc_count>0, miles/qc_count, 0)`

## 6) Checklist rapido de QA

1. BAU:
- `Total Tasks` coincide con filtro de fecha.
- `Total Design Points` coincide con suma de `DESIGN POINTS` numericos.

2. HS:
- `ASBUILT ROUNDED MILES` y `DESIGN ROUNDED MILES` nunca cuentan si `< 1`.
- `REDESIGN ROUNDED MILES = 0` no genera warning de millas.
- Tareas con fechas mezcladas de redesign y design/asbuilt quedan fuera de metricas.
- Los warnings listados son trazables por tarea.
