# Task Sync (MQMS ↔ ClickUp)

Este documento explica en detalle la feature de sincronización de tareas entre MQMS y ClickUp ubicada en `src/pages/TaskSync/`. Aquí se describe el propósito, el flujo completo de extremo a extremo, los componentes y hooks involucrados, las dependencias utilizadas, los datos que consume y produce, y consideraciones/posibles mejoras.

## Propósito
- **Objetivo**: Detectar tareas presentes en un archivo Excel exportado desde MQMS que aún no existen en ClickUp y permitir su creación (una por una o en lote) dentro de una lista de ClickUp específica.
- **Resultado**: Al finalizar, las tareas nuevas se crean en ClickUp con campos personalizados mapeados correctamente, y la UI oculta de la tabla aquellas tareas que ya fueron sincronizadas (estado local).

## Vista general de la arquitectura

- **Directorio de la feature**: `src/pages/TaskSync/`
  - `TaskSyncListSelector.tsx`: Selector de lista (y subtipo para BAU). Prepara `listId` y `searchParams` y renderiza `TaskSync`.
  - `TaskSync.tsx`: Orquestador de la sincronización. Obtiene tareas de ClickUp, procesa el Excel de MQMS y calcula las tareas nuevas a crear. Renderiza el uploader y la tabla.
  - `TaskSync.module.css`: Estilos (actualmente vacío).

- **Componentes y utils usados**:
  - `src/components/ExcelUploader.tsx`: procesa el archivo Excel (con `xlsx`) y entrega las filas como `MQMSTask[]` al estado de `TaskSync`.
  - `src/components/NewTasksTable.tsx`: tabla Ant Design que muestra las tareas nuevas y expone acciones de sincronización individual y masiva.
  - `src/components/tableColumns.tsx`: definición de columnas y botón "Sync Task" por fila.
  - `src/hooks/useClickUp.ts`: hook que obtiene todas las tareas de una lista de ClickUp (paginado) con los filtros de `searchParams` (si los hay).
  - `src/utils/tasksFunctions.ts`: contiene la lógica principal de negocio: comparación MQMS↔ClickUp, construcción de payloads de ClickUp, y llamados para crear tareas.
  - `src/utils/helperFunctions.ts` y `src/constants/clickUpCustomFields.ts`: utilidades y catálogo de campos personalizados de ClickUp (con IDs y opciones) usados para construir correctamente los `custom_fields` al crear tareas.
  - `src/utils/config.ts`: lee `VITE_CLICKUP_API_AKEY` y define los `listId` disponibles.
  - Tipos en `src/types/Task.ts` y `src/types/SearchParams.ts`.

## Flujo de datos: paso a paso

1. **Selección de lista** (`TaskSyncListSelector.tsx`)
   - El usuario elige entre `High Split` o `BAU`. Si elige `BAU`, selecciona además el subtipo: `CCI`, `TrueNet` o `TechServ`.
   - El componente mapea la selección al `listId` real usando `CLICKUP_LIST_IDS` de `src/utils/config.ts`.
   - Se construyen `taskSyncOptions = { listId, searchParams }` (por ahora `searchParams` vacío: `{}`) y se renderiza:
     ```tsx
     <TaskSync listId={taskSyncOptions.listId} searchParams={taskSyncOptions.searchParams} />
     ```

2. **Carga de tareas de ClickUp** (`TaskSync.tsx` + `useFetchClickUpTasks`)
   - `TaskSync` invoca `useFetchClickUpTasks(listId, searchParams)` del hook `src/hooks/useClickUp.ts`.
   - El hook pagina sobre `GET https://api.clickup.com/api/v2/list/:listId/task?page=N&...` usando `fetch` y acumula todas las tareas (`Task[]`) en estado local `clickUpTasks`.
   - Autenticación: header `Authorization` con `import.meta.env.VITE_CLICKUP_API_AKEY` (configurado en `src/utils/config.ts` como `CLICKUP_API_AKEY`).
   - Mientras `clickUpTasks` está vacío, `TaskSync` muestra: "Obteniendo datos de ClickUp...".

