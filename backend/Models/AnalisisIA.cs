using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models;

[Table("Analisis_IA")]
public class AnalisisIA
{
    [Key]
    [Column("id_analisis")]
    public int IdAnalisis { get; set; }

    [Column("fecha_generacion")]
    public DateTime FechaGeneracion { get; set; } = DateTime.Now;

    [Column("total_productos_analizados")]
    public int TotalProductosAnalizados { get; set; }

    [Column("periodo_inicio")]
    public DateTime PeriodoInicio { get; set; }

    [Column("periodo_fin")]
    public DateTime PeriodoFin { get; set; }

    [Column("tokens_usados")]
    public int? TokensUsados { get; set; }

    // Navigation
    public virtual ICollection<DetalleAnalisisIA> Detalles { get; set; } = new List<DetalleAnalisisIA>();
}
