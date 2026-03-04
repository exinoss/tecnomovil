using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class RemoveIdSerialFromRelatedModels : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Detalle_Factura_Producto_Serial_id_serial",
                table: "Detalle_Factura");

            migrationBuilder.DropForeignKey(
                name: "FK_Movimiento_Inventario_Producto_Serial_id_serial",
                table: "Movimiento_Inventario");

            migrationBuilder.DropForeignKey(
                name: "FK_Reparacion_Repuesto_Producto_Serial_id_serial",
                table: "Reparacion_Repuesto");

            migrationBuilder.DropIndex(
                name: "IX_Reparacion_Repuesto_id_serial",
                table: "Reparacion_Repuesto");

            migrationBuilder.DropIndex(
                name: "UX_RR_ConSerial",
                table: "Reparacion_Repuesto");

            migrationBuilder.DropIndex(
                name: "UX_RR_NoSerial",
                table: "Reparacion_Repuesto");

            migrationBuilder.DropIndex(
                name: "IX_Movimiento_Inventario_id_serial",
                table: "Movimiento_Inventario");

            migrationBuilder.DropIndex(
                name: "IX_Detalle_Factura_id_serial",
                table: "Detalle_Factura");

            migrationBuilder.DropColumn(
                name: "id_serial",
                table: "Reparacion_Repuesto");

            migrationBuilder.DropColumn(
                name: "id_serial",
                table: "Movimiento_Inventario");

            migrationBuilder.DropColumn(
                name: "id_serial",
                table: "Detalle_Factura");

            migrationBuilder.CreateIndex(
                name: "UX_RR_ReparacionProducto",
                table: "Reparacion_Repuesto",
                columns: new[] { "id_reparacion", "id_producto" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "UX_RR_ReparacionProducto",
                table: "Reparacion_Repuesto");

            migrationBuilder.AddColumn<int>(
                name: "id_serial",
                table: "Reparacion_Repuesto",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "id_serial",
                table: "Movimiento_Inventario",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "id_serial",
                table: "Detalle_Factura",
                type: "int",
                nullable: true);

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
                name: "IX_Movimiento_Inventario_id_serial",
                table: "Movimiento_Inventario",
                column: "id_serial");

            migrationBuilder.CreateIndex(
                name: "IX_Detalle_Factura_id_serial",
                table: "Detalle_Factura",
                column: "id_serial");

            migrationBuilder.AddForeignKey(
                name: "FK_Detalle_Factura_Producto_Serial_id_serial",
                table: "Detalle_Factura",
                column: "id_serial",
                principalTable: "Producto_Serial",
                principalColumn: "id_serial");

            migrationBuilder.AddForeignKey(
                name: "FK_Movimiento_Inventario_Producto_Serial_id_serial",
                table: "Movimiento_Inventario",
                column: "id_serial",
                principalTable: "Producto_Serial",
                principalColumn: "id_serial");

            migrationBuilder.AddForeignKey(
                name: "FK_Reparacion_Repuesto_Producto_Serial_id_serial",
                table: "Reparacion_Repuesto",
                column: "id_serial",
                principalTable: "Producto_Serial",
                principalColumn: "id_serial",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