3. **Carga y procesamiento del Excel de MQMS** (`ExcelUploader.tsx`)
   - El usuario carga un `.xlsx/.xls` mediante `FileUploader` (AntD `Upload` con `beforeUpload` para no subir el archivo a ningún servidor).
   - Al presionar "Procesar archivo":
     - Se lee la primera hoja con `xlsx` (API `XLSX.read` y `XLSX.utils.sheet_to_json(..., { header: 1 })`).
     - Se infieren `headers` y `rows` y se construyen objetos `{[header]: valor}`.
     - Se limpian los datos conservando sólo estas claves requeridas (`MQMSTask`):
       ```ts
       const DESIRED_KEYS: (keyof MQMSTask)[] = [
         'REQUEST_ID',
         'JOB_NAME',
         'EXTERNAL_ID',
         'SECONDARY_EXTERNAL_ID',
         'REQUEST_NAME',
         'PROJECT_TYPE',
         'NODE_NAME',
         'HUB',
       ];
       ```
     - Se hace `setData(parsedDataCleaned)` hacia el estado `MQMSTasks` de `TaskSync`.

4. **Comparación MQMS ↔ ClickUp** (`getNewTasksFromMqms`)
   - `TaskSync` calcula `newMqmsTasks = getNewTasksFromMqms(MQMSTasks, clickUpTasks)`.
   - Implementación: toma el valor del custom field `'WORK REQUEST ID'` en cada `Task` de ClickUp y lo compara con `REQUEST_ID` de cada fila MQMS. Si el ID no aparece en ClickUp, la fila MQMS se considera "nueva" y se muestra en la tabla.

5. **Visualización de tareas nuevas** (`NewTasksTable.tsx` + `tableColumns.tsx`)
   - `NewTasksTable` arma el `dataSource` y define las columnas con `getColumns(...)`.
   - Por cada fila, hay un botón `Sync Task` que dispara `handleAction(record, newMqmsTasks, setMQMSTasks, listId)`.
   - Debajo de la tabla, hay un botón `Sync All Tasks` que llama `handleSyncAll(newMqmsTasks, setMQMSTasks, listId)` para crear todas las tareas faltantes a la vez.

6. **Creación de tareas en ClickUp** (`tasksFunctions.ts`)
   - `handleAction`/`handleSyncAll` usan:
     - `getNewTask(row, customerCompanyName?)`: construye un objeto `Task` para ClickUp mapeando campos MQMS → `custom_fields` de ClickUp. Ejemplos de campos mapeados:
       - `'PLANT TYPE'`, `'PROJECT TYPE'`, `'JOB TYPE CCI'` (dropdowns con opciones definidas en `clickUpCustomFields.ts`, seleccionadas por nombre; si no se encuentra, se usa `'UNKNOWN'`).
       - `'SECONDARY ID'`, `'NODE'`, `'WORK REQUEST ID'`, `'HUB'` (texto).
       - `'Customer Company'` sólo para listas BAU, inferido desde `listId` (`CCI`, `TRUENET`, `TECHSERV`).
     - `postNewTasks(tasks, listId, apikey)`: hace `POST https://api.clickup.com/api/v2/list/:listId/task` para cada `Task` y retorna un array de resultados `fulfilled/rejected` (usa `Promise.allSettled`).
   - **Actualización de estado local**: si una tarea se crea con éxito, se remueve de `MQMSTasks` mediante `setMQMSTasks(...)`. Esto hace que la UI deje de mostrar esa fila inmediatamente, sin afectar el resto (patrón de estado local).

7. **Mensajería/errores**
   - Éxitos: se registran en consola y la fila desaparece de la tabla.
   - Errores: se registran en consola. Actualmente no hay toasts/alertas UI para errores.

