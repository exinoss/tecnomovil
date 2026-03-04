USE tecnomovilbd;
GO

-- =========================================================================
-- PARCHE URGENTE:
-- Arreglo de los triggers de base de datos que no pasaban la columna "fecha"
-- al crear el Movimiento_Inventario. Esto rompe la app en producción.
-- =========================================================================

CREATE OR ALTER TRIGGER dbo.trg_DetalleFactura_AfterInsert
ON dbo.Detalle_Factura
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;

    -- AL realizar una Venta, el movimiento de inventario hereda la fecha de la Factura
    INSERT INTO dbo.Movimiento_Inventario
        (id_producto, id_serial, fecha, tipo, cantidad, referencia_tabla, referencia_id, detalle)
    SELECT
        i.id_producto,
        i.id_serial,
        f.fecha,  -- << SOLUCION: Tomamos la fecha de la factura para respetar las fechas históricas
        'Venta',
        -i.cantidad,
        'Factura',
        i.id_factura,
        CONCAT('Detalle_Factura id_detalle=', i.id_detalle)
    FROM inserted i
    JOIN dbo.Factura f ON f.id_factura = i.id_factura
    WHERE i.tipo_item = 'Venta Directa'
      AND i.id_producto IS NOT NULL;
END;
GO

CREATE OR ALTER TRIGGER dbo.trg_ReparacionRepuesto_AfterInsert
ON dbo.Reparacion_Repuesto
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO dbo.Movimiento_Inventario
        (id_producto, id_serial, fecha, tipo, cantidad, referencia_tabla, referencia_id, detalle)
    SELECT
        i.id_producto,
        i.id_serial,
        GETDATE(), -- << SOLUCION: Pasamos explícitamente la fecha de hoy
        'ConsumoReparacion',
        -i.cantidad,
        'Reparacion',
        i.id_reparacion,
        'Consumo de repuesto en reparación'
    FROM inserted i;
END;
GO


-- =========================================================================
-- SCRIPT DE INSERCIÓN DE DATOS FALSOS PARA TEST DE IA
-- =========================================================================

-- 1. Insertar Categoria
INSERT INTO Categoria (nombre_categoria, activo) VALUES ('Accesorios IA Test', 1);
DECLARE @idCategoria INT = SCOPE_IDENTITY();

-- 2. Insertar Productos
-- Producto 1: Tendencia Alcista (Ventas suben 5 -> 10 -> 15 -> 25 -> 35 -> 40). Stock crítico (10).
INSERT INTO Producto (id_categoria, nombre_producto, stock_actual, precio_venta, es_serializado, activo)
VALUES (@idCategoria, 'Pantalla iPhone 15 Pro', 10, 150.00, 0, 1);
DECLARE @idProdAlcista INT = SCOPE_IDENTITY();

-- Producto 2: Tendencia Bajista (Ventas caen 40 -> 30 -> 20 -> 15 -> 10 -> 5). Stock alto (50).
INSERT INTO Producto (id_categoria, nombre_producto, stock_actual, precio_venta, es_serializado, activo)
VALUES (@idCategoria, 'Funda Galaxy S22', 50, 15.00, 0, 1);
DECLARE @idProdBajista INT = SCOPE_IDENTITY();

-- Producto 3: Tendencia Estable (Ventas planas 20 -> 22 -> 19 -> 21 -> 20 -> 20). Stock normal (30).
INSERT INTO Producto (id_categoria, nombre_producto, stock_actual, precio_venta, es_serializado, activo)
VALUES (@idCategoria, 'Cargador Original 20W', 30, 25.00, 0, 1);
DECLARE @idProdEstable INT = SCOPE_IDENTITY();

-- 3. Entidades Base (Para poder crear facturas)
DECLARE @idCliente INT, @idUsuario INT;

-- Generar identificaciones aleatorias para evitar conflictos de índices únicos
DECLARE @randomId VARCHAR(20) = CAST(ABS(CHECKSUM(NEWID())) % 100000 AS VARCHAR);

INSERT INTO Cliente (nombres, telefono, email, identificacion, tipo_identificacion, activo)
VALUES ('Cliente Test IA', '0999999999', 'clienteia' + @randomId + '@test.com', '123' + @randomId, 'Cedula', 1);
SET @idCliente = SCOPE_IDENTITY();

INSERT INTO Usuario (nombres, correo, identificacion, tipo_identificacion, password_hash, rol, activo)
VALUES ('Vendedor IA', 'vendedor' + @randomId + '@ia.com', '321' + @randomId, 'Cedula', 'hash_dummy', 'Vendedor', 1);
SET @idUsuario = SCOPE_IDENTITY();

-- 4. Generar Ventas a lo largo de 6 meses
DECLARE @idFac INT;

