using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Atributo",
                columns: table => new
                {
                    id_atributo = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    nombre_atributo = table.Column<string>(type: "nvarchar(60)", maxLength: 60, nullable: false),
                    tipo_dato = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    unidad = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    activo = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Atributo", x => x.id_atributo);
                });

            migrationBuilder.CreateTable(
                name: "Categoria",
                columns: table => new
                {
                    id_categoria = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    nombre_categoria = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    activo = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Categoria", x => x.id_categoria);
                });

            migrationBuilder.CreateTable(
                name: "Cliente",
                columns: table => new
                {
                    id_cliente = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    nombres = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    telefono = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    email = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    identificacion = table.Column<string>(type: "nvarchar(13)", maxLength: 13, nullable: false),
                    tipo_identificacion = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    activo = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Cliente", x => x.id_cliente);
                });

            migrationBuilder.CreateTable(
                name: "Configuracion",
                columns: table => new
                {
                    id_config = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    iva_porcentaje = table.Column<decimal>(type: "decimal(5,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Configuracion", x => x.id_config);
                    table.CheckConstraint("CK_Configuracion_UnaFila", "id_config = 1");
                });

            migrationBuilder.CreateTable(
                name: "Usuario",
                columns: table => new
                {
                    id_usuario = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    nombres = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    correo = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    identificacion = table.Column<string>(type: "nvarchar(13)", maxLength: 13, nullable: false),
                    tipo_identificacion = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    password_hash = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    rol = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    activo = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Usuario", x => x.id_usuario);
                });

            migrationBuilder.CreateTable(
                name: "Producto",
                columns: table => new
                {
                    id_producto = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    id_categoria = table.Column<int>(type: "int", nullable: false),
                    nombre_producto = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    imagen = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    descripcion = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    stock_actual = table.Column<int>(type: "int", nullable: false),
                    precio_venta = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    es_serializado = table.Column<bool>(type: "bit", nullable: false),
                    activo = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Producto", x => x.id_producto);
                    table.ForeignKey(
                        name: "FK_Producto_Categoria_id_categoria",
                        column: x => x.id_categoria,
                        principalTable: "Categoria",
                        principalColumn: "id_categoria",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Factura",
                columns: table => new
                {
                    id_factura = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    id_cliente = table.Column<int>(type: "int", nullable: false),
                    id_usuario = table.Column<int>(type: "int", nullable: false),
                    fecha = table.Column<DateTime>(type: "datetime2", nullable: false),
                    iva_porcentaje = table.Column<decimal>(type: "decimal(5,2)", nullable: false),
                    subtotal = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    iva = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    total = table.Column<decimal>(type: "decimal(18,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Factura", x => x.id_factura);
                    table.ForeignKey(
                        name: "FK_Factura_Cliente_id_cliente",
                        column: x => x.id_cliente,
                        principalTable: "Cliente",
                        principalColumn: "id_cliente",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Factura_Usuario_id_usuario",
                        column: x => x.id_usuario,
                        principalTable: "Usuario",
                        principalColumn: "id_usuario",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Reparacion",
                columns: table => new
                {
                    id_reparacion = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    id_cliente = table.Column<int>(type: "int", nullable: false),
                    id_usuario = table.Column<int>(type: "int", nullable: false),
                    modelo_equipo = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    serie_imei_ingreso = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    descripcion_falla = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    diagnostico_final = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    costo_mano_obra = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    estado = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    aprobado = table.Column<bool>(type: "bit", nullable: true),
                    fecha_aprobacion = table.Column<DateTime>(type: "datetime2", nullable: true),
                    motivo_rechazo = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    fecha_ingreso = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Reparacion", x => x.id_reparacion);
                    table.ForeignKey(
                        name: "FK_Reparacion_Cliente_id_cliente",
                        column: x => x.id_cliente,
                        principalTable: "Cliente",
                        principalColumn: "id_cliente",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Reparacion_Usuario_id_usuario",
                        column: x => x.id_usuario,
                        principalTable: "Usuario",
                        principalColumn: "id_usuario",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Producto_Atributo",
                columns: table => new
                {
                    id_producto = table.Column<int>(type: "int", nullable: false),
                    id_atributo = table.Column<int>(type: "int", nullable: false),
                    valor_texto = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    valor_numero = table.Column<decimal>(type: "decimal(18,4)", nullable: true),
                    valor_bool = table.Column<bool>(type: "bit", nullable: true),
                    valor_fecha = table.Column<DateOnly>(type: "date", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Producto_Atributo", x => new { x.id_producto, x.id_atributo });
                    table.ForeignKey(
                        name: "FK_Producto_Atributo_Atributo_id_atributo",
                        column: x => x.id_atributo,
                        principalTable: "Atributo",
                        principalColumn: "id_atributo",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Producto_Atributo_Producto_id_producto",
                        column: x => x.id_producto,
                        principalTable: "Producto",
                        principalColumn: "id_producto",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Producto_Serial",
                columns: table => new
                {
                    id_serial = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    id_producto = table.Column<int>(type: "int", nullable: false),
                    numero_serie_imei = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    estado = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Producto_Serial", x => x.id_serial);
                    table.ForeignKey(
                        name: "FK_Producto_Serial_Producto_id_producto",
                        column: x => x.id_producto,
                        principalTable: "Producto",
                        principalColumn: "id_producto",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Factura_Reparacion",
                columns: table => new
                {
                    id_factura = table.Column<int>(type: "int", nullable: false),
                    id_reparacion = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Factura_Reparacion", x => new { x.id_factura, x.id_reparacion });
                    table.ForeignKey(
                        name: "FK_Factura_Reparacion_Factura_id_factura",
                        column: x => x.id_factura,
                        principalTable: "Factura",
                        principalColumn: "id_factura",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Factura_Reparacion_Reparacion_id_reparacion",
                        column: x => x.id_reparacion,
                        principalTable: "Reparacion",
                        principalColumn: "id_reparacion",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Detalle_Factura",
                columns: table => new
                {
                    id_detalle = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    id_factura = table.Column<int>(type: "int", nullable: false),
                    id_producto = table.Column<int>(type: "int", nullable: true),
                    id_serial = table.Column<int>(type: "int", nullable: true),
                    id_reparacion = table.Column<int>(type: "int", nullable: true),
                    descripcion_item = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    cantidad = table.Column<int>(type: "int", nullable: false),
                    precio_unitario = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    tipo_item = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Detalle_Factura", x => x.id_detalle);
                    table.ForeignKey(
                        name: "FK_Detalle_Factura_Factura_id_factura",
                        column: x => x.id_factura,
                        principalTable: "Factura",
                        principalColumn: "id_factura",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Detalle_Factura_Producto_Serial_id_serial",
                        column: x => x.id_serial,
                        principalTable: "Producto_Serial",
                        principalColumn: "id_serial");
                    table.ForeignKey(
                        name: "FK_Detalle_Factura_Producto_id_producto",
                        column: x => x.id_producto,
                        principalTable: "Producto",
                        principalColumn: "id_producto");
                    table.ForeignKey(
                        name: "FK_Detalle_Factura_Reparacion_id_reparacion",
                        column: x => x.id_reparacion,
                        principalTable: "Reparacion",
                        principalColumn: "id_reparacion",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Movimiento_Inventario",
                columns: table => new
                {
                    id_movimiento = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    fecha = table.Column<DateTime>(type: "datetime2", nullable: false),
                    id_producto = table.Column<int>(type: "int", nullable: false),
                    id_serial = table.Column<int>(type: "int", nullable: true),
                    tipo = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    cantidad = table.Column<int>(type: "int", nullable: false),
                    referencia_tabla = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: true),
                    referencia_id = table.Column<int>(type: "int", nullable: true),
                    detalle = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Movimiento_Inventario", x => x.id_movimiento);
                    table.ForeignKey(
                        name: "FK_Movimiento_Inventario_Producto_Serial_id_serial",
                        column: x => x.id_serial,
                        principalTable: "Producto_Serial",
                        principalColumn: "id_serial");
                    table.ForeignKey(
                        name: "FK_Movimiento_Inventario_Producto_id_producto",
                        column: x => x.id_producto,
                        principalTable: "Producto",
                        principalColumn: "id_producto",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Reparacion_Repuesto",
                columns: table => new
                {
                    id_reparacion_repuesto = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    id_reparacion = table.Column<int>(type: "int", nullable: false),
                    id_producto = table.Column<int>(type: "int", nullable: false),
                    id_serial = table.Column<int>(type: "int", nullable: true),
                    cantidad = table.Column<int>(type: "int", nullable: false),
                    costo_unitario = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    precio_cobrado = table.Column<decimal>(type: "decimal(18,2)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Reparacion_Repuesto", x => x.id_reparacion_repuesto);
                    table.ForeignKey(
                        name: "FK_Reparacion_Repuesto_Producto_Serial_id_serial",
                        column: x => x.id_serial,
                        principalTable: "Producto_Serial",
                        principalColumn: "id_serial",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Reparacion_Repuesto_Producto_id_producto",
                        column: x => x.id_producto,
                        principalTable: "Producto",
                        principalColumn: "id_producto",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Reparacion_Repuesto_Reparacion_id_reparacion",
                        column: x => x.id_reparacion,
                        principalTable: "Reparacion",
                        principalColumn: "id_reparacion",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "Configuracion",
                columns: new[] { "id_config", "iva_porcentaje" },
                values: new object[] { 1, 15.00m });

            migrationBuilder.CreateIndex(
                name: "IX_Atributo_nombre_atributo",
                table: "Atributo",
                column: "nombre_atributo",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Cliente_identificacion",
                table: "Cliente",
                column: "identificacion",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Detalle_factura",
                table: "Detalle_Factura",
                column: "id_factura");

            migrationBuilder.CreateIndex(
                name: "IX_Detalle_Factura_id_producto",
                table: "Detalle_Factura",
                column: "id_producto");

            migrationBuilder.CreateIndex(
                name: "IX_Detalle_Factura_id_reparacion",
                table: "Detalle_Factura",
                column: "id_reparacion");

            migrationBuilder.CreateIndex(
                name: "IX_Detalle_Factura_id_serial",
                table: "Detalle_Factura",
                column: "id_serial");

            migrationBuilder.CreateIndex(
                name: "IX_Factura_id_cliente",
                table: "Factura",
                column: "id_cliente");

            migrationBuilder.CreateIndex(
                name: "IX_Factura_id_usuario",
                table: "Factura",
                column: "id_usuario");

            migrationBuilder.CreateIndex(
                name: "IX_FR_reparacion",
                table: "Factura_Reparacion",
                column: "id_reparacion");

            migrationBuilder.CreateIndex(
                name: "IX_MI_producto_fecha",
                table: "Movimiento_Inventario",
                columns: new[] { "id_producto", "fecha" });

            migrationBuilder.CreateIndex(
                name: "IX_Movimiento_Inventario_id_serial",
                table: "Movimiento_Inventario",
                column: "id_serial");

            migrationBuilder.CreateIndex(
                name: "IX_Producto_id_categoria",
                table: "Producto",
                column: "id_categoria");

            migrationBuilder.CreateIndex(
                name: "IX_PA_Atributo",
                table: "Producto_Atributo",
                columns: new[] { "id_atributo", "id_producto" });

            migrationBuilder.CreateIndex(
                name: "IX_Producto_Serial_numero_serie_imei",
                table: "Producto_Serial",
                column: "numero_serie_imei",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Serial_id_producto",
                table: "Producto_Serial",
                column: "id_producto");

            migrationBuilder.CreateIndex(
                name: "IX_Reparacion_cliente",
                table: "Reparacion",
                column: "id_cliente");

            migrationBuilder.CreateIndex(
                name: "IX_Reparacion_tecnico",
                table: "Reparacion",
                column: "id_usuario");

            migrationBuilder.CreateIndex(
                name: "IX_Reparacion_Repuesto_id_producto",
                table: "Reparacion_Repuesto",
                column: "id_producto");

            migrationBuilder.CreateIndex(
                name: "IX_Reparacion_Repuesto_id_serial",
                table: "Reparacion_Repuesto",
                column: "id_serial");

            migrationBuilder.CreateIndex(
                name: "UX_RR_ConSerial",
                table: "Reparacion_Repuesto",
                columns: new[] { "id_reparacion", "id_serial" },
                unique: true,
                filter: "[id_serial] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "UX_RR_NoSerial",
                table: "Reparacion_Repuesto",
                columns: new[] { "id_reparacion", "id_producto" },
                unique: true,
                filter: "[id_serial] IS NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Usuario_correo",
                table: "Usuario",
                column: "correo",
                unique: true,
                filter: "[correo] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Usuario_identificacion",
                table: "Usuario",
                column: "identificacion",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Configuracion");

            migrationBuilder.DropTable(
                name: "Detalle_Factura");

            migrationBuilder.DropTable(
                name: "Factura_Reparacion");

            migrationBuilder.DropTable(
                name: "Movimiento_Inventario");

            migrationBuilder.DropTable(
                name: "Producto_Atributo");

            migrationBuilder.DropTable(
                name: "Reparacion_Repuesto");

            migrationBuilder.DropTable(
                name: "Factura");

            migrationBuilder.DropTable(
                name: "Atributo");

            migrationBuilder.DropTable(
                name: "Producto_Serial");

            migrationBuilder.DropTable(
                name: "Reparacion");

            migrationBuilder.DropTable(
                name: "Producto");

            migrationBuilder.DropTable(
                name: "Cliente");

            migrationBuilder.DropTable(
                name: "Usuario");

            migrationBuilder.DropTable(
                name: "Categoria");
        }
    }
}
