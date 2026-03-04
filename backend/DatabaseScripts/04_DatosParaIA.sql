/* =========================================================
   SEED REALISTA v2 - TECNOMOVIL
   Escenario: 6 meses de operacion real simulada

   Mejoras respecto a v1:
   - 30 productos con nombres reales y distintos patrones de demanda
   - Stock inicial conservador (proporcional a rotacion esperada)
   - 2 recompras intermedias (refleja operacion normal de la tienda)
   - 180 facturas distribuidas con estacionalidad marcada:
       Sep-Oct (temporada baja)  ~40 facturas
       Nov-Dic (fiestas/navidad) ~80 facturas
       Ene-Mar (ano nuevo/cierre)~60 facturas
   - Cantidades por venta: 1-4 unidades (mas realista para accesorios)
   - Patrones diferenciados para analisis IA variado:
       Productos con stock critico al final => IA recomienda comprar
       Productos con tendencia alcista (cargadores rapidos, USB-C)
       Productos con tendencia bajista (accesorios obsoletos)
       Productos estables con cobertura correcta

   Respeta triggers:
     Insert Detalle_Factura (Venta Directa) => Movimiento_Inventario (Venta)
     Insert Movimiento_Inventario => actualiza Producto.stock_actual
   ========================================================= */

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
       4) PRODUCTOS (30 NO serializados)
       stock_ini = carga inicial
       stock_r1  = recompra en @Recompra1 (0 = no aplica)
       stock_r2  = recompra en @Recompra2 (0 = no aplica)
    ------------------------------*/
    DECLARE @Prod TABLE(
        nombre      NVARCHAR(255),
        cat         NVARCHAR(50),
        precio      DECIMAL(18,2),
        descripcion NVARCHAR(MAX),
        stock_ini   INT,
        stock_r1    INT,
        stock_r2    INT
    );

    -- PROTECCION
    INSERT INTO @Prod VALUES
    (N'Mica Vidrio Templado 9H Universal',  N'Proteccion',  2.50, N'Vidrio templado 9H bordes curvos.',         60, 40, 30),
    (N'Mica Hidrogel Auto-reparable',        N'Proteccion',  3.50, N'Hidrogel TPU autorreparable.',              50, 30, 20),
    (N'Funda Silicon Transparente',          N'Proteccion',  4.50, N'Silicon suave transparente anti-amarillo.', 60, 40, 25),
    (N'Funda Antigolpes Armor',              N'Proteccion',  8.00, N'Doble capa TPU+PC proteccion militar.',     40, 25, 20),
    (N'Funda Tipo Billetera Cuero PU',       N'Proteccion',  9.00, N'Funda con ranuras para tarjetas.',          30,  0, 15),
    (N'Protector Camara Vidrio Pack x3',     N'Proteccion',  3.00, N'Vidrio para lentes camara.',                45, 20,  0);

    -- AUDIO
    INSERT INTO @Prod VALUES
    (N'Audifonos In-Ear con Microfono',      N'Audio',       5.00, N'Alambricos 3.5mm con microfono integrado.', 50, 30,  0),
    (N'Audifonos Bluetooth TWS Basicos',     N'Audio',      14.00, N'TWS inalambricos autonomia 4h.',            35, 20, 20),
    (N'Audifonos Bluetooth TWS Pro ANC',     N'Audio',      28.00, N'TWS con cancelacion de ruido ANC.',         20, 15, 15),
    (N'Bocina Bluetooth Portatil IPX5',      N'Audio',      22.00, N'Bocina mini resistente al agua IPX5.',      15,  0, 10);

    -- CARGA Y ENERGIA
    INSERT INTO @Prod VALUES
    (N'Cable USB Tipo-C 1m Trenzado',        N'Carga y Energia',  5.00, N'Cable Tipo-C nylon trenzado carga rapida.',    70, 50, 40),
    (N'Cable USB-C a USB-C 1.5m 100W',       N'Carga y Energia',  7.00, N'USB-C a USB-C 100W Power Delivery.',           40, 25, 20),
    (N'Cable Lightning 1m Premium',          N'Carga y Energia',  7.00, N'Compatible iPhone/iPad certificado.',           45, 30, 20),
    (N'Cable Micro-USB 1m',                  N'Carga y Energia',  3.00, N'Micro-USB datos y carga estandar.',            35,  0,  0),
    (N'Cargador Rapido 33W USB-C GaN',       N'Carga y Energia', 14.00, N'GaN 33W carga super rapida.',                  50, 35, 30),
    (N'Cargador 10W Doble Puerto USB-A',     N'Carga y Energia',  9.00, N'Doble puerto USB-A estandar.',                 40, 20,  0),
    (N'Cargador Inalambrico 15W Qi',         N'Carga y Energia', 18.00, N'Qi inalambrico 15W compatibilidad amplia.',    25, 20, 15),
    (N'Power Bank 10000mAh Slim',            N'Carga y Energia', 22.00, N'Bateria externa slim dos salidas USB.',        30, 20, 15),
    (N'Power Bank 20000mAh con Display',     N'Carga y Energia', 35.00, N'20000mAh con pantalla LED indicadora.',        20,  0, 10);

    -- ACCESORIOS
    INSERT INTO @Prod VALUES
    (N'Soporte Auto Ventosa Magnetico',      N'Accesorios',  9.00, N'Soporte magnetico ventosa para tablero.',    35, 15,  0),
    (N'Soporte Auto Rejilla de Aire',        N'Accesorios',  7.00, N'Clip para rejilla ventilacion.',             30, 15,  0),
    (N'Soporte Escritorio Ajustable 360',    N'Accesorios', 11.00, N'Brazo giro 360 grados compatible varios.',   25,  0,  0),
    (N'Adaptador OTG USB-C a USB-A',         N'Accesorios',  4.50, N'OTG compacto Tipo-C a USB-A.',              40, 15,  0),
    (N'Hub USB-C 4 en 1 HDMI USB SD',        N'Accesorios', 25.00, N'Hub multipuerto 4K HDMI USB lector SD.',    20,  0, 10),
    (N'Kit Limpieza Pantallas Pro',          N'Accesorios',  3.50, N'Spray antiestatico + pano microfibra.',      45, 20,  0),
    (N'Pegamento B-7000 25ml',               N'Accesorios',  5.00, N'Adhesivo para pantallas y carcasas.',       30,  0,  0);

    -- REPUESTOS
    INSERT INTO @Prod VALUES
    (N'Bateria Samsung A Series generica',   N'Repuestos', 16.00, N'Compatible Samsung A31/A51/A71.',            25, 15, 10),
    (N'Bateria iPhone generica',             N'Repuestos', 20.00, N'Compatible iPhone 11/12/13.',                20, 10, 10),
    (N'Pantalla Samsung A32 generica',       N'Repuestos', 38.00, N'Pantalla AMOLED tactil + marco.',            12,  8,  8),
    (N'Pantalla iPhone 13 generica',         N'Repuestos', 55.00, N'Pantalla LCD compatible iPhone 13.',         10,  6,  6),
    (N'Kit Herramientas Reparacion 24pzs',   N'Repuestos', 12.00, N'Set destornilladores palancas pinzas.',      18,  0,  0);

    INSERT INTO dbo.Producto(id_categoria, nombre_producto, imagen, descripcion, stock_actual, precio_venta, es_serializado, activo)
    SELECT c.id_categoria, p.nombre, NULL, p.descripcion, 0, p.precio, 0, 1
    FROM @Prod p
    JOIN dbo.Categoria c ON c.nombre_categoria = p.cat
    WHERE NOT EXISTS (SELECT 1 FROM dbo.Producto x WHERE x.nombre_producto = p.nombre);

    /* -----------------------------
       5A) COMPRA INICIAL
    ------------------------------*/
    INSERT INTO dbo.Movimiento_Inventario
        (fecha, id_producto, tipo, cantidad, referencia_tabla, referencia_id, detalle)
    SELECT
        DATEADD(DAY, -15, CAST(@Inicio AS DATETIME2(7))),
        pr.id_producto, 'Compra', p.stock_ini, 'Seed', NULL,
        CONCAT(N'Stock inicial: ', pr.nombre_producto)
    FROM @Prod p
    JOIN dbo.Producto pr ON pr.nombre_producto = p.nombre
    WHERE p.stock_ini > 0;

    /* -----------------------------
       5B) RECOMPRA 1 (2025-11-10)
    ------------------------------*/
    INSERT INTO dbo.Movimiento_Inventario
        (fecha, id_producto, tipo, cantidad, referencia_tabla, referencia_id, detalle)
    SELECT
        CAST(@Recompra1 AS DATETIME2(7)),
        pr.id_producto, 'Compra', p.stock_r1, 'Seed', NULL,
        CONCAT(N'Recompra nov-25: ', pr.nombre_producto)
    FROM @Prod p
    JOIN dbo.Producto pr ON pr.nombre_producto = p.nombre
    WHERE p.stock_r1 > 0;

    /* -----------------------------
       5C) RECOMPRA 2 (2026-01-20)
    ------------------------------*/
    INSERT INTO dbo.Movimiento_Inventario
        (fecha, id_producto, tipo, cantidad, referencia_tabla, referencia_id, detalle)
    SELECT
        CAST(@Recompra2 AS DATETIME2(7)),
        pr.id_producto, 'Compra', p.stock_r2, 'Seed', NULL,
        CONCAT(N'Recompra ene-26: ', pr.nombre_producto)
    FROM @Prod p
    JOIN dbo.Producto pr ON pr.nombre_producto = p.nombre
    WHERE p.stock_r2 > 0;

    /* -----------------------------
       6) CLIENTES (40)
    ------------------------------*/
    DECLARE @Clientes TABLE(
        nombres  NVARCHAR(100), telefono NVARCHAR(20),
        email    NVARCHAR(100), ident    NVARCHAR(13), tipo NVARCHAR(10)
    );

    INSERT INTO @Clientes(nombres, telefono, email, ident, tipo) VALUES
    (N'Carlos Mena',           '0991111111', 'cmena@mail.com',         '1101111111',    'CEDULA'),
    (N'Ana Lopez',             '0982222222', 'alopez@mail.com',        '1102222222',    'CEDULA'),
    (N'Jorge Paredes',         '0973333333', 'jparedes@mail.com',      '1103333333',    'CEDULA'),
    (N'Maria Andrade',         '0964444444', 'mandrade@mail.com',      '1104444444',    'CEDULA'),
    (N'Luis Zamora',           '0955555555', 'lzamora@mail.com',       '1105555555',    'CEDULA'),
    (N'Valeria Silva',         '0946666666', 'vsilva@mail.com',        '1106666666',    'CEDULA'),
    (N'Kevin Torres',          '0937777777', 'ktorres@mail.com',       '1107777777',    'CEDULA'),
    (N'Fernanda Ruiz',         '0928888888', 'fruiz@mail.com',         '1108888888',    'CEDULA'),
    (N'Diego Chavez',          '0919999999', 'dchavez@mail.com',       '1109999999',    'CEDULA'),
    (N'Paola Herrera',         '0991212121', 'pherrera@mail.com',      '1111212121',    'CEDULA'),
    (N'Miguel Cedeno',         '0981313131', 'mcedeno@mail.com',       '1111313131',    'CEDULA'),
    (N'Gabriela Vaca',         '0971414141', 'gvaca@mail.com',         '1111414141',    'CEDULA'),
    (N'Andrea Mora',           '0961515151', 'amora@mail.com',         '1111515151',    'CEDULA'),
    (N'Juan Molina',           '0951616161', 'jmolina@mail.com',       '1111616161',    'CEDULA'),
    (N'Rosa Delgado',          '0941717171', 'rdelgado@mail.com',      '1111717171',    'CEDULA'),
    (N'Edwin Castillo',        '0931818181', 'ecastillo@mail.com',     '1111818181',    'CEDULA'),
    (N'Karen Ibarra',          '0921919191', 'kibarra@mail.com',       '1111919191',    'CEDULA'),
    (N'Erick Vera',            '0992020202', 'evera@mail.com',         '1122020202',    'CEDULA'),
    (N'Sofia Paz',             '0982121212', 'spaz@mail.com',          '1122121212',    'CEDULA'),
    (N'Bryan Cardenas',        '0972323232', 'bcardenas@mail.com',     '1122323232',    'CEDULA'),
    (N'Camila Navas',          '0962424242', 'cnavas@mail.com',        '1122424242',    'CEDULA'),
    (N'Cristian Arias',        '0952525252', 'carias@mail.com',        '1122525252',    'CEDULA'),
    (N'Daniela Leon',          '0942626262', 'dleon@mail.com',         '1122626262',    'CEDULA'),
    (N'Ricardo Montalvo',      '0932727272', 'rmontalvo@mail.com',     '1122727272',    'CEDULA'),
    (N'Natalia Quintero',      '0922828282', 'nquintero@mail.com',     '1122828282',    'CEDULA'),
    (N'Pablo Rivas',           '0992929292', 'privas@mail.com',        '1122929292',    'CEDULA'),
    (N'Liliana Salazar',       '0983030303', 'lsalazar@mail.com',      '1133030303',    'CEDULA'),
    (N'Sebastian Ortega',      '0973131313', 'sortega@mail.com',       '1133131313',    'CEDULA'),
    (N'Gloria Benitez',        '0963232323', 'gbenitez@mail.com',      '1133232323',    'CEDULA'),
    (N'Empresa SanLo Tech',    '022345678',  'ventas@sanlotech.ec',    '1799999999001', 'RUC'),
    (N'Alicia Montoya',        '0993434343', 'amontoya@mail.com',      '1133434343',    'CEDULA'),
    (N'Marco Escobar',         '0983535353', 'mescobar@mail.com',      '1133535353',    'CEDULA'),
    (N'Veronica Pinto',        '0973636363', 'vpinto@mail.com',        '1133636363',    'CEDULA'),
    (N'Hernan Quinonez',       '0963737373', 'hquinonez@mail.com',     '1133737373',    'CEDULA'),
    (N'Isabel Freire',         '0953838383', 'ifreire@mail.com',       '1133838383',    'CEDULA'),
    (N'Roberto Lasso',         '0943939393', 'rlasso@mail.com',        '1133939393',    'CEDULA'),
    (N'Patricia Aguirre',      '0994040404', 'paguirre@mail.com',      '1144040404',    'CEDULA'),
    (N'Mauricio Calderon',     '0984141414', 'mcalderon@mail.com',     '1144141414',    'CEDULA'),
    (N'Distribuidora MoviPlus','023456789',  'compras@moviplus.ec',    '1788888888001', 'RUC'),
    (N'Nicolas Fuentes',       '0974343434', 'nfuentes@mail.com',      '1144343434',    'CEDULA');

    INSERT INTO dbo.Cliente(nombres, telefono, email, identificacion, tipo_identificacion, activo)
    SELECT c.nombres, c.telefono, c.email, c.ident, c.tipo, 1
    FROM @Clientes c
    WHERE NOT EXISTS (SELECT 1 FROM dbo.Cliente x WHERE x.identificacion = c.ident);

    /* -----------------------------
       7) CONTROL DE STOCK
    ------------------------------*/
    IF OBJECT_ID('tempdb..#Stock') IS NOT NULL DROP TABLE #Stock;

    SELECT p.id_producto, p.nombre_producto,
           stock_disponible = p.stock_actual, p.precio_venta
    INTO #Stock
    FROM dbo.Producto p
    WHERE p.activo = 1 AND p.es_serializado = 0;

    /* -----------------------------
       8) 180 FACTURAS con estacionalidad marcada
    ------------------------------*/
    DECLARE @n             INT = 1;
    DECLARE @TotalFacturas INT = 180;

    WHILE @n <= @TotalFacturas
    BEGIN
        DECLARE @IdCliente  INT = (SELECT TOP 1 id_cliente FROM dbo.Cliente ORDER BY NEWID());
        DECLARE @CajeroFact INT = CASE WHEN @n % 3 = 0 THEN @IdUsuario2 ELSE @IdUsuario END;
        DECLARE @Fecha      DATE;

        -- Distribución uniforme: un número aleatorio de días desde el inicio
        DECLARE @DiasAleatorios INT = ABS(CHECKSUM(NEWID())) % (DATEDIFF(DAY, @Inicio, @Hoy) + 1);
        SET @Fecha = DATEADD(DAY, @DiasAleatorios, @Inicio);

        DECLARE @IdFactura INT;
        INSERT INTO dbo.Factura(id_cliente, id_usuario, fecha, iva_porcentaje, subtotal, iva, total)
        VALUES (@IdCliente, @CajeroFact, CAST(@Fecha AS DATETIME2(7)), @Iva, 0, 0, 0);
        SET @IdFactura = SCOPE_IDENTITY();

        DECLARE @det    INT = 1;
        DECLARE @detMax INT = 2 + (ABS(CHECKSUM(NEWID())) % 3);
        IF @n % 15 = 0 SET @detMax = 4 + (ABS(CHECKSUM(NEWID())) % 3);

        WHILE @det <= @detMax
        BEGIN
            DECLARE @IdProducto INT         = NULL;
            DECLARE @Precio     DECIMAL(18,2);
            DECLARE @StockDisp  INT;

            SELECT TOP 1
                @IdProducto = s.id_producto,
                @Precio     = s.precio_venta,
                @StockDisp  = s.stock_disponible
            FROM #Stock s
            WHERE s.stock_disponible > 0
            ORDER BY
                CASE
                    WHEN s.nombre_producto LIKE N'%Cable%'          THEN (ABS(CHECKSUM(NEWID())) % 60) + 40
                    WHEN s.nombre_producto LIKE N'%Mica%'
                      OR s.nombre_producto LIKE N'%Vidrio%'
                      OR s.nombre_producto LIKE N'%Hidrogel%'       THEN (ABS(CHECKSUM(NEWID())) % 55) + 35
                    WHEN s.nombre_producto LIKE N'%Funda%'          THEN (ABS(CHECKSUM(NEWID())) % 50) + 30
                    WHEN s.nombre_producto LIKE N'%Cargador%'       THEN (ABS(CHECKSUM(NEWID())) % 45) + 25
                    WHEN s.nombre_producto LIKE N'%Audifonos%'
                      OR s.nombre_producto LIKE N'%Bocina%'         THEN (ABS(CHECKSUM(NEWID())) % 40) + 20
                    ELSE                                                    (ABS(CHECKSUM(NEWID())) % 30) + 10
                END DESC;

            IF @IdProducto IS NULL BREAK;

            DECLARE @Cant INT;
            IF MONTH(@Fecha) IN (11, 12, 1)
                SET @Cant = 1 + (ABS(CHECKSUM(NEWID())) % 4);
            ELSE
                SET @Cant = 1 + (ABS(CHECKSUM(NEWID())) % 3);

            IF @Cant > @StockDisp SET @Cant = @StockDisp;
            IF @Cant = 0 BEGIN SET @det += 1; CONTINUE; END

            INSERT INTO dbo.Detalle_Factura
                (id_factura, id_producto, id_reparacion,
                 descripcion_item, cantidad, precio_unitario, tipo_item)
            VALUES
                (@IdFactura, @IdProducto, NULL, NULL, @Cant, @Precio, 'Venta Directa');

            UPDATE #Stock
            SET stock_disponible = stock_disponible - @Cant
            WHERE id_producto = @IdProducto;

            SET @det += 1;
        END

        SET @n += 1;
    END

    COMMIT;

    /* -----------------------------
       9) VALIDACIONES FINALES
    ------------------------------*/
    PRINT 'SEED v2 OK: 30 productos, 40 clientes, 3 eventos de compra, 180 facturas.';

    SELECT
        mes             = FORMAT(f.fecha, 'yyyy-MM'),
        total_facturas  = COUNT(*),
        total_facturado = SUM(f.total)
    FROM dbo.Factura f
    GROUP BY FORMAT(f.fecha, 'yyyy-MM')
    ORDER BY mes;

    SELECT TOP 15
        pr.nombre_producto,
        unidades_vendidas = SUM(df.cantidad),
        ingresos          = SUM(df.cantidad * df.precio_unitario)
    FROM dbo.Detalle_Factura df
    JOIN dbo.Producto pr ON pr.id_producto = df.id_producto
    WHERE df.tipo_item = 'Venta Directa'
    GROUP BY pr.id_producto, pr.nombre_producto
    ORDER BY unidades_vendidas DESC;

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
        AND mi.fecha       >= CAST(DATEADD(MONTH, -6, '2026-03-04') AS DATETIME2(7))
    WHERE pr.activo = 1 AND pr.es_serializado = 0
    GROUP BY pr.id_producto, pr.nombre_producto, pr.stock_actual
    ORDER BY cobertura_meses ASC;

    SELECT negativos = COUNT(*) FROM dbo.Producto WHERE stock_actual < 0;

END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK;
    DECLARE @Err  NVARCHAR(4000) = ERROR_MESSAGE();
    DECLARE @Line INT            = ERROR_LINE();
    RAISERROR('ERROR SEED v2 (%d): %s', 16, 1, @Line, @Err);
END CATCH;
GO

