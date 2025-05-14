# 📖 Documentación: Manejo de Errores en Funciones Asíncronas con `Result<T>` usando Axios

## 📌 Propósito

El objetivo de este patrón es garantizar que todas las funciones asíncronas manejen **correctamente** los errores y los resultados exitosos sin depender de `try/catch` en cada uso.

En lugar de lanzar errores (`throw`), la función devuelve un **objeto estructurado** con:

- **`{ success: true, data: T }`** en caso de éxito ✅
- **`{ success: false, error: { status, message } }`** en caso de error ❌

Esto permite un código **más limpio, predecible y fácil de manejar**.

---

## 1️⃣ Definición del Tipo `Result<T>`

```typescript
/** Tipo para manejar respuestas exitosas y errores en funciones asíncronas */
type Success<T> = { success: true; data: T };
type Failure = { success: false; error: { status: number; message: string } };
export type Result<T> = Success<T> | Failure;
```

---

## 2️⃣ Cómo Implementar `Result<T>` en Funciones Asíncronas con Axios

### Ejemplo: Función para Obtener Datos de una API

```typescript
import axios from "axios";

export async function fetchData(): Promise<Result<MyApiResponse>> {
  try {
    const response = await axios.get<MyApiResponse>(
      "https://api.example.com/data"
    );
    return { success: true, data: response.data };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        error: {
          status: error.response?.status || 500,
          message: error.message,
        },
      };
    }
    return { success: false, error: { status: 500, message: "Unknown error" } };
  }
}
```

📌 **Explicación:**

- Se usa `try/catch` **dentro de la función** para capturar errores de red.
- Se verifica si el error proviene de Axios usando `axios.isAxiosError(error)`.
- No se lanza un `throw error`, sino que **se devuelve un objeto `Failure`** con un mensaje claro.

---

## 3️⃣ Cómo Usar una Función que Retorna `Result<T>`

### **Ejemplo 1: Usando `await`**

```typescript
async function main() {
  const result = await fetchData();

  if (result.success) {
    console.log("✅ Datos recibidos:", result.data);
  } else {
    console.error("❌ Error:", result.error.message);
  }
}

main();
```

✔ **Obliga a manejar el error explícitamente**, sin `try/catch` en cada llamada.
✔ **Más legible y predecible** que manejar excepciones.

---

### **Ejemplo 2: Usando `.then()`**

```typescript
fetchData()
  .then((result) => {
    if (result.success) {
      console.log("✅ Datos recibidos:", result.data);
    } else {
      console.error("❌ Error:", result.error.message);
    }
  })
  .catch((error) => console.error("❌ Error inesperado:", error));
```

✔ **También funciona con `.then()` y `.catch()`**.
✔ **`catch()` solo manejaría errores inesperados (errores de código).**

---

## 4️⃣ Estándares de Implementación

📌 Para mantener la coherencia en el código, **todas las funciones asíncronas que interactúan con APIs deben seguir este patrón**:

1️⃣ **Siempre devolver un `Promise<Result<T>>`.**  
2️⃣ **No lanzar `throw error` en la función** (manejar errores con `Result<T>` en su lugar).  
3️⃣ **Usar `if (result.success)` en lugar de `try/catch` en la llamada a la función.**  
4️⃣ **Asegurar que el `error` contenga `status` y `message` para facilitar el debugging.**

---

## 5️⃣ Otras Variaciones

### 📌 Extender `Result<T>` para Diferentes Tipos de Errores

Si necesitas manejar diferentes tipos de errores (errores de validación, errores de autenticación, etc.), puedes extender `Result<T>`:

```typescript
type ValidationError = {
  success: false;
  error: { status: 400; message: string; fields: string[] };
};
type AuthError = { success: false; error: { status: 401; message: string } };
type GeneralError = {
  success: false;
  error: { status: number; message: string };
};

export type Result<T> = Success<T> | ValidationError | AuthError | GeneralError;
```

✔ Ahora se puede detectar el tipo de error con **`switch-case`** o `if (error.status === 401)`.

---

## 🚀 Conclusión

✔ **Este patrón mejora la legibilidad y seguridad del código.**  
✔ **Evita `try/catch` innecesarios y errores inesperados.**  
✔ **Permite manejar errores de API de forma estructurada y controlada.**  
✔ **Estandariza la forma en que se manejan respuestas asíncronas en el proyecto.**
