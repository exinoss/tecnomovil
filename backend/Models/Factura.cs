using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models;

[Table("Factura")]
public class Factura
{
    [Key]
    [Column("id_factura")]
    public int IdFactura { get; set; }

    [Column("id_cliente")]
    public int IdCliente { get; set; }

    [Column("id_usuario")]
    public int IdUsuario { get; set; } // Vendedor

    [Column("fecha")]
    public DateTime Fecha { get; set; } = DateTime.Now;

    [Column("iva_porcentaje", TypeName = "decimal(5,2)")]
    public decimal IvaPorcentaje { get; set; } = 0;

    [Column("subtotal", TypeName = "decimal(18,2)")]
    public decimal Subtotal { get; set; } = 0;

    [Column("iva", TypeName = "decimal(18,2)")]
    public decimal Iva { get; set; } = 0;

    [Column("total", TypeName = "decimal(18,2)")]
    public decimal Total { get; set; } = 0;

    // Navigation
    [ForeignKey("IdCliente")]
    public virtual Cliente? Cliente { get; set; }

    [ForeignKey("IdUsuario")]
    public virtual Usuario? Vendedor { get; set; }

    public virtual ICollection<DetalleFactura> Detalles { get; set; } = new List<DetalleFactura>();
    public virtual ICollection<FacturaReparacion> FacturaReparaciones { get; set; } = new List<FacturaReparacion>();
}
