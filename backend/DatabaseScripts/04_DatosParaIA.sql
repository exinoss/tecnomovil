/* =========================================================
   SEED REALISTA (ULTIMOS 6 MESES) - TECNOMOVIL
   - Genera: Categorías, Usuarios, Configuración IVA,
             Productos NO serializados, Compras (inventario),
             Clientes, 50 Facturas y Detalles (2-5 items c/u)
   - Respeta triggers:
        * Insert Detalle_Factura (Venta Directa) => Movimiento_Inventario (Venta)
        * Insert Movimiento_Inventario => actualiza Producto.stock_actual
   - Evita stock negativo (controlado con #Stock)
   ========================================================= */

USE [tecnomovilbd];
GO
SET NOCOUNT ON;
GO

BEGIN TRY
    BEGIN TRAN;

    /* -----------------------------
       0) PARAMETROS DE FECHA (ULTIMOS 6 MESES)
       Hoy (según tu contexto): 2026-03-04
       Ventas desde: 2025-09-04
    ------------------------------*/
    DECLARE @Hoy DATE = '2026-03-04';
    DECLARE @Inicio DATE = DATEADD(MONTH, -6, @Hoy); -- 2025-09-04
    DECLARE @Iva DECIMAL(5,2) = 15.00;

    /* -----------------------------
       1) CONFIGURACION (1 fila)
    ------------------------------*/
    IF NOT EXISTS (SELECT 1 FROM dbo.Configuracion WHERE id_config = 1)
    BEGIN
        INSERT INTO dbo.Configuracion(id_config, iva_porcentaje)
        VALUES (1, @Iva);
    END
    ELSE
    BEGIN
        UPDATE dbo.Configuracion SET iva_porcentaje = @Iva WHERE id_config = 1;
    END

    /* -----------------------------
       2) CATEGORIAS
    ------------------------------*/
    DECLARE @Cat TABLE(nombre NVARCHAR(50));
    INSERT INTO @Cat(nombre) VALUES
    (N'Protección'), (N'Audio'), (N'Carga y Energía'),
    (N'Accesorios'), (N'Repuestos'), (N'Almacenamiento');

    INSERT INTO dbo.Categoria(nombre_categoria, activo)
    SELECT c.nombre, 1
    FROM @Cat c
    WHERE NOT EXISTS (
        SELECT 1 FROM dbo.Categoria x WHERE x.nombre_categoria = c.nombre
    );

    /* -----------------------------
       3) USUARIOS (2 cajeros)
       Nota: password_hash es demo (tu app lo manejará)
    ------------------------------*/
    IF NOT EXISTS (SELECT 1 FROM dbo.Usuario WHERE identificacion = '1711111111111')
    BEGIN
        INSERT INTO dbo.Usuario(nombres, correo, identificacion, tipo_identificacion, password_hash, rol, activo)
        VALUES
        (N'Admin Tecnomóvil', N'admin@tecnomovil.local', '1711111111111', 'CEDULA', 'HASH_DEMO_ADMIN', 'Admin', 1);
    END

    IF NOT EXISTS (SELECT 1 FROM dbo.Usuario WHERE identificacion = '1722222222222')
    BEGIN
        INSERT INTO dbo.Usuario(nombres, correo, identificacion, tipo_identificacion, password_hash, rol, activo)
        VALUES
        (N'Cajero Tecnomóvil', N'cajero@tecnomovil.local', '1722222222222', 'CEDULA', 'HASH_DEMO_CAJERO', 'Cajero', 1);
    END

    DECLARE @IdUsuario INT =
        (SELECT TOP 1 id_usuario FROM dbo.Usuario WHERE identificacion = '1722222222222');

    /* -----------------------------
       4) PRODUCTOS (NO serializados)
       IMPORTANTE: stock_actual inicia 0,
       luego se carga por "Compra" (Movimiento_Inventario)
    ------------------------------*/
    DECLARE @Prod TABLE(
        nombre NVARCHAR(255),
        cat NVARCHAR(50),
        precio DECIMAL(18,2),
        descripcion NVARCHAR(MAX)
    );

    INSERT INTO @Prod(nombre, cat, precio, descripcion) VALUES
    (N'Mica Hidrogel Universal',          N'Protección',     3.00,  N'Mica hidrogel recortable para varios modelos.'),
    (N'Mica Vidrio Templado 6D',         N'Protección',     2.50,  N'Protector vidrio templado 6D.'),
    (N'Funda Silicon Case',              N'Protección',     5.00,  N'Funda silicona antideslizante.'),
    (N'Funda Antigolpes Reforzada',      N'Protección',     7.00,  N'Funda reforzada esquinas.'),
    (N'Audífonos In-Ear Económicos',     N'Audio',          6.00,  N'Audífonos básicos 3.5mm.'),
    (N'Audífonos Bluetooth TWS',         N'Audio',         15.00,  N'Audífonos inalámbricos TWS.'),
    (N'Cable USB Tipo-C 1m',             N'Carga y Energía',4.00,  N'Cable Tipo-C carga/datos.'),
    (N'Cable Lightning 1m',              N'Carga y Energía',6.00,  N'Cable compatible Lightning.'),
    (N'Cargador 20W USB-C',              N'Carga y Energía',12.00, N'Cargador rápido 20W.'),
    (N'Cargador 10W USB',                N'Carga y Energía',8.00,  N'Cargador estándar 10W.'),
    (N'Power Bank 10,000mAh',            N'Carga y Energía',20.00, N'Batería externa 10k.'),
    (N'Soporte para Auto (Rejilla)',     N'Accesorios',     8.00,  N'Soporte para auto tipo rejilla.'),
    (N'Soporte de Escritorio Ajustable', N'Accesorios',    10.00,  N'Soporte para escritorio.'),
    (N'Tarjeta MicroSD 64GB',            N'Almacenamiento',12.00,  N'MicroSD 64GB clase 10.'),
    (N'Adaptador OTG Tipo-C',            N'Accesorios',     5.00,  N'OTG Tipo-C a USB.'),
    (N'Protector de Cámara (Pack)',      N'Protección',     3.50,  N'Protector lentes cámara.'),
    (N'Pegamento B-7000 (15ml)',         N'Accesorios',     4.50,  N'Adhesivo para reparación ligera.'),
    (N'Kit Limpieza (Spray + Paño)',     N'Accesorios',     3.00,  N'Kit limpieza pantallas.'),
    (N'Batería Genérica (varios modelos)',N'Repuestos',    18.00,  N'Batería genérica según disponibilidad.'),
    (N'Pantalla Genérica (varios modelos)',N'Repuestos',   35.00,  N'Pantalla genérica según disponibilidad.');

    INSERT INTO dbo.Producto(id_categoria, nombre_producto, imagen, descripcion, stock_actual, precio_venta, es_serializado, activo)
    SELECT
        c.id_categoria,
        p.nombre,
        NULL,
        p.descripcion,
        0,
        p.precio,
        0,  -- NO serializado
        1
    FROM @Prod p
    JOIN dbo.Categoria c ON c.nombre_categoria = p.cat
    WHERE NOT EXISTS (
        SELECT 1 FROM dbo.Producto x WHERE x.nombre_producto = p.nombre
    );

    /* -----------------------------
       5) INVENTARIO INICIAL (COMPRAS)
       Insertar Movimientos "Compra" (suma stock por trigger MI)
       - Cantidades mayores para evitar negativos
    ------------------------------*/
    ;WITH P AS (
        SELECT id_producto, nombre_producto
        FROM dbo.Producto
        WHERE es_serializado = 0 AND activo = 1
    )
    INSERT INTO dbo.Movimiento_Inventario
        (fecha, id_producto, id_serial, tipo, cantidad, referencia_tabla, referencia_id, detalle)
    SELECT
        DATEADD(DAY, -15, CAST(@Inicio AS DATETIME2(7))),  -- un poco antes del periodo
        p.id_producto,
        NULL,
        'Compra',
        CASE
            WHEN p.nombre_producto LIKE N'%Mica%' OR p.nombre_producto LIKE N'%Funda%' THEN 300
            WHEN p.nombre_producto LIKE N'%Cable%' OR p.nombre_producto LIKE N'%Cargador%' THEN 200
            WHEN p.nombre_producto LIKE N'%Audífonos%' THEN 160
            WHEN p.nombre_producto LIKE N'%Pantalla%' OR p.nombre_producto LIKE N'%Batería%' THEN 80
            ELSE 120
        END,
        'Seed',
        NULL,
        CONCAT('Carga inicial stock ', p.nombre_producto)
    FROM P p;

    /* -----------------------------
       6) CLIENTES (30)
    ------------------------------*/
    DECLARE @Clientes TABLE(nombres NVARCHAR(100), telefono NVARCHAR(20), email NVARCHAR(100), ident NVARCHAR(13), tipo NVARCHAR(10));

    INSERT INTO @Clientes(nombres, telefono, email, ident, tipo) VALUES
    (N'Carlos Mena',     '0991111111', 'cmena@mail.com',     '1101111111', 'CEDULA'),
    (N'Ana López',       '0982222222', 'alopez@mail.com',    '1102222222', 'CEDULA'),
    (N'Jorge Paredes',   '0973333333', 'jparedes@mail.com',  '1103333333', 'CEDULA'),
    (N'María Andrade',   '0964444444', 'mandrade@mail.com',  '1104444444', 'CEDULA'),
    (N'Luis Zamora',     '0955555555', 'lzamora@mail.com',   '1105555555', 'CEDULA'),
    (N'Valeria Silva',   '0946666666', 'vsilva@mail.com',    '1106666666', 'CEDULA'),
    (N'Kevin Torres',    '0937777777', 'ktorres@mail.com',   '1107777777', 'CEDULA'),
    (N'Fernanda Ruiz',   '0928888888', 'fruiz@mail.com',     '1108888888', 'CEDULA'),
    (N'Diego Chávez',    '0919999999', 'dchavez@mail.com',   '1109999999', 'CEDULA'),
    (N'Paola Herrera',   '0991212121', 'pherrera@mail.com',  '1111212121', 'CEDULA'),
    (N'Miguel Cedeño',   '0981313131', 'mcedeno@mail.com',   '1111313131', 'CEDULA'),
    (N'Gabriela Vaca',   '0971414141', 'gvaca@mail.com',     '1111414141', 'CEDULA'),
    (N'Andrea Mora',     '0961515151', 'amora@mail.com',     '1111515151', 'CEDULA'),
    (N'Juan Molina',     '0951616161', 'jmolina@mail.com',   '1111616161', 'CEDULA'),
    (N'Rosa Delgado',    '0941717171', 'rdelgado@mail.com',  '1111717171', 'CEDULA'),
    (N'Edwin Castillo',  '0931818181', 'ecastillo@mail.com', '1111818181', 'CEDULA'),
    (N'Karen Ibarra',    '0921919191', 'kibarra@mail.com',   '1111919191', 'CEDULA'),
    (N'Erick Vera',      '0992020202', 'evera@mail.com',     '1122020202', 'CEDULA'),
    (N'Sofía Paz',       '0982121212', 'spaz@mail.com',      '1122121212', 'CEDULA'),
    (N'Bryan Cárdenas',  '0972323232', 'bcardenas@mail.com', '1122323232', 'CEDULA'),
    (N'Camila Navas',    '0962424242', 'cnavas@mail.com',    '1122424242', 'CEDULA'),
    (N'Cristian Arias',  '0952525252', 'carias@mail.com',    '1122525252', 'CEDULA'),
    (N'Daniela León',    '0942626262', 'dleon@mail.com',     '1122626262', 'CEDULA'),
    (N'Ricardo Montalvo','0932727272', 'rmontalvo@mail.com', '1122727272', 'CEDULA'),
    (N'Natalia Quintero','0922828282', 'nquintero@mail.com', '1122828282', 'CEDULA'),
    (N'Pablo Rivas',     '0992929292', 'privas@mail.com',    '1122929292', 'CEDULA'),
    (N'Liliana Salazar', '0983030303', 'lsalazar@mail.com',  '1133030303', 'CEDULA'),
    (N'Sebastián Ortega','0973131313', 'sortega@mail.com',   '1133131313', 'CEDULA'),
    (N'Gloria Benítez',  '0963232323', 'gbenitez@mail.com',  '1133232323', 'CEDULA'),
    (N'Empresa SanLo Tech','022345678','ventas@sanlotech.ec','1799999999001','RUC');

    INSERT INTO dbo.Cliente(nombres, telefono, email, identificacion, tipo_identificacion, activo)
    SELECT c.nombres, c.telefono, c.email, c.ident, c.tipo, 1
    FROM @Clientes c
    WHERE NOT EXISTS (
        SELECT 1 FROM dbo.Cliente x WHERE x.identificacion = c.ident
    );

    /* -----------------------------
       7) TABLA DE CONTROL DE STOCK (para evitar negativos)
    ------------------------------*/
    IF OBJECT_ID('tempdb..#Stock') IS NOT NULL DROP TABLE #Stock;

    SELECT
        p.id_producto,
        p.nombre_producto,
        stock_disponible = p.stock_actual,
        p.precio_venta
    INTO #Stock
    FROM dbo.Producto p
    WHERE p.activo = 1 AND p.es_serializado = 0;

    /* -----------------------------
       8) GENERAR 50 FACTURAS (con estacionalidad)
       - Peso alto: Nov, Dic, Ene
       - Peso medio: Feb, Mar (hasta @Hoy)
       - Peso bajo: Sep, Oct
    ------------------------------*/
    DECLARE @n INT = 1;

    WHILE @n <= 50
    BEGIN
        DECLARE @IdCliente INT =
            (SELECT TOP 1 id_cliente FROM dbo.Cliente ORDER BY NEWID());

        /* Fecha con “estacionalidad” dentro del rango */
        DECLARE @Fecha DATE;

        ;WITH C AS (
            SELECT TOP 1 d
            FROM (
                /* Generamos 200 fechas aleatorias en rango y elegimos una por peso */
                SELECT TOP 200
                    d = DATEADD(DAY, ABS(CHECKSUM(NEWID())) % (DATEDIFF(DAY, @Inicio, @Hoy) + 1), @Inicio),
                    peso = CASE
                        WHEN MONTH(DATEADD(DAY, ABS(CHECKSUM(NEWID())) % (DATEDIFF(DAY, @Inicio, @Hoy) + 1), @Inicio)) IN (11,12,1) THEN 8
                        WHEN MONTH(DATEADD(DAY, ABS(CHECKSUM(NEWID())) % (DATEDIFF(DAY, @Inicio, @Hoy) + 1), @Inicio)) IN (2,3) THEN 5
                        WHEN MONTH(DATEADD(DAY, ABS(CHECKSUM(NEWID())) % (DATEDIFF(DAY, @Inicio, @Hoy) + 1), @Inicio)) IN (9,10) THEN 3
                        ELSE 4
                    END
                FROM sys.all_objects
            ) X
            ORDER BY (ABS(CHECKSUM(NEWID())) % 100) * peso DESC
        )
        SELECT @Fecha = d FROM C;

        /* Crear Factura con totales 0 (se recalcula por trigger al insertar detalles) */
        DECLARE @IdFactura INT;

        INSERT INTO dbo.Factura(id_cliente, id_usuario, fecha, iva_porcentaje, subtotal, iva, total)
        VALUES (@IdCliente, @IdUsuario, CAST(@Fecha AS DATETIME2(7)), @Iva, 0, 0, 0);

        SET @IdFactura = SCOPE_IDENTITY();

        /* Detalles por factura: 2 a 5 productos */
        DECLARE @det INT = 1;
        DECLARE @detMax INT = 2 + (ABS(CHECKSUM(NEWID())) % 4); -- 2..5

        WHILE @det <= @detMax
        BEGIN
            /* Elegir producto con stock > 0 */
            DECLARE @IdProducto INT;
            DECLARE @Precio DECIMAL(18,2);
            DECLARE @Stock INT;

            SELECT TOP 1
                @IdProducto = s.id_producto,
                @Precio = s.precio_venta,
                @Stock = s.stock_disponible
            FROM #Stock s
            WHERE s.stock_disponible > 0
            ORDER BY NEWID();

            /* Si por alguna razón no hay stock, salimos (no debería pasar con compras altas) */
            IF @IdProducto IS NULL BREAK;

            /* Cantidad: 1..6 (pero nunca mayor al stock disponible) */
            DECLARE @Cant INT = 1 + (ABS(CHECKSUM(NEWID())) % 6);
            IF @Cant > @Stock SET @Cant = @Stock;

            /* Insert detalle: Venta Directa => trigger genera Movimiento_Inventario (Venta, cantidad negativa) */
            INSERT INTO dbo.Detalle_Factura
                (id_factura, id_producto, id_serial, id_reparacion, descripcion_item, cantidad, precio_unitario, tipo_item)
            VALUES
                (@IdFactura, @IdProducto, NULL, NULL, NULL, @Cant, @Precio, 'Venta Directa');

            /* Descontar de nuestro control para evitar negativos en la simulación */
            UPDATE #Stock
            SET stock_disponible = stock_disponible - @Cant
            WHERE id_producto = @IdProducto;

            SET @det += 1;
        END

        SET @n += 1;
    END

    COMMIT;

    /* -----------------------------
       9) VALIDACIONES RAPIDAS
    ------------------------------*/
    PRINT 'SEED OK: Facturas, detalles e inventario generados sin stock negativo (controlado).';

    SELECT TOP 10
        f.id_factura, f.fecha, f.subtotal, f.iva, f.total,
        c.nombres AS cliente
    FROM dbo.Factura f
    JOIN dbo.Cliente c ON c.id_cliente = f.id_cliente
    ORDER BY f.fecha DESC, f.id_factura DESC;

    SELECT TOP 10
        mi.id_movimiento, mi.fecha, mi.tipo, mi.cantidad, mi.referencia_tabla, mi.referencia_id, mi.id_producto
    FROM dbo.Movimiento_Inventario mi
    ORDER BY mi.fecha DESC, mi.id_movimiento DESC;

    SELECT
        negativos = COUNT(*)
    FROM dbo.Producto
    WHERE stock_actual < 0;

END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK;

    DECLARE @Err NVARCHAR(4000) = ERROR_MESSAGE();
    DECLARE @Line INT = ERROR_LINE();
    RAISERROR('ERROR SEED (%d): %s', 16, 1, @Line, @Err);
END CATCH;
GO