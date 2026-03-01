# TecnoMovil - Sistema de Gestión

Aplicación web para gestión de reparaciones, ventas, inventario y clientes para la tienda de tecnologia "TecnoMovil".

- **Backend:** .NET 9 + Entity Framework Core + SQL Server
- **Frontend:** Angular 20 + Tailwind CSS 4

---

## Requisitos previos

- [.NET 9 SDK](https://dotnet.microsoft.com/download)
- [Node.js 20+](https://nodejs.org/) y npm
- SQL Server (local o remoto)

---

## Paso 1 — Crear el archivo `.env` en el backend

Dentro de la carpeta `backend/`, crea un archivo llamado `.env` con las siguientes variables:

```env
DB_SERVER=localhost
DB_PORT=1433
DB_NAME=TecnoMovilDB
DB_USER=
DB_PASSWORD=

JWT_SECRET_KEY=UnaClaveSecretaMuyLargaYSegura123456

ADMIN_NOMBRES=Administrador
ADMIN_CORREO=admin@tecnomovil.com
ADMIN_IDENTIFICACION=
ADMIN_PASSWORD=


```

> ⚠ `JWT_SECRET_KEY` debe tener al menos 32 caracteres.  
> `DB_PORT` es opcional — si lo omites se usa el puerto por defecto de SQL Server (`1433`).  
> Ajusta `DB_SERVER`, `DB_USER` y `DB_PASSWORD` según tu instancia de SQL Server.
> Completa `ADMIN_IDENTIFICACION` y `ADMIN_PASSWORD` con los datos que quieras para el usuario administrador inicial.

---

## Paso 2 — Crear la base de datos en SQL Server

Abre SQL Server Management Studio (o cualquier cliente SQL) y ejecuta:

```sql
CREATE DATABASE TecnoMovilDB;
```

> El nombre debe coincidir exactamente con el valor `DB_NAME` de tu `.env`.

---

## Paso 3 — Aplicar las migraciones (EF Core)

Abre una terminal dentro de la carpeta `backend/` y ejecuta:

```bash
dotnet ef database update
```

Esto creará todas las tablas, índices y restricciones en la base de datos.

> Si no tienes la herramienta `dotnet-ef` instalada, instálala primero:
> ```bash
> dotnet tool install --global dotnet-ef
> ```

---

## Paso 4 — Ejecutar el script de triggers

Las migraciones crean todas las **tablas, índices y constraints** automáticamente. Lo único que **no** incluyen son los triggers de SQL Server, ya que EF Core no los genera.

Debes ejecutar únicamente este script manualmente en SQL Server Management Studio:

| Archivo | Descripción |
|---------|-------------|
| `backend/DatabaseScripts/02_triggers.sql` | Triggers de negocio (inventario, facturación, validaciones) |

> ⚠ **No ejecutes** `01_schema.sql` si usas las migraciones — crearía tablas duplicadas y daría error.  

> Los triggers son **necesarios** para el correcto funcionamiento del inventario, facturación y validaciones de seriales.

---

## Paso 5 — Ejecutar el backend

Dentro de la carpeta `backend/`:

```bash
dotnet run
```

El backend iniciará en:
- HTTPS: `https://localhost:7045`
- HTTP:  `http://localhost:5064`

Puedes verificar que funciona abriendo `https://localhost:7045/swagger` en el navegador.

---

## Paso 6 — Configurar la URL del backend en el frontend

Si el backend corre en un puerto diferente a `7045`, actualiza el archivo:

```
frontend/src/app/environments/environment.ts
```

```typescript
export const environment = {
  production: false,
  apiUrl: 'https://localhost:7045/api'  // ← cambia el puerto aquí si es diferente
};
```

---

## Paso 7 — Instalar dependencias del frontend

Abre una terminal dentro de la carpeta `frontend/` y ejecuta:

```bash
npm install
```

---

## Paso 8 — Ejecutar el frontend

Dentro de la carpeta `frontend/`:

```bash
npm start
```

La aplicación estará disponible en `http://localhost:4200`.

---

## Estructura del proyecto

```
tecnomovil/
├── backend/          # API REST (.NET 9)
│   ├── Controllers/
│   ├── Models/
│   ├── DTOs/
│   ├── Data/
│   ├── Migrations/
│   └── .env          ← debes crearlo (no está en el repositorio)
└── frontend/         # SPA (Angular 20)
    └── src/app/
        ├── core/
        ├── layout/
        ├── pages/
        └── shared/
```
