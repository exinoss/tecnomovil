/* ============================================================
   SCRIPT 1: BD
   ============================================================ */

 CREATE DATABASE tecnomovilbd;
 GO
 USE tecnomovilbd;
 GO

/* =========================
   0) Configuración (IVA)
   ========================= */
CREATE TABLE dbo.Configuracion (
    id_config INT NOT NULL PRIMARY KEY
      CONSTRAINT CK_Configuracion_UnaFila CHECK (id_config = 1),
    iva_porcentaje DECIMAL(5,2) NOT NULL
      CHECK (iva_porcentaje >= 0)
);
GO

-- valores por defecto para el iva en la configuración
INSERT INTO dbo.Configuracion(id_config, iva_porcentaje) VALUES (1, 15.00);
GO

/* =========================
   1) Categoria
   ========================= */
CREATE TABLE dbo.Categoria (
    id_categoria INT IDENTITY(1,1) PRIMARY KEY,
    nombre_categoria VARCHAR(50) NOT NULL,
    activo BIT NOT NULL DEFAULT 1
);
GO

/* =========================
   2) Producto
   ========================= */
CREATE TABLE dbo.Producto (
    id_producto INT IDENTITY(1,1) PRIMARY KEY,
    id_categoria INT NOT NULL,
    nombre_producto VARCHAR(255) NOT NULL, 
    imagen VARCHAR(MAX) NULL,
    descripcion VARCHAR(MAX) NULL,

    stock_actual INT NOT NULL DEFAULT 0, -- se ajusta por Movimiento_Inventario

    precio_venta DECIMAL(18,2) NOT NULL,
    es_serializado BIT NOT NULL DEFAULT 0,
    activo BIT NOT NULL DEFAULT 1,

    CONSTRAINT FK_Producto_Categoria
      FOREIGN KEY (id_categoria) REFERENCES dbo.Categoria(id_categoria)
);
GO

/* =========================
   3) Producto_Serial (IMEI)
   ========================= */
CREATE TABLE dbo.Producto_Serial (
    id_serial INT IDENTITY(1,1) PRIMARY KEY,
    id_producto INT NOT NULL,
    numero_serie_imei VARCHAR(50) NOT NULL UNIQUE,
    estado VARCHAR(20) NOT NULL DEFAULT 'Disponible'
      CHECK (estado IN ('Disponible','Vendido','En Reparacion','Reservado')),

    CONSTRAINT FK_Serial_Producto
      FOREIGN KEY (id_producto) REFERENCES dbo.Producto(id_producto)
);
GO

/* =========================
   4) Usuario
   ========================= */
CREATE TABLE dbo.Usuario (
    id_usuario INT IDENTITY(1,1) PRIMARY KEY,
    nombres VARCHAR(100) NOT NULL,
    correo VARCHAR(100) UNIQUE NULL,
    identificacion VARCHAR(13) UNIQUE NOT NULL,
    tipo_identificacion VARCHAR(10) NOT NULL
      CHECK (tipo_identificacion IN ('Cedula','RUC')),
    password_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(20) NOT NULL
      CHECK (rol IN ('Admin','Tecnico','Vendedor')),
    activo BIT NOT NULL DEFAULT 1
);
GO

/* =========================
   5) Cliente
   ========================= */
CREATE TABLE dbo.Cliente (
    id_cliente INT IDENTITY(1,1) PRIMARY KEY,
    nombres VARCHAR(100) NOT NULL,
    telefono VARCHAR(20) NULL,
    email VARCHAR(100) NULL,

    identificacion VARCHAR(13) UNIQUE NOT NULL,
    tipo_identificacion VARCHAR(10) NOT NULL
      CHECK (tipo_identificacion IN ('Cedula','RUC','Pasaporte')),

    activo BIT NOT NULL DEFAULT 1
);
GO

/* =========================
   6) Reparacion
   ========================= */