-- Hace 5 meses
INSERT INTO Factura (id_cliente, id_usuario, fecha, iva_porcentaje, subtotal, iva, total) VALUES (@idCliente, @idUsuario, DATEADD(month, -5, GETDATE()), 15.00, 0, 0, 0);
SET @idFac = SCOPE_IDENTITY();
INSERT INTO Detalle_Factura (id_factura, id_producto, cantidad, precio_unitario, tipo_item) VALUES (@idFac, @idProdAlcista, 5, 150.00, 'Venta Directa');
INSERT INTO Detalle_Factura (id_factura, id_producto, cantidad, precio_unitario, tipo_item) VALUES (@idFac, @idProdBajista, 40, 15.00, 'Venta Directa');
INSERT INTO Detalle_Factura (id_factura, id_producto, cantidad, precio_unitario, tipo_item) VALUES (@idFac, @idProdEstable, 20, 25.00, 'Venta Directa');

-- Hace 4 meses
INSERT INTO Factura (id_cliente, id_usuario, fecha, iva_porcentaje, subtotal, iva, total) VALUES (@idCliente, @idUsuario, DATEADD(month, -4, GETDATE()), 15.00, 0, 0, 0);
SET @idFac = SCOPE_IDENTITY();
INSERT INTO Detalle_Factura (id_factura, id_producto, cantidad, precio_unitario, tipo_item) VALUES (@idFac, @idProdAlcista, 10, 150.00, 'Venta Directa');
INSERT INTO Detalle_Factura (id_factura, id_producto, cantidad, precio_unitario, tipo_item) VALUES (@idFac, @idProdBajista, 30, 15.00, 'Venta Directa');
INSERT INTO Detalle_Factura (id_factura, id_producto, cantidad, precio_unitario, tipo_item) VALUES (@idFac, @idProdEstable, 22, 25.00, 'Venta Directa');

-- Hace 3 meses
INSERT INTO Factura (id_cliente, id_usuario, fecha, iva_porcentaje, subtotal, iva, total) VALUES (@idCliente, @idUsuario, DATEADD(month, -3, GETDATE()), 15.00, 0, 0, 0);
SET @idFac = SCOPE_IDENTITY();
INSERT INTO Detalle_Factura (id_factura, id_producto, cantidad, precio_unitario, tipo_item) VALUES (@idFac, @idProdAlcista, 15, 150.00, 'Venta Directa');
INSERT INTO Detalle_Factura (id_factura, id_producto, cantidad, precio_unitario, tipo_item) VALUES (@idFac, @idProdBajista, 20, 15.00, 'Venta Directa');
INSERT INTO Detalle_Factura (id_factura, id_producto, cantidad, precio_unitario, tipo_item) VALUES (@idFac, @idProdEstable, 19, 25.00, 'Venta Directa');

-- Hace 2 meses
INSERT INTO Factura (id_cliente, id_usuario, fecha, iva_porcentaje, subtotal, iva, total) VALUES (@idCliente, @idUsuario, DATEADD(month, -2, GETDATE()), 15.00, 0, 0, 0);
SET @idFac = SCOPE_IDENTITY();
INSERT INTO Detalle_Factura (id_factura, id_producto, cantidad, precio_unitario, tipo_item) VALUES (@idFac, @idProdAlcista, 25, 150.00, 'Venta Directa');
INSERT INTO Detalle_Factura (id_factura, id_producto, cantidad, precio_unitario, tipo_item) VALUES (@idFac, @idProdBajista, 15, 15.00, 'Venta Directa');
INSERT INTO Detalle_Factura (id_factura, id_producto, cantidad, precio_unitario, tipo_item) VALUES (@idFac, @idProdEstable, 21, 25.00, 'Venta Directa');

-- Hace 1 mes
INSERT INTO Factura (id_cliente, id_usuario, fecha, iva_porcentaje, subtotal, iva, total) VALUES (@idCliente, @idUsuario, DATEADD(month, -1, GETDATE()), 15.00, 0, 0, 0);
SET @idFac = SCOPE_IDENTITY();
INSERT INTO Detalle_Factura (id_factura, id_producto, cantidad, precio_unitario, tipo_item) VALUES (@idFac, @idProdAlcista, 35, 150.00, 'Venta Directa');
INSERT INTO Detalle_Factura (id_factura, id_producto, cantidad, precio_unitario, tipo_item) VALUES (@idFac, @idProdBajista, 10, 15.00, 'Venta Directa');
INSERT INTO Detalle_Factura (id_factura, id_producto, cantidad, precio_unitario, tipo_item) VALUES (@idFac, @idProdEstable, 20, 25.00, 'Venta Directa');

-- Mes Actual
INSERT INTO Factura (id_cliente, id_usuario, fecha, iva_porcentaje, subtotal, iva, total) VALUES (@idCliente, @idUsuario, GETDATE(), 15.00, 0, 0, 0);
SET @idFac = SCOPE_IDENTITY();
INSERT INTO Detalle_Factura (id_factura, id_producto, cantidad, precio_unitario, tipo_item) VALUES (@idFac, @idProdAlcista, 40, 150.00, 'Venta Directa');
INSERT INTO Detalle_Factura (id_factura, id_producto, cantidad, precio_unitario, tipo_item) VALUES (@idFac, @idProdBajista, 5, 15.00, 'Venta Directa');
INSERT INTO Detalle_Factura (id_factura, id_producto, cantidad, precio_unitario, tipo_item) VALUES (@idFac, @idProdEstable, 20, 25.00, 'Venta Directa');

PRINT '==== PARCHE APLICADO Y DATOS DE PRUEBA INSERTADOS ====';