## Componentes/Hooks clave y responsabilidades

- **`TaskSyncListSelector.tsx`**
  - UI de selección de lista (High Split o BAU con subtipo).
  - Obtiene `listId` desde `CLICKUP_LIST_IDS` (`src/utils/config.ts`).
  - Pasa `listId` y `searchParams` a `TaskSync`.

- **`TaskSync.tsx`**
  - Estado `MQMSTasks` (filas de Excel ya limpiadas como `MQMSTask[]`).
  - Llama `useFetchClickUpTasks(listId, searchParams)` para traer `clickUpTasks: Task[]`.
  - Calcula `newMqmsTasks` con `getNewTasksFromMqms` y renderiza la tabla y uploader.

- **`useClickUp.ts`**
  - Hook que pagina la API de ClickUp con `fetch` y construye el arreglo completo de `Task[]`.
  - Usa `CLICKUP_API_AKEY` como token.

- **`ExcelUploader.tsx`**
  - Usa `xlsx` para leer la hoja Excel y devuelve un `MQMSTask[]` con las columnas requeridas.

- **`NewTasksTable.tsx` + `tableColumns.tsx`**
  - Render de tabla y acciones por fila/masivas para sincronizar.

- **`tasksFunctions.ts`**
  - `getNewTasksFromMqms(MQMSTasks, clickUpTasks)`
  - `getNewTask(row, customerCompanyName?)` → arma `Task` con `custom_fields`
  - `postNewTasks(newTasks, listId, apikey)` → crea las tareas en ClickUp (fetch)
  - `handleAction(...)` y `handleSyncAll(...)` → orquestan creación + actualización de estado local

## Fuentes de datos y dependencias

- **Origen MQMS**: archivo Excel proporcionado por el usuario (upload local). Depende de los encabezados esperados que coincidan con `MQMSTask`.
- **Origen ClickUp**: API REST de ClickUp (`/list/:listId/task`). Se requiere `VITE_CLICKUP_API_AKEY` en `.env` (Vite expone variables `VITE_*`).
- **Dependencias clave**:
  - `xlsx` para parsear Excel.
  - `antd` para UI, `Table`, `Radio`, `Button`, etc.
  - `react` y hooks (`useState`, `useEffect`).

## Diagrama de flujo (alto nivel)

```mermaid
flowchart TD
  A[Usuario selecciona lista] --> B[TaskSync recibe listId y searchParams]
  B --> C[useFetchClickUpTasks trae Task[] de ClickUp]
  A --> D[Usuario sube Excel en ExcelUploader]
  D --> E[Parseo y limpieza a MQMSTask[]]
  C --> F[getNewTasksFromMqms compara por WORK REQUEST ID]
  E --> F
  F --> G[NewTasksTable muestra tareas faltantes]
  G --> H[Sync Task / Sync All]
  H --> I[postNewTasks crea en ClickUp]
  I --> J[Actualizar estado local: remover filas exitosas]
```

## Consideraciones y edge cases

- **Headers del Excel**: deben coincidir con las claves esperadas. De lo contrario, se obtendrán campos vacíos y la creación podría fallar o no mapear correctamente.
- **Campo `'WORK REQUEST ID'`** en ClickUp: si una tarea de ClickUp no lo tiene, podría computarse como que hay que crear una nueva (falso positivo). Verifica la consistencia de ese campo en tus listas.
- **Rate limiting ClickUp**: `handleSyncAll` usa `Promise.allSettled` con todos los requests; ante muchos elementos podrías superar límites de 100 req/min. Existe `sendBatchedRequests` en `helperFunctions.ts` que respeta rate limiting (batches + retries). Es recomendable integrarlo a esta feature si se sincronizan grandes volúmenes.
- **Mensajería de errores**: actualmente sólo consola. Podrías integrar toasts (por ejemplo, `sonner`) para feedback al usuario.
- **Autenticación**: asegurarse de tener `VITE_CLICKUP_API_AKEY` configurado en `.env`.