CREATE TABLE dbo.Reparacion (
    id_reparacion INT IDENTITY(1,1) PRIMARY KEY,
    id_cliente INT NOT NULL,
    id_usuario INT NOT NULL, -- técnico

    modelo_equipo VARCHAR(100) NOT NULL,
    serie_imei_ingreso VARCHAR(50) NOT NULL,

    descripcion_falla VARCHAR(MAX) NULL,
    diagnostico_final VARCHAR(MAX) NULL,

    costo_mano_obra DECIMAL(18,2) NOT NULL DEFAULT 0,

    estado VARCHAR(20) NOT NULL DEFAULT 'Recibido'
      CHECK (estado IN ('Recibido','Cotizado','Aprobado','En Proceso','Reparado','Entregado','Rechazado','Cancelado')),

    aprobado BIT NULL,
    fecha_aprobacion DATETIME NULL,
    motivo_rechazo VARCHAR(200) NULL,

    fecha_ingreso DATETIME NOT NULL DEFAULT GETDATE(),

    CONSTRAINT FK_Reparacion_Cliente
      FOREIGN KEY (id_cliente) REFERENCES dbo.Cliente(id_cliente),

    CONSTRAINT FK_Reparacion_Tecnico
      FOREIGN KEY (id_usuario) REFERENCES dbo.Usuario(id_usuario)
);
GO

/* =========================
   7) Reparacion_Repuesto (PK IDENTITY)
   ========================= */
CREATE TABLE dbo.Reparacion_Repuesto (
    id_reparacion_repuesto INT IDENTITY(1,1) PRIMARY KEY,

    id_reparacion INT NOT NULL,
    id_producto INT NOT NULL,
    id_serial INT NULL,

    cantidad INT NOT NULL CHECK (cantidad > 0),

    costo_unitario DECIMAL(18,2) NULL,
    precio_cobrado DECIMAL(18,2) NULL,

    CONSTRAINT FK_RR_Reparacion
      FOREIGN KEY (id_reparacion) REFERENCES dbo.Reparacion(id_reparacion),

    CONSTRAINT FK_RR_Producto
      FOREIGN KEY (id_producto) REFERENCES dbo.Producto(id_producto),

    CONSTRAINT FK_RR_Serial
      FOREIGN KEY (id_serial) REFERENCES dbo.Producto_Serial(id_serial)
);
GO

CREATE UNIQUE INDEX UX_RR_NoSerial
ON dbo.Reparacion_Repuesto (id_reparacion, id_producto)
WHERE id_serial IS NULL;
GO

CREATE UNIQUE INDEX UX_RR_ConSerial
ON dbo.Reparacion_Repuesto (id_reparacion, id_serial)
WHERE id_serial IS NOT NULL;
GO

/* =========================
   8) Factura (IVA histórico)
   ========================= */
CREATE TABLE dbo.Factura (
    id_factura INT IDENTITY(1,1) PRIMARY KEY,
    id_cliente INT NOT NULL,
    id_usuario INT NOT NULL,
    fecha DATETIME NOT NULL DEFAULT GETDATE(),

    iva_porcentaje DECIMAL(5,2) NOT NULL DEFAULT 0, -- se setea al insertar

    subtotal DECIMAL(18,2) NOT NULL DEFAULT 0,
    iva DECIMAL(18,2) NOT NULL DEFAULT 0,
    total DECIMAL(18,2) NOT NULL DEFAULT 0,

    CONSTRAINT FK_Factura_Cliente
      FOREIGN KEY (id_cliente) REFERENCES dbo.Cliente(id_cliente),

    CONSTRAINT FK_Factura_Vendedor
      FOREIGN KEY (id_usuario) REFERENCES dbo.Usuario(id_usuario)
);
GO

/* =========================
   9) Factura_Reparacion
   ========================= */
CREATE TABLE dbo.Factura_Reparacion (
    id_factura INT NOT NULL,
    id_reparacion INT NOT NULL,
    PRIMARY KEY (id_factura, id_reparacion),

    CONSTRAINT FK_FR_Factura
      FOREIGN KEY (id_factura) REFERENCES dbo.Factura(id_factura),

    CONSTRAINT FK_FR_Reparacion
      FOREIGN KEY (id_reparacion) REFERENCES dbo.Reparacion(id_reparacion)
);
GO

/* =========================
   10) Detalle_Factura
   ========================= */
