using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace backend.Models;

[Table("Factura_Reparacion")]
[PrimaryKey(nameof(IdFactura), nameof(IdReparacion))]
public class FacturaReparacion
{
    [Column("id_factura")]
    public int IdFactura { get; set; }

    [Column("id_reparacion")]
    public int IdReparacion { get; set; }

    // Navigation
    [ForeignKey("IdFactura")]
    public virtual Factura? Factura { get; set; }

    [ForeignKey("IdReparacion")]
    public virtual Reparacion? Reparacion { get; set; }
}
