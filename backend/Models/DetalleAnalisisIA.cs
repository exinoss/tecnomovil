using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models;

[Table("Detalle_Analisis_IA")]
public class DetalleAnalisisIA
{
    [Key]
    [Column("id_detalle_analisis")]
    public int IdDetalleAnalisis { get; set; }

    [Column("id_analisis")]
    public int IdAnalisis { get; set; }

    [Column("id_producto")]
    public int IdProducto { get; set; }

    [Column("ventas_historicas_json")]
    public string VentasHistoricasJson { get; set; } = "[]";

    [Column("sugerencia_compra")]
    public int SugerenciaCompra { get; set; }

    [Column("justificacion")]
    public string Justificacion { get; set; } = string.Empty;

    [Column("proyeccion_proximo_mes")]
    public int ProyeccionProximoMes { get; set; }

    [MaxLength(20)]
    [Column("nivel_urgencia")]
    public string NivelUrgencia { get; set; } = "Baja"; // Alta, Media, Baja

    // Navigation
    [ForeignKey("IdAnalisis")]
    public virtual AnalisisIA? AnalisisIA { get; set; }

    [ForeignKey("IdProducto")]
    public virtual Producto? Producto { get; set; }
}
