# Jornada Laboral App

Aplicación web full stack para registrar el ingreso y egreso de trabajadores durante una jornada laboral.

## Descripción

El sistema permite que un trabajador ingrese su código único, inicie su jornada laboral y visualice un cronómetro en tiempo real con el tiempo laborado. Al finalizar la jornada, el sistema registra la hora de salida y calcula el tiempo total trabajado.

## Funcionalidades principales
*   Registro de inicio de jornada mediante código único.
*   Visualización de cronómetro en tiempo real.
*   Reconexión automática a la sesión si se recarga la página.
*   Registro de finalización de jornada.
*   Cálculo automático del tiempo total laborado.
*   Persistencia en base de datos.
*   Manejo de escenarios de error.
*   Código organizado por responsabilidades.
*   Uso de TypeScript, ESLint y Prettier.

## Stack tecnológico

**Frontend**
*   React
*   TypeScript
*   Vite
*   Tailwind CSS v4
*   shadcn/ui (Radix UI)

**Backend**
*   Node.js
*   Express
*   TypeScript
*   Prisma ORM
*   SQLite

**Herramientas de calidad**
*   ESLint
*   Prettier

## Requisitos previos
*   Node.js 22 LTS o superior (ver `.nvmrc`)
*   npm (para el backend)
*   pnpm o npm (para el frontend)

## Instalación

1.  **Clonar el repositorio:**
    ```bash
    git clone <url-del-repositorio>
    cd jornada-laboral-app
    ```

2.  **Configurar e iniciar el backend:**
    ```bash
    cd backend
    npm install
    cp .env.example .env
    npx prisma migrate dev --name init
    npm run prisma:seed
    npm run dev
    ```

3.  **Configurar e iniciar el frontend:**
    ```bash
    # En otra terminal
    cd frontend
    pnpm install  # o npm install
    pnpm run dev  # o npm run dev
    ```

## Trabajadores de prueba

| Código | Nombre |
| :--- | :--- |
| EMP001 | Carlos Martínez |
| EMP002 | Ana García |
| EMP003 | Luis Rodríguez |
| EMP004 | María Fernández |
| EMP005 | Jorge Sánchez |

## Endpoints principales

*   **Health check:** `GET /health`
*   **Iniciar jornada:** `POST /api/work-sessions/start`
    *   Body: `{ "code": "EMP001" }`
*   **Terminar jornada:** `POST /api/work-sessions/end`
    *   Body: `{ "code": "EMP001" }`
*   **Consultar jornada activa:** `GET /api/work-sessions/active/:code`
*   **Consultar historial:** `GET /api/work-sessions/history/:code`

## Escenarios de error manejados

### 1. Código de trabajador inválido (HTTP 404)
Cuando el código ingresado no pertenece a ningún trabajador registrado, el sistema responde con un error controlado.
*Justificación:* evita registrar jornadas para usuarios no autorizados o inexistentes.

### 2. Jornada activa duplicada (HTTP 409)
Cuando un trabajador intenta iniciar una jornada sin haber terminado la anterior, el sistema bloquea la operación.
*Justificación:* evita duplicidad de jornadas y errores en el cálculo del tiempo laborado.

### 3. Finalización sin jornada activa (HTTP 404)
Cuando un trabajador intenta terminar una jornada que no ha iniciado, el sistema responde con un error controlado.
*Justificación:* protege la consistencia de los registros en base de datos.

### 4. Código vacío o inválido (HTTP 400)
Tanto el frontend (deshabilitando el botón) como el backend (mediante validación) previenen el envío de códigos vacíos.

## Decisiones técnicas

*   Se eligió una arquitectura sencilla por módulos en el backend para separar responsabilidades (`routes` -> `controllers` -> `services`).
*   Se implementó un middleware centralizado para el manejo de errores (`AppError`).
*   El frontend se comunica con el backend mediante un proxy configurado en Vite, lo que evita problemas de CORS en desarrollo.
*   Al recargar la página, el frontend verifica si hay una jornada activa guardada en `localStorage` y la recupera desde el backend, restaurando el cronómetro con el tiempo real.
