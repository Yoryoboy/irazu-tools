# Irazu Tools

<p align="center">
  <img src="https://img.shields.io/badge/React-18.3.1-61DAFB?style=for-the-badge&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.6.2-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-5.4.10-646CFF?style=for-the-badge&logo=vite" alt="Vite" />
  <img src="https://img.shields.io/badge/Ant_Design-5.22.3-0170FE?style=for-the-badge&logo=ant-design" alt="Ant Design" />
</p>

## 📋 Description

Irazu Tools is an enterprise web application developed to optimize and automate workflows between MQMS and ClickUp. This tool provides a unified interface for task management, time tracking, data verification, and report generation, facilitating synchronization between systems and improving team productivity.

## 🚀 Key Features

### Task Synchronization

- Import and process data from MQMS Excel files
- Bidirectional synchronization with ClickUp through its API
- Automatic comparison between systems to identify discrepancies

### Contractor Production Management

- Task tracking by contractor with custom filters
- Visualization of performance metrics by vendor
- Specialized interface for different project types (BAU, High Split)

### MQMS Verification

- Validation of approved tasks
- Time tracking synchronization between systems`
- Automated quality control for design processes

### Income Reports

- Generation of financial reports based on production data
- Data export in formats compatible with analysis tools

## 🛠️ Technologies Used

### Frontend

- **React 18**: Main library for building interfaces
- **TypeScript**: Static typing to improve code quality
- **React Router**: Navigation between components
- **Ant Design**: Design system for a consistent and professional interface
- **MUI Data Grid**: Advanced tabular data visualization

### Data Processing

- **XLSX/ExcelJS**: Excel file manipulation
- **Axios**: HTTP client for API communication
- **DayJS**: Manipulación avanzada de fechas y horas

### Herramientas de Desarrollo

- **Vite**: Entorno de desarrollo rápido y optimizado
- **ESLint/Prettier**: Garantía de calidad y consistencia del código
- **Vitest**: Framework de testing para componentes y lógica

## 🔄 Flujo de Trabajo

1. **Importación de Datos**: Carga de archivos Excel con información de tareas de MQMS
2. **Procesamiento**: Transformación y validación de datos (incluyendo conversión a tipos adecuados)
3. **Sincronización**: Comunicación con ClickUp para actualizar o crear tareas
4. **Verificación**: Comprobación de consistencia entre sistemas
5. **Reportes**: Generación de informes basados en los datos sincronizados

## 🧩 Arquitectura

La aplicación sigue un patrón de arquitectura modular con:

- **Componentes Reutilizables**: Elementos UI como `FileUploader` y `ExcelUploader`
- **Hooks Personalizados**: Lógica encapsulada para autenticación, filtrado y procesamiento
- **Patrón Result<T>**: Manejo estructurado de errores y respuestas de API
- **Separación de Responsabilidades**: Funciones específicas para sincronización, validación y presentación

## 💼 Soluciones Implementadas

- **Validación de Tipos**: Conversión automática de valores a string para garantizar consistencia
- **Manejo de Estado Local**: Actualización eficiente de componentes sin afectar el estado global
- **Sincronización Asíncrona**: Procesamiento por lotes para mejorar el rendimiento
- **Integración de APIs**: Comunicación robusta con sistemas externos

## 🔧 Instalación y Uso

```bash
# Clonar el repositorio
git clone [url-del-repositorio]

# Instalar dependencias
pnpm install

# Iniciar servidor de desarrollo
pnpm run dev

# Compilar para producción
pnpm run build
```

## 🔒 Configuración

La aplicación requiere configuración de variables de entorno para la conexión con ClickUp:

```
VITE_CLICKUP_API_AKEY=tu_api_key
```

---

Desarrollado por [Tu Nombre] para Irazu © 2025
