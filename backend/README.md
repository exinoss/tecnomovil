# TecnoMovil API - Endpoints

Base URL: `https://localhost:5001/api`

Header requerido (excepto login): `Authorization: Bearer {token}`

---

## Auth

### POST /auth/login

```json
{
  "identificacion": "0000000001",
  "password": "Admin123!"
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
