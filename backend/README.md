# Backend — TecnoMovil API

API REST para el sistema de gestión TecnoMovil construida con **.NET 9** + **Entity Framework Core** + **SQL Server**.

---

## Stack

- **.NET 9** (ASP.NET Core Web API)
- **Entity Framework Core** (ORM + migraciones)
- **SQL Server** (base de datos)
- **JWT** (autenticación con BCrypt para hashes)
- **Gemini API** (análisis de inventario con IA)
- **SMTP** (envío de correos)

---

## Requisitos previos

- [.NET 9 SDK](https://dotnet.microsoft.com/download)
- [SQL Server](https://www.microsoft.com/sql-server) (local o remoto)
- Herramienta `dotnet-ef`:
  ```bash
  dotnet tool install --global dotnet-ef
  ```

---

## Configuración

### 1. Crear el archivo `.env`

Dentro de `backend/` crea un archivo `.env`:

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

GEMINI_API_KEY=key

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=
SMTP_FROM_NAME=
```

> `JWT_SECRET_KEY` debe tener al menos 32 caracteres.  
> Completa `ADMIN_IDENTIFICACION` y `ADMIN_PASSWORD` con los datos del usuario admin inicial.

### 2. Crear la base de datos

```sql
CREATE DATABASE TecnoMovilDB;
```

> El nombre debe coincidir con `DB_NAME` del `.env`.

### 3. Aplicar migraciones

```bash
cd backend
dotnet ef database update
```

Esto crea tablas, índices y constraints. **No** ejecutes `01_schema.sql` si usas migraciones.

### 4. Ejecutar scripts SQL manuales

Las migraciones no incluyen triggers ni datos semilla. Ejecuta en SQL Server Management Studio:

| Archivo | Descripción |
|---------|-------------|
| `DatabaseScripts/02_triggers.sql` | Triggers de negocio (inventario, facturación, seriales) |
| `DatabaseScripts/03_seed.sql` | Datos iniciales (opcional) |
| `DatabaseScripts/04_DatosParaIA.sql` | Datos de ejemplo para análisis IA (opcional) |

> `02_triggers.sql` es **obligatorio** para el correcto funcionamiento del inventario y facturación.

### 5. Ejecutar la API

```bash
dotnet run
```

- HTTPS: `https://localhost:7045`
- HTTP: `http://localhost:5064`
- Swagger: `https://localhost:7045/swagger`

---

## Estructura

```
backend/
├── Controllers/        # endpoints de la API
├── Models/             # entidades de EF Core
├── DTOs/               # objetos de transferencia de datos
├── Data/               # TecnoMovilDbContext + configuración
├── Migrations/         # migraciones de EF Core
├── Services/           # AnalisisIAService, EmailService
├── DatabaseScripts/    # scripts SQL (triggers, seed, datos IA)
├── Properties/         # launchSettings.json
└── .env                ← debes crearlo (no está en el repositorio)
```

---

# Endpoints

Base URL: `https://localhost:7045/api`

Header requerido (excepto login y recuperación): `Authorization: Bearer {token}`

---

## Auth

### POST /auth/login

```json
{
  "identificacion": "0000000001",
  "password": "Admin123!"
}
```

### POST /auth/solicitar-codigo

Envía un código de 6 dígitos al correo del usuario (vence en 5 min, máx. 3 por día).

```json
{
  "correo": "admin@tecnomovil.com"
}
```

### POST /auth/verificar-codigo

```json
{
  "correo": "admin@tecnomovil.com",
  "codigo": "123456"
}
```

### POST /auth/resetear-contrasenia

```json
{
  "correo": "admin@tecnomovil.com",
  "codigo": "123456",
  "nuevaPassword": "NuevaPassword123!"
}
```

---

## Categorias

### GET /categorias

### GET /categorias/activas

### GET /categorias/{id}

### POST /categorias

```json
{
  "nombreCategoria": "Celulares",
  "activo": true
}
```

### PUT /categorias/{id}

```json
{
  "nombreCategoria": "Celulares",
  "activo": true
}
```

### DELETE /categorias/{id}

---

## Productos

### GET /productos

### GET /productos/activos

### GET /productos/{id}

### GET /productos/categoria/{idCategoria}

### GET /productos/buscar?termino={texto}

### POST /productos

```json
{
  "idCategoria": 1,
  "nombreProducto": "iPhone 15 Pro",
  "imagen": "url_imagen",
  "descripcion": "256GB Negro",
  "precioVenta": 1299.99,
  "esSerializado": true,
  "activo": true
}
```

### PUT /productos/{id}

```json
{
  "idCategoria": 1,
  "nombreProducto": "iPhone 15 Pro",
  "imagen": "url_imagen",
  "descripcion": "256GB Negro",
  "precioVenta": 1299.99,
  "esSerializado": true,
  "activo": true
}
```

### DELETE /productos/{id}

### GET /productos/{idProducto}/seriales

### GET /productos/{idProducto}/seriales/disponibles

### POST /productos/{idProducto}/seriales

```json
{
  "numeroSerieImei": "123456789012345"
}
```

### PUT /productos/seriales/{idSerial}

```json
{
  "numeroSerieImei": "123456789012345",
  "estado": "Disponible"
}
```

---

## Clientes

### GET /clientes

### GET /clientes/activos

### GET /clientes/{id}

### GET /clientes/identificacion/{identificacion}

### GET /clientes/buscar?termino={texto}

### POST /clientes

```json
{
  "nombres": "Juan Perez",
  "telefono": "0991234567",
  "email": "juan@email.com",
  "identificacion": "0912345678",
  "tipoIdentificacion": "Cedula",
  "activo": true
}
```

### PUT /clientes/{id}

```json
{
  "nombres": "Juan Perez",
  "telefono": "0991234567",
  "email": "juan@email.com",
  "identificacion": "0912345678",
  "tipoIdentificacion": "Cedula",
  "activo": true
}
```

### DELETE /clientes/{id}

---

## Usuarios (Solo Admin)

### GET /usuarios

### GET /usuarios/activos

### GET /usuarios/tecnicos

### GET /usuarios/{id}

### POST /usuarios

```json
{
  "nombres": "Maria Lopez",
  "correo": "maria@tecnomovil.com",
  "identificacion": "0987654321",
  "tipoIdentificacion": "Cedula",
  "password": "Password123!",
  "rol": "Tecnico",
  "activo": true
}
```

### PUT /usuarios/{id}

```json
{
  "nombres": "Maria Lopez",
  "correo": "maria@tecnomovil.com",
  "identificacion": "0987654321",
  "tipoIdentificacion": "Cedula",
  "password": "",
  "rol": "Tecnico",
  "activo": true
}
```

### DELETE /usuarios/{id}

### PUT /usuarios/{id}/cambiar-password

```json
{
  "nuevaPassword": "NuevaPassword123!"
}
```

---

## Reparaciones

### GET /reparaciones

### GET /reparaciones/{id}

### GET /reparaciones/cliente/{idCliente}

### GET /reparaciones/tecnico/{idUsuario}

### GET /reparaciones/estado/{estado}

Estados: Recibido, Cotizado, Aprobado, En Proceso, Reparado, Entregado, Rechazado, Cancelado

### POST /reparaciones

```json
{
  "idCliente": 1,
  "idUsuario": 2,
  "modeloEquipo": "Samsung Galaxy S24",
  "serieImeiIngreso": "123456789012345",
  "descripcionFalla": "Pantalla rota"
}
```

### PUT /reparaciones/{id}

```json
{
  "idCliente": 1,
  "idUsuario": 2,
  "modeloEquipo": "Samsung Galaxy S24",
  "serieImeiIngreso": "123456789012345",
  "descripcionFalla": "Pantalla rota",
  "diagnosticoFinal": "Requiere cambio de display",
  "costoManoObra": 25.0,
  "estado": "Cotizado"
}
```

### PUT /reparaciones/{id}/estado

```json
{
  "estado": "En Proceso"
}
```

### PUT /reparaciones/{id}/aprobar

```json
{
  "aprobado": true,
  "motivoRechazo": null
}
```

### GET /reparaciones/{id}/repuestos

### POST /reparaciones/{id}/repuestos

```json
{
  "idProducto": 5,
  "idSerial": null,
  "cantidad": 1,
  "costoUnitario": 80.0,
  "precioCobrado": 120.0
}
```

### DELETE /reparaciones/repuestos/{idRepuesto}

---

## Facturas

### GET /facturas

### GET /facturas/{id}

### GET /facturas/cliente/{idCliente}

### GET /facturas/fecha?desde={fecha}&hasta={fecha}

### POST /facturas

```json
{
  "idCliente": 1,
  "detalles": [
    {
      "idProducto": 3,
      "idSerial": null,
      "cantidad": 2,
      "precioUnitario": 15.99,
      "tipoItem": "Venta Directa"
    }
  ],
  "reparacionIds": [1]
}
```

### POST /facturas/{id}/detalles

```json
{
  "idProducto": 3,
  "idSerial": null,
  "idReparacion": null,
  "descripcionItem": "Funda protectora",
  "cantidad": 1,
  "precioUnitario": 15.99,
  "tipoItem": "Venta Directa"
}
```

### DELETE /facturas/detalles/{idDetalle}

---

## Configuracion (Solo Admin)

### GET /configuracion

### PUT /configuracion

```json
{
  "ivaPorcentaje": 15.0
}
```

---

## Atributos

### GET /atributos

### GET /atributos/activos

### GET /atributos/{id}

### POST /atributos

```json
{
  "nombreAtributo": "Capacidad",
  "tipoDato": "texto",
  "unidad": "GB",
  "activo": true
}
```

tipoDato: texto, numero, bool, fecha

### PUT /atributos/{id}

```json
{
  "nombreAtributo": "Capacidad",
  "tipoDato": "texto",
  "unidad": "GB",
  "activo": true
}
```

### DELETE /atributos/{id}

### GET /atributos/producto/{idProducto}

### POST /atributos/producto

```json
{
  "idProducto": 1,
  "idAtributo": 1,
  "valorTexto": "256GB",
  "valorNumero": null,
  "valorBool": null,
  "valorFecha": null
}
```

### DELETE /atributos/producto/{idProducto}/{idAtributo}

---

## Inventario

### GET /inventario?limite={n}

### GET /inventario/producto/{idProducto}

### GET /inventario/tipo/{tipo}

### GET /inventario/fecha?desde={fecha}&hasta={fecha}

### GET /inventario/stock-bajo?minimo={n}

### POST /inventario (Solo Admin)

```json
{
  "idProducto": 1,
  "idSerial": null,
  "tipo": "Compra",
  "cantidad": 10,
  "referenciaTabla": null,
  "referenciaId": null,
  "detalle": "Compra inicial de inventario"
}
```

Tipos: Compra, Venta, ConsumoReparacion, Ajuste, Devolucion

---

## Analisis IA

### POST /analisis/generar

### GET /analisis/ultimo

### GET /analisis/historial

### GET /analisis/{id}

---

## Email

### POST /email/enviar

Envía un correo (HTML o texto plano) con adjuntos opcionales.

```json
{
  "destinatario": "cliente@email.com",
  "nombreDestinatario": "Juan Perez",
  "asunto": "Factura de compra",
  "cuerpo": "<h1>Gracias por su compra</h1>",
  "esTextoPlano": false,
  "adjuntos": [
    {
      "nombre": "factura.pdf",
      "base64": "...",
      "contentType": "application/pdf"
    }
  ]
}
```