CREATE TABLE dbo.Detalle_Factura (
    id_detalle INT IDENTITY(1,1) PRIMARY KEY,
    id_factura INT NOT NULL,

    id_producto INT NULL,
    id_serial INT NULL,

    id_reparacion INT NULL,
    descripcion_item VARCHAR(200) NULL,

    cantidad INT NOT NULL CHECK (cantidad > 0),
    precio_unitario DECIMAL(18,2) NOT NULL CHECK (precio_unitario >= 0),

    tipo_item VARCHAR(30) NOT NULL
      CHECK (tipo_item IN ('Venta Directa','Repuesto','Servicio')),

    CONSTRAINT FK_DF_Factura
      FOREIGN KEY (id_factura) REFERENCES dbo.Factura(id_factura),

    CONSTRAINT FK_DF_Producto
      FOREIGN KEY (id_producto) REFERENCES dbo.Producto(id_producto),

    CONSTRAINT FK_DF_Serial
      FOREIGN KEY (id_serial) REFERENCES dbo.Producto_Serial(id_serial),

    CONSTRAINT FK_DF_Reparacion
      FOREIGN KEY (id_reparacion) REFERENCES dbo.Reparacion(id_reparacion)
);
GO

/* =========================
   11) Movimiento_Inventario
   ========================= */
CREATE TABLE dbo.Movimiento_Inventario (
    id_movimiento INT IDENTITY(1,1) PRIMARY KEY,
    fecha DATETIME NOT NULL DEFAULT GETDATE(),

    id_producto INT NOT NULL,
    id_serial INT NULL,

    tipo VARCHAR(30) NOT NULL
      CHECK (tipo IN ('Compra','Venta','ConsumoReparacion','Ajuste','Devolucion')),

    cantidad INT NOT NULL, -- + entra, - sale

    referencia_tabla VARCHAR(30) NULL,
    referencia_id INT NULL,

    detalle VARCHAR(200) NULL,

    CONSTRAINT FK_MI_Producto
      FOREIGN KEY (id_producto) REFERENCES dbo.Producto(id_producto),

    CONSTRAINT FK_MI_Serial
      FOREIGN KEY (id_serial) REFERENCES dbo.Producto_Serial(id_serial)
);
GO

/* =========================
   12) Especificaciones Nivel 1 (EAV)
   ========================= */
CREATE TABLE dbo.Atributo (
    id_atributo INT IDENTITY(1,1) PRIMARY KEY,
    nombre_atributo VARCHAR(60) NOT NULL UNIQUE,
    tipo_dato VARCHAR(10) NOT NULL
      CHECK (tipo_dato IN ('texto','numero','bool','fecha')),
    unidad VARCHAR(20) NULL,
    activo BIT NOT NULL DEFAULT 1
);
GO

CREATE TABLE dbo.Producto_Atributo (
    id_producto INT NOT NULL,
    id_atributo INT NOT NULL,

    valor_texto VARCHAR(255) NULL,
    valor_numero DECIMAL(18,4) NULL,
    valor_bool BIT NULL,
    valor_fecha DATE NULL,

    CONSTRAINT PK_Producto_Atributo PRIMARY KEY (id_producto, id_atributo),
    CONSTRAINT FK_PA_Producto FOREIGN KEY (id_producto) REFERENCES dbo.Producto(id_producto),
    CONSTRAINT FK_PA_Atributo FOREIGN KEY (id_atributo) REFERENCES dbo.Atributo(id_atributo)
);
GO

-- Índice para búsquedas por atributo
CREATE INDEX IX_PA_Atributo ON dbo.Producto_Atributo(id_atributo, id_producto);
GO

/* =========================
   13) Índices
   ========================= */
CREATE INDEX IX_Producto_id_categoria ON dbo.Producto(id_categoria);
CREATE INDEX IX_Serial_id_producto ON dbo.Producto_Serial(id_producto);
CREATE INDEX IX_Reparacion_cliente ON dbo.Reparacion(id_cliente);
CREATE INDEX IX_Reparacion_tecnico ON dbo.Reparacion(id_usuario);
CREATE INDEX IX_Detalle_factura ON dbo.Detalle_Factura(id_factura);
CREATE INDEX IX_FR_reparacion ON dbo.Factura_Reparacion(id_reparacion);
CREATE INDEX IX_MI_producto_fecha ON dbo.Movimiento_Inventario(id_producto, fecha);
GO
