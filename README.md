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
- **DayJS**: Advanced date and time manipulation

### Development Tools

- **Vite**: Fast and optimized development environment
- **ESLint/Prettier**: Code quality and consistency assurance
- **Vitest**: Testing framework for components and logic

## 🔄 Workflow

1. **Data Import**: Loading Excel files with MQMS task information
2. **Processing**: Data transformation and validation (including conversion to appropriate types)
3. **Synchronization**: Communication with ClickUp to update or create tasks
4. **Verification**: Checking consistency between systems
5. **Reports**: Generation of reports based on synchronized data

## 🧩 Architecture

The application follows a modular architecture pattern with:

- **Reusable Components**: UI elements like `FileUploader` and `ExcelUploader`
- **Custom Hooks**: Encapsulated logic for authentication, filtering, and processing
- **Result<T> Pattern**: Structured handling of errors and API responses
- **Separation of Concerns**: Specific functions for synchronization, validation, and presentation

## 💼 Implemented Solutions

- **Type Validation**: Automatic conversion of values to string to ensure consistency
- **Local State Management**: Efficient component updates without affecting global state
- **Asynchronous Synchronization**: Batch processing to improve performance
- **API Integration**: Robust communication with external systems

## 🔧 Installation and Usage

```bash
# Clone the repository
git clone [repository-url]

# Install dependencies
pnpm install

# Start development server
pnpm run dev

# Build for production
pnpm run build
```

## 🔒 Configuration

The application requires environment variables configuration for ClickUp connection:

```
VITE_CLICKUP_API_AKEY=your_api_key
```

---

Developed by Jorge Diaz for Irazu © 2025
