# Guía para Agregar un Nuevo Contratista

Esta guía explica paso a paso cómo agregar un nuevo contratista (vendor) al sistema de producción de vendors.

---

## 📋 Tabla de Contenidos

1. [Requisitos Previos](#requisitos-previos)
2. [Paso 1: Agregar Vendor a la Configuración](#paso-1-agregar-vendor-a-la-configuración)
3. [Paso 2: Obtener Tareas Filtradas](#paso-2-obtener-tareas-filtradas)
4. [Paso 3: Agregar al Hook de Consolidación](#paso-3-agregar-al-hook-de-consolidación)
5. [Paso 4: Agregar Tablas en el Render](#paso-4-agregar-tablas-en-el-render)
6. [Checklist de Verificación](#checklist-de-verificación)
7. [Ejemplos Completos](#ejemplos-completos)

---

## Requisitos Previos

Antes de agregar un nuevo contratista, asegúrate de tener:

- ✅ **ID del usuario en ClickUp** del nuevo contratista
- ✅ **Nombre completo** del contratista
- ✅ **Tipo de tareas** que realizará (Asbuilt, Design, Redesign, BAU, o combinación)
- ✅ Acceso al código fuente del proyecto

---

## Paso 1: Agregar Vendor a la Configuración

### Archivo: `VendorProduction.vendors.ts`

Agrega el nuevo vendor al objeto `vendors`:

```typescript
export const vendors = {
  // ... vendors existentes ...

  // Nuevo vendor
  nuevoVendor: {
    id: 123456789, // ID del usuario en ClickUp
    username: 'Nombre Completo del Vendor',
  },
};
```

**Ejemplo:**

```typescript
export const vendors = {
  anaisDelValleArchilaGonzalez: {
    id: 81004963,
    username: 'Anais Del Valle Archila Gonzalez',
  },
  // ... otros vendors ...

  // Nuevo vendor: María García
  mariaGarcia: {
    id: 987654321,
    username: 'María García',
  },
};
```

---

## Paso 2: Obtener Tareas Filtradas

### Archivo: `VendorProduction.tsx`

Dependiendo del tipo de tareas que realice el vendor, agrega los hooks correspondientes:

### Opción A: Vendor con Asbuilt, Design y Redesign

```typescript
function VendorProduction() {
  const {
    // ... vendors existentes ...
    nuevoVendor, // Agregar aquí
  } = vendors;

  // ... código existente ...

  // Nuevo Vendor - Asbuilt, Design, Redesign
  const { filteredTasks: asbuiltForNuevoVendor } = useFilteredTasks(
    getAsbuiltSearchParamsForVendor(nuevoVendor.id.toString())
  );

  const { filteredTasks: designForNuevoVendor } = useFilteredTasks(
    getDesignSearchParamsForVendor(nuevoVendor.id.toString())
  );

  const { filteredTasks: redesignForNuevoVendor } = useFilteredTasks(
    getRedesignSearchParamsForVendor(nuevoVendor.id.toString())
  );
}
```

### Opción B: Vendor solo con BAU

```typescript
function VendorProduction() {
  const {
    // ... vendors existentes ...
    nuevoVendor, // Agregar aquí
  } = vendors;

  // ... código existente ...

  // Nuevo Vendor - Solo BAU
  const { filteredTasks: bauForNuevoVendor } = useFilteredTasks(
    getBAUSearchParamsForVendor(nuevoVendor.id.toString())
  );
}
```

### Opción C: Vendor con Todos los Tipos

```typescript
function VendorProduction() {
  const {
    // ... vendors existentes ...
    nuevoVendor, // Agregar aquí
  } = vendors;

  // ... código existente ...

  // Nuevo Vendor - Todos los tipos
  const { filteredTasks: asbuiltForNuevoVendor } = useFilteredTasks(
    getAsbuiltSearchParamsForVendor(nuevoVendor.id.toString())
  );

  const { filteredTasks: designForNuevoVendor } = useFilteredTasks(
    getDesignSearchParamsForVendor(nuevoVendor.id.toString())
  );

  const { filteredTasks: redesignForNuevoVendor } = useFilteredTasks(
    getRedesignSearchParamsForVendor(nuevoVendor.id.toString())
  );

  const { filteredTasks: bauForNuevoVendor } = useFilteredTasks(
    getBAUSearchParamsForVendor(nuevoVendor.id.toString())
  );
}
```

---

## Paso 3: Agregar al Hook de Consolidación

### Archivo: `VendorProduction.tsx`

Agrega el nuevo vendor al hook `useConsolidatedVendorTasks`:

### Opción A: Vendor con Asbuilt, Design y Redesign

```typescript
const allTasks = useConsolidatedVendorTasks({
  // ... vendors existentes ...

  nuevoVendor: {
    asbuilts: asbuiltForNuevoVendor,
    designs: designForNuevoVendor,
    redesigns: redesignForNuevoVendor,
  },
});
```

### Opción B: Vendor solo con BAU

```typescript
const allTasks = useConsolidatedVendorTasks({
  // ... vendors existentes ...

  nuevoVendor: {
    bau: bauForNuevoVendor,
  },
});
```

### Opción C: Vendor con Todos los Tipos

```typescript
const allTasks = useConsolidatedVendorTasks({
  // ... vendors existentes ...

  nuevoVendor: {
    asbuilts: asbuiltForNuevoVendor,
    designs: designForNuevoVendor,
    redesigns: redesignForNuevoVendor,
    bau: bauForNuevoVendor,
  },
});
```

---

## Paso 4: Agregar Tablas en el Render

### Archivo: `VendorProduction.tsx`

Agrega las tablas correspondientes en el `return` del componente:

### Opción A: Vendor con Asbuilt, Design y Redesign

```typescript
return (
  <main>
    <GlobalUpdateButton {...props} />

    {/* ... tablas existentes ... */}

    {/* Nuevo Vendor */}
    <VendorProductionTable
      asbuilts={asbuiltForNuevoVendor}
      designs={designForNuevoVendor}
      redesigns={redesignForNuevoVendor}
      vendor={nuevoVendor}
    />
  </main>
);
```

### Opción B: Vendor solo con BAU

```typescript
return (
  <main>
    <GlobalUpdateButton {...props} />

    {/* ... tablas existentes ... */}

    {/* Nuevo Vendor */}
    <VendorBauProductionTable
      bau={bauForNuevoVendor}
      vendor={nuevoVendor}
    />
  </main>
);
```

### Opción C: Vendor con Todos los Tipos

```typescript
return (
  <main>
    <GlobalUpdateButton {...props} />

    {/* ... tablas existentes ... */}

    {/* Nuevo Vendor - BAU */}
    <VendorBauProductionTable
      bau={bauForNuevoVendor}
      vendor={nuevoVendor}
    />

    {/* Nuevo Vendor - Proyectos */}
    <VendorProductionTable
      asbuilts={asbuiltForNuevoVendor}
      designs={designForNuevoVendor}
      redesigns={redesignForNuevoVendor}
      vendor={nuevoVendor}
    />
  </main>
);
```

---

## Checklist de Verificación

Antes de considerar completada la integración, verifica:

- [ ] ✅ Vendor agregado a `VendorProduction.vendors.ts` con ID correcto
- [ ] ✅ Vendor desestructurado del objeto `vendors` en el componente
- [ ] ✅ Hooks `useFilteredTasks` agregados para los tipos de tareas correspondientes
- [ ] ✅ Vendor agregado al hook `useConsolidatedVendorTasks`
- [ ] ✅ Tablas agregadas en el `return` del componente
- [ ] ✅ Orden de las tablas es lógico (por ejemplo, alfabético o por tipo)
- [ ] ✅ Comentarios agregados para identificar la sección del vendor
- [ ] ✅ Código compila sin errores de TypeScript
- [ ] ✅ Probado en desarrollo que las tareas se muestran correctamente
- [ ] ✅ Probado que el botón "Update All Vendor Tasks" incluye las tareas del nuevo vendor
- [ ] ✅ Probado que los botones individuales funcionan en las tablas del vendor

---

## Ejemplos Completos

### Ejemplo 1: Agregar "María García" (Solo BAU)

#### 1. `VendorProduction.vendors.ts`

```typescript
export const vendors = {
  // ... vendors existentes ...
  mariaGarcia: {
    id: 987654321,
    username: 'María García',
  },
};
```

#### 2. `VendorProduction.tsx` - Imports y desestructuración

```typescript
function VendorProduction() {
  const {
    anaisDelValleArchilaGonzalez,
    beatrizLeal,
    nathaly,
    barbaraGarcia,
    eliusmir,
    carlos,
    rosaAtempa,
    mariaGarcia, // ← Nuevo
  } = vendors;
```

#### 3. `VendorProduction.tsx` - Obtener tareas

```typescript
// ... código existente ...

// María García
const { filteredTasks: bauForMariaGarcia } = useFilteredTasks(
  getBAUSearchParamsForVendor(mariaGarcia.id.toString())
);
```

#### 4. `VendorProduction.tsx` - Consolidación

```typescript
const allTasks = useConsolidatedVendorTasks({
  anais: {
    /* ... */
  },
  beatriz: {
    /* ... */
  },
  nathaly: {
    /* ... */
  },
  barbara: {
    /* ... */
  },
  eliusmir: {
    /* ... */
  },
  carlos: {
    /* ... */
  },
  rosa: {
    /* ... */
  },
  mariaGarcia: {
    // ← Nuevo
    bau: bauForMariaGarcia,
  },
});
```

#### 5. `VendorProduction.tsx` - Render

```typescript
  return (
    <main>
      <GlobalUpdateButton {...props} />
      {/* ... tablas existentes ... */}
      <VendorBauProductionTable bau={bauForMariaGarcia} vendor={mariaGarcia} />
    </main>
  );
```

---

### Ejemplo 2: Agregar "Pedro Rodríguez" (Asbuilt, Design, Redesign)

#### 1. `VendorProduction.vendors.ts`

```typescript
export const vendors = {
  // ... vendors existentes ...
  pedroRodriguez: {
    id: 123456789,
    username: 'Pedro Rodríguez',
  },
};
```

#### 2. `VendorProduction.tsx` - Imports y desestructuración

```typescript
function VendorProduction() {
  const {
    anaisDelValleArchilaGonzalez,
    beatrizLeal,
    nathaly,
    barbaraGarcia,
    eliusmir,
    carlos,
    rosaAtempa,
    pedroRodriguez, // ← Nuevo
  } = vendors;
```

#### 3. `VendorProduction.tsx` - Obtener tareas

```typescript
// ... código existente ...

// Pedro Rodríguez
const { filteredTasks: asbuiltForPedroRodriguez } = useFilteredTasks(
  getAsbuiltSearchParamsForVendor(pedroRodriguez.id.toString())
);

const { filteredTasks: designForPedroRodriguez } = useFilteredTasks(
  getDesignSearchParamsForVendor(pedroRodriguez.id.toString())
);

const { filteredTasks: redesignForPedroRodriguez } = useFilteredTasks(
  getRedesignSearchParamsForVendor(pedroRodriguez.id.toString())
);
```

#### 4. `VendorProduction.tsx` - Consolidación

```typescript
const allTasks = useConsolidatedVendorTasks({
  anais: {
    /* ... */
  },
  beatriz: {
    /* ... */
  },
  nathaly: {
    /* ... */
  },
  barbara: {
    /* ... */
  },
  eliusmir: {
    /* ... */
  },
  carlos: {
    /* ... */
  },
  rosa: {
    /* ... */
  },
  pedroRodriguez: {
    // ← Nuevo
    asbuilts: asbuiltForPedroRodriguez,
    designs: designForPedroRodriguez,
    redesigns: redesignForPedroRodriguez,
  },
});
```

#### 5. `VendorProduction.tsx` - Render

```typescript
  return (
    <main>
      <GlobalUpdateButton {...props} />
      {/* ... tablas existentes ... */}
      <VendorProductionTable
        asbuilts={asbuiltForPedroRodriguez}
        designs={designForPedroRodriguez}
        redesigns={redesignForPedroRodriguez}
        vendor={pedroRodriguez}
      />
    </main>
  );
```

---

## 🚨 Errores Comunes y Soluciones

### Error 1: "Cannot read property 'id' of undefined"

**Causa**: Olvidaste desestructurar el vendor del objeto `vendors`

**Solución**: Agrega el vendor a la desestructuración:

```typescript
const {
  // ... otros vendors ...
  nuevoVendor, // ← Agregar aquí
} = vendors;
```

---

### Error 2: "Property 'nuevoVendor' does not exist on type..."

**Causa**: No agregaste el vendor a `VendorProduction.vendors.ts`

**Solución**: Agrega el vendor al archivo de configuración primero

---

### Error 3: Las tareas no aparecen en el botón global

**Causa**: Olvidaste agregar el vendor al hook `useConsolidatedVendorTasks`

**Solución**: Agrega el vendor con sus tareas correspondientes al hook

---

### Error 4: TypeScript marca error en useConsolidatedVendorTasks

**Causa**: El hook espera propiedades específicas (anais, beatriz, nathaly, etc.)

**Solución**: Si necesitas agregar un vendor nuevo, debes:

1. Actualizar la interfaz `UseConsolidatedVendorTasksProps` en `useConsolidatedVendorTasks.ts`
2. Agregar la lógica de procesamiento en el hook

**Ejemplo:**

```typescript
// En useConsolidatedVendorTasks.ts
interface UseConsolidatedVendorTasksProps {
  anais: VendorTasks;
  beatriz: VendorTasks;
  nathaly: VendorTasks;
  barbara: VendorTasks;
  eliusmir: VendorTasks;
  carlos: VendorTasks;
  rosa: VendorTasks;
  nuevoVendor: VendorTasks; // ← Agregar aquí
}

// Luego en el hook:
export function useConsolidatedVendorTasks({
  anais,
  beatriz,
  nathaly,
  barbara,
  eliusmir,
  carlos,
  rosa,
  nuevoVendor, // ← Agregar aquí
}: UseConsolidatedVendorTasksProps) {
  return useMemo(() => {
    // ... código existente ...

    // Procesar nuevo vendor
    if (nuevoVendor.bau) {
      const nuevoVendorBau = processBauTasks(nuevoVendor.bau);
      consolidatedTasks.push(...nuevoVendorBau);
    }

    return consolidatedTasks;
  }, [anais, beatriz, nathaly, barbara, eliusmir, carlos, rosa, nuevoVendor]);
}
```

---

## 📝 Notas Adicionales

### Orden de las Tablas

Se recomienda mantener un orden consistente:

1. Primero vendors con tareas de proyecto (Asbuilt, Design, Redesign)
2. Luego vendors solo con BAU
3. Dentro de cada grupo, orden alfabético

### Naming Convention

- Usa camelCase para el nombre del vendor en el código
- Ejemplo: `mariaGarcia`, `pedroRodriguez`, `anaisDelValleArchilaGonzalez`
- El username puede tener espacios y mayúsculas: `"María García"`

### Performance

- El sistema usa `useMemo` para optimizar el rendimiento
- No te preocupes por agregar muchos vendors, el sistema está optimizado

### Rate Limiting

- El botón global automáticamente incluirá las tareas del nuevo vendor
- El sistema respeta el límite de 100 requests/min de ClickUp
- No necesitas configurar nada adicional para el rate limiting

---

## 🎯 Resumen Rápido

Para agregar un nuevo vendor:

1. **Agregar a `VendorProduction.vendors.ts`** con ID y username
2. **Desestructurar** del objeto `vendors` en el componente
3. **Agregar hooks** `useFilteredTasks` según tipo de tareas
4. **Agregar al hook** `useConsolidatedVendorTasks` (y actualizar su interfaz si es necesario)
5. **Agregar tabla(s)** en el `return` del componente
6. **Verificar** que todo funciona correctamente

**Última actualización**: 2025-10-02  
**Versión del sistema**: 2.0 (Refactorizado con hooks y componentes modulares)
