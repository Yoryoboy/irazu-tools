# 📖 Documentación: Patrón para Llamadas a ClickUp con Axios y Result<T>

## 📌 Propósito

El objetivo de este patrón es estandarizar todas las llamadas a la API de ClickUp utilizando una instancia configurada de Axios y el patrón `Result<T>` para un manejo de errores consistente y predecible.

En lugar de configurar cada llamada individualmente, utilizamos:

- **Una instancia de Axios preconfigurada** con URL base y headers ✅
- **Interceptores** para manejar la autenticación automáticamente ✅
- **El patrón `Result<T>`** para manejar respuestas y errores de forma estructurada ✅

Esto permite un código **más limpio, mantenible y fácil de usar**.

---

## 1️⃣ Configuración de la Instancia de Axios

```typescript
import axios from "axios";
import { CLICKUP_API_AKEY } from "./config";
import { Result } from "../types/AsyncResult";

// Crear una instancia configurada de Axios
const clickUp = axios.create({
  baseURL: "https://api.clickup.com/api/v2",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Agregar interceptor para manejar la autenticación automáticamente
clickUp.interceptors.request.use(
  (config) => {
    config.headers.Authorization = CLICKUP_API_AKEY;
    return config;
  },
  (error) => Promise.reject(error)
);
```

📌 **Explicación:**

- Se crea una instancia de Axios con la URL base de la API de ClickUp.
- Se configuran los headers comunes para todas las peticiones.
- Se agrega un interceptor que añade automáticamente el token de autenticación a cada petición.

---

## 2️⃣ Implementación de Funciones de API con Result<T>

### Ejemplo: Obtener una Tarea

```typescript
export async function getTask(taskId: string): Promise<Result<Task>> {
  try {
    const response = await clickUp.get(`/task/${taskId}`);
    return { success: true, data: response.data };
  } catch (error) {
    console.error(`Error al obtener respuesta de la tarea ${taskId}:`, error);

    if (axios.isAxiosError(error)) {
      return {
        success: false,
        error: {
          status: error.response?.status || 500,
          message: error.message,
        },
      };
    }

    return {
      success: false,
      error: { status: 500, message: "Unknown error" },
    };
  }
}
```

📌 **Explicación:**

- Se usa la instancia `clickUp` para hacer la petición GET.
- Se usa `try/catch` para capturar errores de red o de la API.
- Se verifica si el error proviene de Axios usando `axios.isAxiosError(error)`.
- Se devuelve un objeto `Result<T>` con la estructura adecuada según el resultado.

---

## 3️⃣ Más Ejemplos de Implementación

### Ejemplo: Actualizar un Campo Personalizado

```typescript
export async function updateCustomFieldLabel(
  taskId: string,
  fieldId: string,
  value: boolean
): Promise<Result<any>> {
  try {
    const response = await clickUp.post(`/task/${taskId}/field/${fieldId}`, { value });
    return { success: true, data: response.data };
  } catch (error) {
    console.error(`Error updating field for task ${taskId}:`, error);

    if (axios.isAxiosError(error)) {
      return {
        success: false,
        error: {
          status: error.response?.status || 500,
          message: error.message,
        },
      };
    }

    return {
      success: false,
      error: { status: 500, message: "Unknown error" },
    };
  }
}
```

### Ejemplo: Cambiar el Estado de una Tarea

```typescript
export async function changeTaskStatus(
  taskId: string, 
  status: string
): Promise<Result<any>> {
  try {
    const response = await clickUp.put(`/task/${taskId}`, {
      status: status
    });
    
    return { 
      success: true, 
      data: response.data 
    };
  } catch (error) {
    console.error(`Error updating task ${taskId}:`, error);

    if (axios.isAxiosError(error)) {
      return {
        success: false,
        error: {
          status: error.response?.status || 500,
          message: error.message,
        },
      };
    }

    return {
      success: false,
      error: { status: 500, message: "Unknown error" },
    };
  }
}
```

---

## 4️⃣ Cómo Usar las Funciones de la API

### **Ejemplo 1: Usando `await`**

```typescript
async function handleTaskUpdate() {
  const result = await updateCustomFieldLabel("123456", "field_123", true);
  
  if (result.success) {
    // Manejar éxito
    console.log("Campo actualizado correctamente:", result.data);
    // Actualizar UI, mostrar mensaje de éxito, etc.
  } else {
    // Manejar error
    console.error(`Error (${result.error.status}): ${result.error.message}`);
    // Mostrar mensaje de error, reintentar, etc.
  }
}
```

✔ **Obliga a manejar el error explícitamente**, sin `try/catch` en cada llamada.
✔ **Más legible y predecible** que manejar excepciones.

---

### **Ejemplo 2: Usando `.then()`**

```typescript
getTask("123456")
  .then((result) => {
    if (result.success) {
      // Manejar éxito
      console.log("Tarea obtenida:", result.data);
      // Procesar datos, actualizar UI, etc.
    } else {
      // Manejar error
      console.error(`Error (${result.error.status}): ${result.error.message}`);
      // Mostrar mensaje de error, etc.
    }
  });
```

✔ **También funciona con `.then()`**.
✔ **No es necesario un `.catch()`** ya que los errores ya están manejados dentro de la función.

---

## 5️⃣ Ventajas del Patrón

📌 Este patrón ofrece múltiples ventajas para el desarrollo y mantenimiento del código:

1️⃣ **Consistencia**: Todas las funciones de la API siguen el mismo patrón.  
2️⃣ **Simplificación**: No es necesario especificar la URL completa ni los headers en cada función.  
3️⃣ **Manejo de errores estandarizado**: Todos los errores se manejan de forma consistente.  
4️⃣ **Tipado seguro**: TypeScript garantiza que se manejen correctamente los casos de éxito y error.  
5️⃣ **Mantenimiento**: Cualquier cambio en la configuración se aplica automáticamente a todas las funciones.  
6️⃣ **Legibilidad**: El código es más limpio y fácil de entender.

---

## 6️⃣ Buenas Prácticas

📌 Para mantener la coherencia en el código, **todas las funciones que interactúan con la API de ClickUp deben seguir este patrón**:

1️⃣ **Siempre usar la instancia `clickUp`** en lugar de `fetch` o `axios` directamente.  
2️⃣ **Siempre devolver un `Promise<Result<T>>`** para mantener la consistencia.  
3️⃣ **Siempre manejar los errores** dentro de la función, no propagar excepciones.  
4️⃣ **Siempre verificar `result.success`** al usar estas funciones, no usar `try/catch`.  
5️⃣ **Documentar los tipos de respuesta** para mejorar la experiencia de desarrollo.

---

## 🚀 Conclusión

✔ **Este patrón mejora la legibilidad y mantenibilidad del código.**  
✔ **Evita la duplicación de configuración y código de manejo de errores.**  
✔ **Permite interactuar con la API de ClickUp de forma predecible y consistente.**  
✔ **Estandariza la forma en que se realizan las llamadas a la API en todo el proyecto.**