## Alineación con patrones del proyecto y mejoras sugeridas

- **Hook `useClickUp.ts`**: actualmente usa `fetch`. Según las guías del repositorio, conviene refactorizar a usar la instancia `axios` con interceptores + patrón `Result<T>` para manejo de errores consistente.
- **`postNewTasks`**: retorna `fulfilled/rejected` (vía `Promise.allSettled`). Si se adopta el patrón `Result<T>`, se puede dar más uniformidad a la capa de datos.
- **Batching**: reemplazar el `Promise.allSettled` en `handleSyncAll` por `sendBatchedRequests` para evitar rate limit de ClickUp cuando el volumen es alto.
- **Validaciones**: agregar verificación de tipos/valores (p. ej., `PROJECT_TYPE` debe poder partirse en `plantType`, `projectType`, `jobType`), y mostrar errores de usuario si no es posible.
- **UI/UX**: agregar estados de carga (spinners) para creación masiva y mensajes de éxito/error visibles.
- **Import alias**: Vite define alias `'@'` → `./src` en `vite.config.ts`. Se puede migrar imports relativos a este alias para mayor consistencia.

## Resumen técnico de archivos clave

- `src/pages/TaskSync/TaskSyncListSelector.tsx`
  - Radios para `High Split` o `BAU` (+ subtipo). Mapea a `listId` (desde `utils/config.ts`). Renderiza `TaskSync` con `{ listId, searchParams: {} }`.

- `src/pages/TaskSync/TaskSync.tsx`
  - Estado: `MQMSTasks`.
  - Hook: `useFetchClickUpTasks(listId, searchParams)` → `clickUpTasks`.
  - Derivado: `newMqmsTasks = getNewTasksFromMqms(MQMSTasks, clickUpTasks)`.
  - Render: `ExcelUploader`, `NewTasksTable` cuando hay datos.

- `src/hooks/useClickUp.ts`
  - `useFetchClickUpTasks(listId, SearchParams)` → pagina ClickUp con `fetch` y acumula `Task[]`.

- `src/components/ExcelUploader.tsx`
  - Lee Excel con `xlsx`, filtra columnas deseadas y hace `setData(MQMSTask[])`.

- `src/components/NewTasksTable.tsx` y `src/components/tableColumns.tsx`
  - Render de tabla AntD y acciones de sincronización.

- `src/utils/tasksFunctions.ts`
  - `getNewTasksFromMqms`, `getNewTask`, `postNewTasks`, `handleAction`, `handleSyncAll`.

- `src/utils/helperFunctions.ts` y `src/constants/clickUpCustomFields.ts`
  - Mapeos y utilidades para construir correctamente `custom_fields` (IDs y opciones).

## Requisitos previos

- `.env` con la clave:
  ```env
  VITE_CLICKUP_API_AKEY=Bearer <TOKEN_CLICKUP>
  ```
- `CLICKUP_LIST_IDS` en `src/utils/config.ts` debe apuntar a listas válidas.

## Cómo usar la feature (flujo del usuario)

1. Ir a la vista de sincronización y seleccionar la lista objetivo: `High Split` o `BAU` (si BAU, elegir subtipo).
2. Esperar a que el texto cambie de "Obteniendo datos de ClickUp..." (o proceder en paralelo).
3. Subir el Excel de MQMS y presionar "Procesar archivo".
4. Revisar la tabla de tareas nuevas detectadas.
5. Usar `Sync Task` para crear una fila específica o `Sync All Tasks` para crear todas.
6. Verificar en ClickUp que las tareas fueron creadas y que incluyen los `custom_fields` adecuados.

---

Si necesitas que la documentación cubra ejemplos de JSON de ClickUp, formatos de Excel o que incorpore mocks/tests para este flujo, indícamelo y lo agrego.
