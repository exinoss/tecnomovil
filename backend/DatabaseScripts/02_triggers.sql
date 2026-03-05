/* ============================================================
   SCRIPT 2: TRIGGERS
   - Factura toma IVA actual desde Configuracion (histórico)
   - Totales usan Factura.iva_porcentaje
   - Inventario: Detalle_Factura (Venta Directa) y Reparacion_Repuesto (ConsumoReparacion)
   - Movimiento_Inventario actualiza Producto.stock_actual y estado de serial
   - Validación: serial pertenece al producto en Reparacion_Repuesto
   - Validación: Producto_Atributo respeta tipo_dato y 1 solo valor
   ============================================================ */
GO

/* A) Factura: copiar IVA actual a iva_porcentaje */
CREATE OR ALTER TRIGGER dbo.trg_Factura_SetIVA
ON dbo.Factura
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE f
    SET f.iva_porcentaje = c.iva_porcentaje
    FROM dbo.Factura f
    JOIN inserted i ON i.id_factura = f.id_factura
    CROSS JOIN dbo.Configuracion c
    WHERE c.id_config = 1;
END;
GO

/* B) Movimiento_Inventario -> stock_actual + estado serial */
CREATE OR ALTER TRIGGER dbo.trg_MI_AfterInsert
ON dbo.Movimiento_Inventario
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE p
    SET p.stock_actual = p.stock_actual + x.delta
    FROM dbo.Producto p
    JOIN (
        SELECT id_producto, SUM(cantidad) AS delta
        FROM inserted
        GROUP BY id_producto
    ) x ON x.id_producto = p.id_producto;


END;
GO

/* C) Detalle_Factura -> Movimiento_Inventario
      - 'Venta Directa': venta desde el módulo de inventario
      - 'Producto':       producto vendido desde el módulo de facturas */
CREATE OR ALTER TRIGGER dbo.trg_DetalleFactura_AfterInsert
ON dbo.Detalle_Factura
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO dbo.Movimiento_Inventario
        (id_producto, tipo, cantidad, fecha, referencia_tabla, referencia_id, detalle)
    SELECT
        i.id_producto,
        'Venta',
        -i.cantidad,
        GETDATE(),
        'Factura',
        i.id_factura,
        CONCAT('Detalle_Factura id_detalle=', i.id_detalle)
    FROM inserted i
    WHERE i.id_producto IS NOT NULL
      AND i.tipo_item IN ('Venta Directa', 'Producto');
END;
GO

/* D) Reparacion_Repuesto -> Movimiento_Inventario (ConsumoReparacion) */
CREATE OR ALTER TRIGGER dbo.trg_ReparacionRepuesto_AfterInsert
ON dbo.Reparacion_Repuesto
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO dbo.Movimiento_Inventario
        (id_producto, tipo, cantidad, referencia_tabla, referencia_id, detalle)
    SELECT
        i.id_producto,
        'ConsumoReparacion',
        -i.cantidad,
        'Reparacion',
        i.id_reparacion,
        'Consumo de repuesto en reparación'
    FROM inserted i;
END;
GO


/* F) Totales Factura usando iva_porcentaje histórico */
CREATE OR ALTER TRIGGER dbo.trg_DetalleFactura_RecalcularTotales
ON dbo.Detalle_Factura
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @Facturas TABLE (id_factura INT PRIMARY KEY);

    INSERT INTO @Facturas(id_factura)
    SELECT DISTINCT id_factura FROM inserted WHERE id_factura IS NOT NULL
    UNION
    SELECT DISTINCT id_factura FROM deleted  WHERE id_factura IS NOT NULL;

    ;WITH S AS (
      SELECT df.id_factura,
             SUM(df.cantidad * df.precio_unitario) AS subtotal
      FROM dbo.Detalle_Factura df
      JOIN @Facturas t ON t.id_factura = df.id_factura
      GROUP BY df.id_factura
    )
    UPDATE f
    SET
      f.subtotal = ISNULL(s.subtotal, 0),
      f.iva      = ROUND(ISNULL(s.subtotal, 0) * (f.iva_porcentaje / 100.0), 2),
      f.total    = ROUND(ISNULL(s.subtotal, 0) * (1 + (f.iva_porcentaje / 100.0)), 2)
    FROM dbo.Factura f
    JOIN @Facturas t ON t.id_factura = f.id_factura
    LEFT JOIN S s ON s.id_factura = f.id_factura;
END;
GO

/* G) Validación: Producto_Atributo respeta tipo_dato y solo 1 valor */
CREATE OR ALTER TRIGGER dbo.trg_PA_ValidarTipo
ON dbo.Producto_Atributo
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    -- Debe tener exactamente 1 tipo de valor (no 0, no 2+)
    IF EXISTS (
        SELECT 1
        FROM inserted
        WHERE
          (CASE WHEN valor_texto  IS NULL THEN 0 ELSE 1 END) +
          (CASE WHEN valor_numero IS NULL THEN 0 ELSE 1 END) +
          (CASE WHEN valor_bool   IS NULL THEN 0 ELSE 1 END) +
          (CASE WHEN valor_fecha  IS NULL THEN 0 ELSE 1 END) <> 1
    )
    BEGIN
        RAISERROR('Producto_Atributo: debes llenar exactamente 1 tipo de valor.',16,1);
        ROLLBACK TRANSACTION;
        RETURN;
    END

    -- Debe coincidir con tipo_dato del atributo
    IF EXISTS (
        SELECT 1
        FROM inserted i
        JOIN dbo.Atributo a ON a.id_atributo = i.id_atributo
        WHERE
          (a.tipo_dato='texto'  AND i.valor_texto  IS NULL) OR
          (a.tipo_dato='numero' AND i.valor_numero IS NULL) OR
          (a.tipo_dato='bool'   AND i.valor_bool   IS NULL) OR
          (a.tipo_dato='fecha'  AND i.valor_fecha  IS NULL)
    )
    BEGIN
        RAISERROR('Producto_Atributo: el valor no coincide con el tipo_dato del atributo.',16,1);
        ROLLBACK TRANSACTION;
        RETURN;
    END
END;
GO
