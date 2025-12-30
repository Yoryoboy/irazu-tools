# Documentación Danella SDK

## Tabla de Contenidos

- [Introducción](#introducción)
- [Instalación](#instalación)
- [Configuración Inicial](#configuración-inicial)
- [Autenticación](#autenticación)
- [Recursos Disponibles](#recursos-disponibles)
  - [Tasks (Tareas)](#tasks-tareas)
- [Tipos de Datos (DTOs)](#tipos-de-datos-dtos)
- [Manejo de Errores](#manejo-de-errores)
- [Características Avanzadas](#características-avanzadas)
- [Ejemplos Completos](#ejemplos-completos)

---

## Introducción

**Danella SDK** es un SDK moderno escrito en TypeScript para interactuar con la API de Danella. Proporciona una interfaz tipada y fácil de usar para gestionar tareas, autenticación y otros recursos del sistema Danella.

### Características principales

- ✅ **TypeScript nativo**: Tipado completo para mejor experiencia de desarrollo
- ✅ **Manejo automático de tokens**: Refresco automático de tokens de autenticación
- ✅ **Gestión de errores tipada**: Errores específicos para diferentes casos
- ✅ **Cliente HTTP robusto**: Basado en Axios con interceptores configurados
- ✅ **Caché de tokens**: Sistema de caché para optimizar autenticaciones

---

## Instalación

```bash
# Con pnpm (recomendado)
pnpm add workflowSDK

# Con npm
npm install workflowSDK

# Con yarn
yarn add workflowSDK
```

---

## Configuración Inicial

### Crear una instancia del SDK

```typescript
import { DanellaSDK } from 'workflowSDK';

const client = new DanellaSDK({
  apiKey: 'tu-workflow-api-key',
  userId: 31,
  employeeId: 5,
  name: 'Lawrence', // opcional
  baseUrl: 'https://danella-x.com', // opcional, por defecto usa producción
});
```

### Parámetros de configuración

| Parámetro    | Tipo     | Requerido | Descripción                                               |
| ------------ | -------- | --------- | --------------------------------------------------------- |
| `apiKey`     | `string` | ✅ Sí     | Clave API para autenticación en Workflow                  |
| `userId`     | `number` | ✅ Sí     | ID del usuario en el sistema                              |
| `employeeId` | `number` | ✅ Sí     | ID del empleado asociado                                  |
| `name`       | `string` | ❌ No     | Nombre del usuario (opcional)                             |
| `baseUrl`    | `string` | ❌ No     | URL base de la API (por defecto: `https://danella-x.com`) |

---

## Autenticación

### Login

El método `login()` autentica al usuario y obtiene un token de acceso que se almacena automáticamente en el cliente HTTP.

```typescript
// Iniciar sesión
const response = await client.auth.login();

console.log('Token:', response.access_token);
console.log('Tipo:', response.token_type);
console.log('Expira en:', response.expires_in, 'segundos');
```

**Respuesta del login:**

```typescript
interface TokenResponse {
  access_token: string; // Token JWT de acceso
  token_type: string; // Tipo de token (generalmente "Bearer")
  expires_in: number; // Tiempo de expiración en segundos
}
```

### Verificar autenticación

```typescript
// Verificar si el cliente está autenticado
if (client.isAuthenticated()) {
  console.log('Usuario autenticado');
} else {
  console.log('Usuario no autenticado');
}
```

### Obtener token actual

```typescript
// Obtener el token de acceso actual
const token = client.getToken();
console.log('Token actual:', token);
```

### Logout

```typescript
// Cerrar sesión (limpia el token almacenado)
client.auth.logout();
```

### Refresco automático de tokens

El SDK maneja automáticamente el refresco de tokens cuando expiran. Si una petición recibe un error 401, el SDK:

1. Intenta refrescar el token automáticamente llamando a `login()`
2. Reintenta la petición original con el nuevo token
3. Si falla, lanza un `AuthenticationError`

---

## Recursos Disponibles

### Tasks (Tareas)

El recurso `tasks` proporciona métodos para gestionar tareas en el sistema Danella.

#### Obtener campos secundarios de un proyecto

Obtiene la definición de campos secundarios configurados para un proyecto específico.

```typescript
const projectId = 16;
const fields = await client.tasks.getProjectSecondaryFields(projectId);

console.log(`Campos encontrados: ${fields.length}`);
fields.forEach((field) => {
  console.log(`- ${field.fieldName} (ID: ${field.projectSecondaryFieldID})`);
});
```

**Parámetros:**

- `projectId` (number): ID del proyecto

**Retorna:** `Promise<SecondaryFieldDTO[]>`

---

#### Obtener tareas por subproyecto

Obtiene todas las tareas asociadas a un subproyecto específico.

```typescript
const subProjectId = 32;
const tasks = await client.tasks.getBySubProject(subProjectId);

console.log(`Total de tareas: ${tasks.length}`);
tasks.forEach((task) => {
  console.log(`- ${task.taskCode}: ${task.jobID}`);
});
```

**Parámetros:**

- `subProjectId` (number): ID del subproyecto

**Retorna:** `Promise<TaskResponse[]>`

---

#### Obtener tarea por ID

Obtiene los detalles completos de una tarea específica.

```typescript
const taskId = 6394;
const task = await client.tasks.getById(taskId);

console.log('Código de tarea:', task.taskCode);
console.log('Cliente:', task.customerName);
console.log('Estado:', task.taskStatusName);
console.log('Fecha estimada de cierre:', task.estimatedClosingDate);
```

**Parámetros:**

- `id` (number): ID de la tarea

**Retorna:** `Promise<TaskResponse>`

---

#### Crear o actualizar tarea

Crea una nueva tarea o actualiza una existente.

```typescript
// Crear nueva tarea
const newTask = await client.tasks.update({
  subProjectID: 45,
  jobID: 'JOB-2024-001',
  verifierKeyID: 'VK-12345',
  estimatedClosingDate: '2024-12-31T23:59:59Z',
  secondaryFields: [
    { fieldName: 'Campo1', value: 'Valor1' },
    { fieldName: 'Campo2', value: 'Valor2' },
  ],
});

console.log('Tarea creada:', newTask.taskID);
```

**Parámetros:**

- `payload` (TaskCreateDto): Objeto con los datos de la tarea

**Retorna:** `Promise<TaskResponse>`

---

## Tipos de Datos (DTOs)

### SecondaryFieldDTO

Define un campo secundario de un proyecto.

```typescript
interface SecondaryFieldDTO {
  projectSecondaryFieldID: number; // ID único del campo
  projectID: number; // ID del proyecto
  fieldDefinitionID: number; // ID de la definición del campo
  fieldName: string; // Nombre del campo
  deleted: number; // 0 = activo, 1 = eliminado
  createDate: string; // Fecha de creación (ISO 8601)
  userID: number; // ID del usuario creador
}
```

---

### TaskSecondaryFieldValue

Valor de un campo secundario para una tarea.

```typescript
interface TaskSecondaryFieldValue {
  fieldName: string; // Nombre del campo
  value: string | null; // Valor del campo
}
```

---

### TaskCreateDto

DTO para crear o actualizar una tarea.

```typescript
interface TaskCreateDto {
  subProjectID?: number; // ID del subproyecto
  verifierKeyID?: string | null; // Clave de verificación
  jobID?: string | null; // ID del trabajo
  estimatedClosingDate?: string | null; // Fecha estimada de cierre (ISO 8601)
  secondaryFields?: TaskSecondaryFieldValue[] | null; // Campos secundarios
}
```

**Ejemplo:**

```typescript
const taskData: TaskCreateDto = {
  subProjectID: 45,
  jobID: 'JOB-001',
  verifierKeyID: 'VK-12345',
  estimatedClosingDate: new Date('2024-12-31').toISOString(),
  secondaryFields: [
    { fieldName: 'Prioridad', value: 'Alta' },
    { fieldName: 'Categoría', value: 'Desarrollo' },
  ],
};
```

---

### TaskResponse

Respuesta completa de una tarea.

```typescript
interface TaskResponse {
  // Identificadores
  taskID: number;
  taskCode: string;
  jobID: string;
  verifierKeyID: string;

  // Relaciones
  subProjectID: number;
  subProjectName: string | null;
  projectID: number;
  projectName: string | null;

  // Cliente y organización
  endCustomerID: number;
  endCustomerName: string;
  customerID: number;
  customerName: string;
  legalEntityName: string;

  // Gestión
  managerAreaID: number;
  managerAreaName: string;
  supervisorName: string;
  designerName: string;

  // Estado y fechas
  taskStatusID: number;
  taskStatusName: string;
  creationDate: string;
  startDate: string;
  estimatedClosingDate: string;
  endDate: string | null;

  // Finanzas
  forecastRevenueAmount: number;
  forecastCostAmount: number;
  amount: number | null;
  internalCost: number | null;
  vendorCost: number | null;
  profit: number | null;
  margin: number | null;

  // Proveedor
  vendorID: number;
  vendorName: string;

  // Tipos
  projectTypeID: number;
  projectType: string;
  jobTypeID: number;
  jobType: string;

  // Códigos de proyecto
  taskProjectCodesStatusID: number;
  approveDateProjectCodes: string;

  // Otros
  userID: number;
  taskCustomerCostCenterID: number;

  // Objetos relacionados (pueden ser null)
  endCustomer: null | unknown;
  managerArea: null | unknown;
  taskStatus: null | unknown;
  taskProjectCodesStatus: null | unknown;
  costCenter: null | unknown;
}
```

---

## Manejo de Errores

El SDK proporciona clases de error tipadas para diferentes escenarios.

### Tipos de errores

#### DanellaError (Error base)

```typescript
class DanellaError extends Error {
  statusCode?: number;
  response?: unknown;
}
```

#### AuthenticationError (401)

```typescript
class AuthenticationError extends DanellaError {
  // Se lanza cuando falla la autenticación
}
```

#### NotFoundError (404)

```typescript
class NotFoundError extends DanellaError {
  // Se lanza cuando no se encuentra un recurso
}
```

#### ValidationError (400)

```typescript
class ValidationError extends DanellaError {
  // Se lanza cuando hay errores de validación
}
```

### Ejemplo de manejo de errores

```typescript
import {
  DanellaSDK,
  AuthenticationError,
  NotFoundError,
  ValidationError,
  DanellaError,
} from 'workflowSDK';

try {
  const task = await client.tasks.getById(999);
} catch (error) {
  if (error instanceof AuthenticationError) {
    console.error('Error de autenticación:', error.message);
    // Redirigir al login
  } else if (error instanceof NotFoundError) {
    console.error('Tarea no encontrada:', error.message);
    // Mostrar mensaje al usuario
  } else if (error instanceof ValidationError) {
    console.error('Datos inválidos:', error.message);
    // Validar formulario
  } else if (error instanceof DanellaError) {
    console.error('Error de API:', error.message);
    console.error('Código de estado:', error.statusCode);
    console.error('Respuesta:', error.response);
  } else {
    console.error('Error desconocido:', error);
  }
}
```

---

## Características Avanzadas

### Debug de peticiones API

Puedes habilitar el modo debug para ver información detallada de las peticiones HTTP.

```typescript
// En tu archivo .env
DEBUG_API = true;
```

Esto mostrará en consola:

- URL completa de la petición
- Método HTTP
- Headers
- Payload enviado

### Cliente HTTP personalizado

El SDK utiliza internamente un cliente HTTP basado en Axios con las siguientes características:

- **Timeout**: 30 segundos por defecto
- **Interceptores de request**: Inyecta automáticamente el token Bearer
- **Interceptores de response**: Maneja errores y refresco de tokens
- **Cola de peticiones**: Encola peticiones mientras se refresca el token

### Métodos HTTP disponibles

El cliente HTTP interno soporta:

```typescript
// GET
await httpClient.get<T>(url, config?)

// POST
await httpClient.post<T>(url, data?, config?)

// PUT
await httpClient.put<T>(url, data?, config?)

// DELETE
await httpClient.delete<T>(url, config?)
```

---

## Ejemplos Completos

### Ejemplo 1: Flujo completo de autenticación y consulta

```typescript
import { DanellaSDK } from 'workflowSDK';

async function main() {
  // 1. Inicializar SDK
  const client = new DanellaSDK({
    apiKey: process.env.WORKFLOW_API_KEY!,
    userId: parseInt(process.env.USER_ID!),
    employeeId: parseInt(process.env.EMPLOYEE_ID!),
  });

  // 2. Autenticar
  console.log('Autenticando...');
  await client.auth.login();
  console.log('✓ Autenticado');

  // 3. Obtener tareas
  const tasks = await client.tasks.getBySubProject(32);
  console.log(`✓ ${tasks.length} tareas encontradas`);

  // 4. Mostrar información
  tasks.forEach((task) => {
    console.log(`
      Tarea: ${task.taskCode}
      Cliente: ${task.customerName}
      Estado: ${task.taskStatusName}
      Fecha cierre: ${task.estimatedClosingDate}
    `);
  });
}

main().catch(console.error);
```

---

### Ejemplo 2: Crear tarea con campos secundarios

```typescript
import { DanellaSDK, TaskCreateDto } from 'workflowSDK';

async function createTask() {
  const client = new DanellaSDK({
    apiKey: process.env.WORKFLOW_API_KEY!,
    userId: parseInt(process.env.USER_ID!),
    employeeId: parseInt(process.env.EMPLOYEE_ID!),
  });

  await client.auth.login();

  // Primero obtener los campos secundarios del proyecto
  const projectId = 16;
  const fields = await client.tasks.getProjectSecondaryFields(projectId);
  console.log(
    'Campos disponibles:',
    fields.map((f) => f.fieldName),
  );

  // Crear tarea con campos secundarios
  const taskData: TaskCreateDto = {
    subProjectID: 45,
    jobID: 'JOB-2024-001',
    verifierKeyID: 'VK-12345',
    estimatedClosingDate: new Date('2024-12-31').toISOString(),
    secondaryFields: [
      { fieldName: 'Prioridad', value: 'Alta' },
      { fieldName: 'Departamento', value: 'IT' },
      { fieldName: 'Responsable', value: 'Juan Pérez' },
    ],
  };

  const newTask = await client.tasks.update(taskData);
  console.log('✓ Tarea creada:', newTask.taskID);
  console.log('  Código:', newTask.taskCode);
}

createTask().catch(console.error);
```

---

### Ejemplo 3: Manejo robusto de errores

```typescript
import { DanellaSDK, AuthenticationError, NotFoundError, ValidationError } from 'workflowSDK';

async function robustTaskFetch(taskId: number) {
  const client = new DanellaSDK({
    apiKey: process.env.WORKFLOW_API_KEY!,
    userId: parseInt(process.env.USER_ID!),
    employeeId: parseInt(process.env.EMPLOYEE_ID!),
  });

  try {
    // Intentar autenticar
    await client.auth.login();

    // Obtener tarea
    const task = await client.tasks.getById(taskId);
    return { success: true, data: task };
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return {
        success: false,
        error: 'Credenciales inválidas. Verifica tu API key.',
      };
    }

    if (error instanceof NotFoundError) {
      return {
        success: false,
        error: `La tarea ${taskId} no existe.`,
      };
    }

    if (error instanceof ValidationError) {
      return {
        success: false,
        error: 'Datos de entrada inválidos.',
      };
    }

    return {
      success: false,
      error: 'Error inesperado: ' + (error as Error).message,
    };
  }
}

// Uso
const result = await robustTaskFetch(6394);
if (result.success) {
  console.log('Tarea:', result.data);
} else {
  console.error('Error:', result.error);
}
```

---

### Ejemplo 4: Uso con variables de entorno

```typescript
// .env
WORKFLOW_API_KEY=tu-api-key-aqui
USER_ID=31
EMPLOYEE_ID=5
NAME=Lawrence
BASE_URL=https://danella-x.com
```

```typescript
// app.ts
import { DanellaSDK } from 'workflowSDK';
import dotenv from 'dotenv';

dotenv.config();

const client = new DanellaSDK({
  apiKey: process.env.WORKFLOW_API_KEY!,
  userId: parseInt(process.env.USER_ID!),
  employeeId: parseInt(process.env.EMPLOYEE_ID!),
  name: process.env.NAME,
  baseUrl: process.env.BASE_URL,
});
```

---

### Ejemplo 5: Caché de tokens (optimización)

```typescript
import { DanellaSDK } from 'workflowSDK';
import { loadTokenFromCache, saveTokenToCache } from 'workflowSDK/lib/tokenCache';

async function optimizedAuth() {
  const client = new DanellaSDK({
    apiKey: process.env.WORKFLOW_API_KEY!,
    userId: parseInt(process.env.USER_ID!),
    employeeId: parseInt(process.env.EMPLOYEE_ID!),
  });

  // Intentar cargar token desde caché
  const cachedToken = await loadTokenFromCache();

  if (cachedToken) {
    console.log('✓ Usando token en caché');
    client['httpClient'].setToken(cachedToken);
  } else {
    console.log('→ Obteniendo nuevo token...');
    const response = await client.auth.login();
    await saveTokenToCache(response.access_token, response.token_type, response.expires_in);
    console.log('✓ Token guardado en caché');
  }

  // Usar el cliente normalmente
  const tasks = await client.tasks.getBySubProject(32);
  console.log(`✓ ${tasks.length} tareas obtenidas`);
}

optimizedAuth().catch(console.error);
```

---

## Mejores Prácticas

### 1. Gestión de credenciales

❌ **No hacer:**

```typescript
const client = new DanellaSDK({
  apiKey: 'mi-api-key-hardcodeada',
  userId: 31,
  employeeId: 5,
});
```

✅ **Hacer:**

```typescript
import dotenv from 'dotenv';
dotenv.config();

const client = new DanellaSDK({
  apiKey: process.env.WORKFLOW_API_KEY!,
  userId: parseInt(process.env.USER_ID!),
  employeeId: parseInt(process.env.EMPLOYEE_ID!),
});
```

### 2. Manejo de errores

Siempre envuelve las llamadas a la API en bloques try-catch:

```typescript
try {
  const task = await client.tasks.getById(taskId);
  // Procesar tarea
} catch (error) {
  // Manejar error apropiadamente
  console.error('Error al obtener tarea:', error);
}
```

### 3. Validación de datos

Valida los datos antes de enviarlos:

```typescript
function validateTaskData(data: TaskCreateDto): boolean {
  if (!data.subProjectID) {
    throw new Error('subProjectID es requerido');
  }
  if (!data.jobID) {
    throw new Error('jobID es requerido');
  }
  return true;
}

const taskData: TaskCreateDto = {
  /* ... */
};
validateTaskData(taskData);
await client.tasks.update(taskData);
```

### 4. Reutilización de instancias

Crea una única instancia del SDK y reutilízala:

```typescript
// sdk.ts
export const danellaClient = new DanellaSDK({
  apiKey: process.env.WORKFLOW_API_KEY!,
  userId: parseInt(process.env.USER_ID!),
  employeeId: parseInt(process.env.EMPLOYEE_ID!),
});

// En otros archivos
import { danellaClient } from './sdk';
const tasks = await danellaClient.tasks.getBySubProject(32);
```

---

## Soporte y Contribuciones

Para reportar bugs o solicitar nuevas características, contacta al equipo de desarrollo.

## Licencia

ISC
