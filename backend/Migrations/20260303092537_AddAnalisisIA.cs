using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddAnalisisIA : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Analisis_IA",
                columns: table => new
                {
                    id_analisis = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    fecha_generacion = table.Column<DateTime>(type: "datetime2", nullable: false),
                    total_productos_analizados = table.Column<int>(type: "int", nullable: false),
                    periodo_inicio = table.Column<DateTime>(type: "datetime2", nullable: false),
                    periodo_fin = table.Column<DateTime>(type: "datetime2", nullable: false),
                    tokens_usados = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Analisis_IA", x => x.id_analisis);
                });

            migrationBuilder.CreateTable(
                name: "Detalle_Analisis_IA",
                columns: table => new
                {
                    id_detalle_analisis = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    id_analisis = table.Column<int>(type: "int", nullable: false),
                    id_producto = table.Column<int>(type: "int", nullable: false),
                    ventas_historicas_json = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    sugerencia_compra = table.Column<int>(type: "int", nullable: false),
                    justificacion = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    proyeccion_proximo_mes = table.Column<int>(type: "int", nullable: false),
                    nivel_urgencia = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Detalle_Analisis_IA", x => x.id_detalle_analisis);
                    table.ForeignKey(
                        name: "FK_Detalle_Analisis_IA_Analisis_IA_id_analisis",
                        column: x => x.id_analisis,
                        principalTable: "Analisis_IA",
                        principalColumn: "id_analisis",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Detalle_Analisis_IA_Producto_id_producto",
                        column: x => x.id_producto,
                        principalTable: "Producto",
                        principalColumn: "id_producto",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Detalle_Analisis_IA_id_analisis",
                table: "Detalle_Analisis_IA",
                column: "id_analisis");

            migrationBuilder.CreateIndex(
                name: "IX_Detalle_Analisis_IA_id_producto",
                table: "Detalle_Analisis_IA",
                column: "id_producto");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Detalle_Analisis_IA");

            migrationBuilder.DropTable(
                name: "Analisis_IA");
        }
    }
}
