using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models;

[Table("Reparacion")]
public class Reparacion
{
    [Key]
    [Column("id_reparacion")]
    public int IdReparacion { get; set; }

    [Column("id_cliente")]
    public int IdCliente { get; set; }

    [Column("id_usuario")]
    public int IdUsuario { get; set; } // Técnico asignado

    [Required]
    [MaxLength(100)]
    [Column("modelo_equipo")]
    public string ModeloEquipo { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    [Column("serie_imei_ingreso")]
    public string SerieImeiIngreso { get; set; } = string.Empty;

    [Column("descripcion_falla")]
    public string? DescripcionFalla { get; set; }

    [Column("diagnostico_final")]
    public string? DiagnosticoFinal { get; set; }

    [Column("costo_mano_obra", TypeName = "decimal(18,2)")]
    public decimal CostoManoObra { get; set; } = 0;

    [Required]
    [MaxLength(20)]
    [Column("estado")]
    public string Estado { get; set; } = "Recibido"; // Recibido, Cotizado, Aprobado, En Proceso, Reparado, Entregado, Rechazado, Cancelado

    [Column("aprobado")]
    public bool? Aprobado { get; set; }

    [Column("fecha_aprobacion")]
    public DateTime? FechaAprobacion { get; set; }

    [MaxLength(200)]
    [Column("motivo_rechazo")]
    public string? MotivoRechazo { get; set; }

    [Column("fecha_ingreso")]
    public DateTime FechaIngreso { get; set; } = DateTime.Now;

    // Navigation
    [ForeignKey("IdCliente")]
    public virtual Cliente? Cliente { get; set; }

    [ForeignKey("IdUsuario")]
    public virtual Usuario? Tecnico { get; set; }

    public virtual ICollection<ReparacionRepuesto> Repuestos { get; set; } = new List<ReparacionRepuesto>();
    public virtual ICollection<FacturaReparacion> FacturaReparaciones { get; set; } = new List<FacturaReparacion>();
}
