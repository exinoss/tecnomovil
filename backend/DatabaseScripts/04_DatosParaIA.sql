
USE [tecnomovilbd];
GO
SET NOCOUNT ON;
GO

BEGIN TRY
    BEGIN TRAN;

    /* -----------------------------
       0) PARAMETROS
    ------------------------------*/
    DECLARE @Hoy    DATE = '2026-03-04';
    DECLARE @Inicio DATE = DATEADD(MONTH, -6, @Hoy); -- 2025-09-04
    DECLARE @Iva    DECIMAL(5,2) = 15.00;

    DECLARE @Recompra1 DATE = '2025-11-10';
    DECLARE @Recompra2 DATE = '2026-01-20';

    /* -----------------------------
       0.1) LIMPIEZA DE DATOS PREVIOS (Opcional pero recomendada para Seed)
    ------------------------------*/
    -- Primero eliminamos las tablas que dependen de Producto para no romper FKs
    DELETE FROM dbo.Detalle_Analisis_IA;
    DELETE FROM dbo.Analisis_IA;
    
    DELETE FROM dbo.Detalle_Factura;
    DELETE FROM dbo.Movimiento_Inventario;
    DELETE FROM dbo.Factura;
    DELETE FROM dbo.Producto; -- Opcional: para reiniciar IDs si prefieres
    
    -- (Nota: Asegúrate de que los DELETE sigan el orden de integridad referencial)

    /* -----------------------------
       1) CONFIGURACION
    ------------------------------*/
    IF NOT EXISTS (SELECT 1 FROM dbo.Configuracion WHERE id_config = 1)
        INSERT INTO dbo.Configuracion(id_config, iva_porcentaje) VALUES (1, @Iva);
    ELSE
        UPDATE dbo.Configuracion SET iva_porcentaje = @Iva WHERE id_config = 1;

    /* -----------------------------
       2) CATEGORIAS
    ------------------------------*/
    DECLARE @Cat TABLE(nombre NVARCHAR(50));
    INSERT INTO @Cat(nombre) VALUES
    (N'Proteccion'), (N'Audio'), (N'Carga y Energia'),
    (N'Accesorios'), (N'Repuestos'), (N'Almacenamiento');

    INSERT INTO dbo.Categoria(nombre_categoria, activo)
    SELECT c.nombre, 1 FROM @Cat c
    WHERE NOT EXISTS (SELECT 1 FROM dbo.Categoria x WHERE x.nombre_categoria = c.nombre);

    /* -----------------------------
       3) USUARIOS
    ------------------------------*/
    IF NOT EXISTS (SELECT 1 FROM dbo.Usuario WHERE identificacion = '1711111111111')
        INSERT INTO dbo.Usuario(nombres, correo, identificacion, tipo_identificacion, password_hash, rol, activo)
        VALUES (N'Admin Tecnomovil', N'admin@tecnomovil.local', '1711111111111', 'CEDULA', 'HASH_DEMO_ADMIN', 'Admin', 1);

    IF NOT EXISTS (SELECT 1 FROM dbo.Usuario WHERE identificacion = '1722222222222')
        INSERT INTO dbo.Usuario(nombres, correo, identificacion, tipo_identificacion, password_hash, rol, activo)
        VALUES (N'Cajero Tecnomovil', N'cajero@tecnomovil.local', '1722222222222', 'CEDULA', 'HASH_DEMO_CAJERO', 'Cajero', 1);

    IF NOT EXISTS (SELECT 1 FROM dbo.Usuario WHERE identificacion = '1733333333333')
        INSERT INTO dbo.Usuario(nombres, correo, identificacion, tipo_identificacion, password_hash, rol, activo)
        VALUES (N'Cajero 2 Tecnomovil', N'cajero2@tecnomovil.local', '1733333333333', 'CEDULA', 'HASH_DEMO_CAJERO2', 'Cajero', 1);

    DECLARE @IdUsuario  INT = (SELECT TOP 1 id_usuario FROM dbo.Usuario WHERE identificacion = '1722222222222');
    DECLARE @IdUsuario2 INT = (SELECT TOP 1 id_usuario FROM dbo.Usuario WHERE identificacion = '1733333333333');

    /* -----------------------------
       4) PRODUCTOS (10 DETERMINÍSTICOS PARA IA)
    ------------------------------*/
    DECLARE @Prod TABLE(
        id_temp     INT,
        nombre      NVARCHAR(255),
        cat         NVARCHAR(50),
        precio      DECIMAL(18,2),
        descripcion NVARCHAR(MAX),
        stock_ini   INT
    );

    INSERT INTO @Prod VALUES
    -- ALTA (2 productos)
    (1, N'Mica Vidrio Templado 9H Universal',  N'Proteccion',  2.50, N'Vidrio templado 9H. Cobertura < 1', 160),
    (2, N'Cable USB Tipo-C 1m Trenzado',        N'Carga y Energia',  5.00, N'Cable Tipo-C. Stock 0 ventas', 80),
    
    -- MEDIA (4 productos)
    (3, N'Funda Silicon Transparente',          N'Proteccion',  4.50, N'Silicon suave. Cobertura 1.5', 150),
    (4, N'Cargador Rapido 33W USB-C GaN',       N'Carga y Energia', 14.00, N'GaN 33W. Cobertura 1.8', 234),
    (5, N'Audifonos Bluetooth TWS Basicos',     N'Audio',      14.00, N'TWS inalambricos. Alcista', 140),
    (6, N'Bateria Samsung A Series generica',   N'Repuestos', 16.00, N'Compatible Samsung. Alcista', 175),
    
    -- BAJA (4 productos)
    (7, N'Soporte Auto Ventosa Magnetico',      N'Accesorios',  9.00, N'Soporte magnetico. Cobertura 3', 360),
    (8, N'Kit Limpieza Pantallas Pro',          N'Accesorios',  3.50, N'Spray antiestatico. Cobertura 2.5', 128),
    (9, N'Pantalla iPhone 13 generica',         N'Repuestos', 55.00, N'Pantalla LCD. Bajista', 345),
    (10, N'Hub USB-C 4 en 1 HDMI USB SD',       N'Accesorios', 25.00, N'Hub multipuerto. Bajista', 460);

    -- Insertamos solo los 10 productos
    INSERT INTO dbo.Producto(id_categoria, nombre_producto, imagen, descripcion, stock_actual, precio_venta, es_serializado, activo)
    SELECT c.id_categoria, p.nombre, NULL, p.descripcion, 0, p.precio, 0, 1
    FROM @Prod p
    JOIN dbo.Categoria c ON c.nombre_categoria = p.cat
    WHERE NOT EXISTS (SELECT 1 FROM dbo.Producto x WHERE x.nombre_producto = p.nombre);

    /* -----------------------------
       5) COMPRA INICIAL
    ------------------------------*/
    INSERT INTO dbo.Movimiento_Inventario
        (fecha, id_producto, tipo, cantidad, referencia_tabla, referencia_id, detalle)
    SELECT
        CAST('2025-09-01' AS DATETIME2(7)),
        pr.id_producto, 'Compra', p.stock_ini, 'Seed', NULL,
        CONCAT(N'Stock inicial: ', pr.nombre_producto)
    FROM @Prod p
    JOIN dbo.Producto pr ON pr.nombre_producto = p.nombre;

    /* -----------------------------
       6) CLIENTES (Reuso de bloque original, simplificado)
    ------------------------------*/
    IF NOT EXISTS (SELECT 1 FROM dbo.Cliente WHERE identificacion = '1101111111')
    BEGIN
        INSERT INTO dbo.Cliente(nombres, telefono, email, identificacion, tipo_identificacion, activo)
        VALUES (N'Carlos Mena', '0991111111', 'cmena@mail.com', '1101111111', 'CEDULA', 1);
    END
    DECLARE @IdCliente INT = (SELECT TOP 1 id_cliente FROM dbo.Cliente);

    /* -----------------------------
       7) VENTAS Y COMPRAS MES A MES DESDE OCTUBRE HASTA MARZO
    ------------------------------*/
    DECLARE @Ventas TABLE (
        id_temp INT,
        mes DATE,
        cantidad INT
    );
    
    INSERT INTO @Ventas VALUES
    -- P1 (Alta) - Ventas con ligera fluctuación, promedio 25
    (1, '2025-10-15', 23), (1, '2025-11-15', 27), (1, '2025-12-15', 25),
    (1, '2026-01-15', 22), (1, '2026-02-15', 28), (1, '2026-03-01', 25),
    
    -- P2 (Alta) - Promedio 15/mes, termina en 8
    (2, '2025-10-15', 14), (2, '2025-11-15', 16), (2, '2025-12-15', 15),
    (2, '2026-01-15', 18), (2, '2026-02-15', 19), (2, '2026-03-01', 8),
    
    -- P3 (Media) - Promedio 20/mes
    (3, '2025-10-15', 19), (3, '2025-11-15', 21), (3, '2025-12-15', 20),
    (3, '2026-01-15', 22), (3, '2026-02-15', 18), (3, '2026-03-01', 20),
    
    -- P4 (Media) - Promedio 30/mes
    (4, '2025-10-15', 31), (4, '2025-11-15', 28), (4, '2025-12-15', 31),
    (4, '2026-01-15', 29), (4, '2026-02-15', 32), (4, '2026-03-01', 29),
    
    -- P5 (Media) - Alcista Fuerte >30% (Promedio inicio 10, fin 20)
    (5, '2025-10-15', 9),  (5, '2025-11-15', 11), (5, '2025-12-15', 10),
    (5, '2026-01-15', 18), (5, '2026-02-15', 22), (5, '2026-03-01', 20),
    
    -- P6 (Media) - Alcista Fuerte >30% (Promedio inicio 15, fin 25)
    (6, '2025-10-15', 14), (6, '2025-11-15', 16), (6, '2025-12-15', 15),
    (6, '2026-01-15', 23), (6, '2026-02-15', 27), (6, '2026-03-01', 25),
    
    -- P7 (Baja) - Promedio 40/mes
    (7, '2025-10-15', 38), (7, '2025-11-15', 43), (7, '2025-12-15', 39),
    (7, '2026-01-15', 42), (7, '2026-02-15', 37), (7, '2026-03-01', 41),
    
    -- P8 (Baja) - Promedio 15/mes
    (8, '2025-10-15', 14), (8, '2025-11-15', 16), (8, '2025-12-15', 15),
    (8, '2026-01-15', 15), (8, '2026-02-15', 16), (8, '2026-03-01', 14),
    
    -- P9 (Baja) - Bajista <20% (Promedio inicio 50, fin 30)
    (9, '2025-10-15', 52), (9, '2025-11-15', 47), (9, '2025-12-15', 51),
    (9, '2026-01-15', 28), (9, '2026-02-15', 32), (9, '2026-03-01', 30),
    
    -- P10 (Baja) - Bajista <20% (Promedio inicio 60, fin 40)
    (10, '2025-10-15', 59), (10, '2025-11-15', 63), (10, '2025-12-15', 58),
    (10, '2026-01-15', 41), (10, '2026-02-15', 38), (10, '2026-03-01', 41);

    /* META FINAL DE STOCK DESEADO PARA CADA PRODUCTO EN MARZO 2026 AL CALCULAR LA IA */
    DECLARE @StockMeta TABLE (id_temp INT, meta INT);
    INSERT INTO @StockMeta VALUES 
        (1, 10), (2, 0), (3, 30), (4, 54), (5, 100), 
        (6, 100), (7, 120), (8, 38), (9, 75), (10, 100);

    DECLARE @vt_id_temp INT, @vt_mes DATE, @vt_cantidad INT;
    DECLARE cur CURSOR LOCAL FOR SELECT id_temp, mes, cantidad FROM @Ventas ORDER BY mes, id_temp;
    
    OPEN cur;
    FETCH NEXT FROM cur INTO @vt_id_temp, @vt_mes, @vt_cantidad;
    
    WHILE @@FETCH_STATUS = 0
    BEGIN
        DECLARE @IdProducto INT, @Precio DECIMAL(18,2);
        SELECT @IdProducto = pr.id_producto, @Precio = pr.precio_venta 
        FROM dbo.Producto pr
        JOIN @Prod p ON p.nombre = pr.nombre_producto
        WHERE p.id_temp = @vt_id_temp;

        -------------------------------------------------------------
        -- 1. Reposición de Stock ("Compra") el mismo mes de la venta (Día 5)
        -- Solo para dar la sensación real de reabastecimiento antes de vender.
        -- Ajustamos la reposicion de tal forma que al final del script se llegue al "StockMeta".
        -------------------------------------------------------------
        DECLARE @StockActual INT;
        SELECT @StockActual = stock_actual FROM dbo.Producto WHERE id_producto = @IdProducto;
        
        -- Si estamos en el último mes (Marzo), compramos exactamente lo necesario para 
        -- suplir esta venta Y dejar el stock en la meta deseada.
        DECLARE @AComprar INT = 0;
        IF MONTH(@vt_mes) = 3 AND YEAR(@vt_mes) = 2026
        BEGIN
            DECLARE @Meta INT = (SELECT meta FROM @StockMeta WHERE id_temp = @vt_id_temp);
            -- Necesitamos terminar en @Meta DESPUÉS de vender @vt_cantidad.
            -- O sea: (StockActual + Compra) - Venta = Meta
            -- Compra = Meta + Venta - StockActual
            SET @AComprar = @Meta + @vt_cantidad - @StockActual;
        END
        ELSE
        BEGIN
            -- Si no es el último mes, simulamos que compramos para aguantar la venta del mes
            -- más un "minimo" de sobra, por ejemplo compramos su venta + 5 unidades de colchón.
            IF @StockActual < (@vt_cantidad + 10)
            BEGIN
                SET @AComprar = (@vt_cantidad + 10) - @StockActual;
            END
        END

        IF @AComprar > 0
        BEGIN
            DECLARE @FechaCompra DATE = DATEADD(DAY, -10, @vt_mes); -- Compramos unos días antes de la venta
            INSERT INTO dbo.Movimiento_Inventario
                (fecha, id_producto, tipo, cantidad, referencia_tabla, referencia_id, detalle)
            VALUES
                (CAST(@FechaCompra AS DATETIME2(7)), @IdProducto, 'Compra', @AComprar, 'Seed', NULL, 
                 CONCAT(N'Reposición mes ', FORMAT(@vt_mes, 'MM-yyyy')));
            
            -- Actualizamos stock actual temporal para simular
            SET @StockActual = @StockActual + @AComprar; 
        END

        -------------------------------------------------------------
        -- 2. Registro de Venta ("Factura" y "Movimiento de Venta")
        -------------------------------------------------------------
        DECLARE @IdFactura INT;
        
        INSERT INTO dbo.Factura(id_cliente, id_usuario, fecha, iva_porcentaje, subtotal, iva, total)
        VALUES (@IdCliente, @IdUsuario, CAST(@vt_mes AS DATETIME2(7)), @Iva, 0, 0, 0);
        SET @IdFactura = SCOPE_IDENTITY();
        
        INSERT INTO dbo.Detalle_Factura (id_factura, id_producto, cantidad, precio_unitario, tipo_item)
        VALUES (@IdFactura, @IdProducto, @vt_cantidad, @Precio, 'Venta Directa');

        FETCH NEXT FROM cur INTO @vt_id_temp, @vt_mes, @vt_cantidad;
    END

    CLOSE cur;
    DEALLOCATE cur;

    -------------------------------------------------------------
    -- 3. FORZAR STOCK ACTUAL EXACTO POR SEGURIDAD
    -- Esto garantiza que aunque los Triggers de la base de datos 
    -- estén desactivados o fallen, el stock del producto termine EXACTAMENTE 
    -- donde debe estar para que el AI analice las Urgencias perfectas.
    -------------------------------------------------------------
    UPDATE pr
    SET pr.stock_actual = sm.meta
    FROM dbo.Producto pr
    JOIN @Prod p ON p.nombre = pr.nombre_producto
    JOIN @StockMeta sm ON sm.id_temp = p.id_temp;

    COMMIT;

    /* -----------------------------
       8) VALIDACIONES FINALES
    ------------------------------*/
    PRINT 'SEED OK: 10 productos exactos para IA insertados. Revisa las tendencias y coberturas.';

    SELECT
        pr.nombre_producto,
        stock_final          = pr.stock_actual,
        vendido_6meses       = ISNULL(SUM(ABS(mi.cantidad)), 0),
        ventas_promedio_mes  = ROUND(ISNULL(SUM(ABS(mi.cantidad)), 0) / 6.0, 1),
        cobertura_meses      = CASE
            WHEN ISNULL(SUM(ABS(mi.cantidad)), 0) = 0 THEN 99
            ELSE ROUND(pr.stock_actual / (SUM(ABS(mi.cantidad)) / 6.0), 1)
        END
    FROM dbo.Producto pr
    LEFT JOIN dbo.Movimiento_Inventario mi
        ON  mi.id_producto = pr.id_producto
        AND mi.tipo        = 'Venta'
        AND mi.fecha       >= CAST('2025-10-01' AS DATETIME2(7))
    WHERE pr.activo = 1 AND pr.es_serializado = 0
    GROUP BY pr.id_producto, pr.nombre_producto, pr.stock_actual
    ORDER BY cobertura_meses ASC;

END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK;
    DECLARE @Err  NVARCHAR(4000) = ERROR_MESSAGE();
    DECLARE @Line INT            = ERROR_LINE();
    RAISERROR('ERROR SEED v2 (%d): %s', 16, 1, @Line, @Err);
END CATCH;
GO

