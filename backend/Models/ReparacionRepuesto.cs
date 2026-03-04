using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models;

[Table("Reparacion_Repuesto")]
public class ReparacionRepuesto
{
    [Key]
    [Column("id_reparacion_repuesto")]
    public int IdReparacionRepuesto { get; set; }

    [Column("id_reparacion")]
    public int IdReparacion { get; set; }

    [Column("id_producto")]
    public int IdProducto { get; set; }


    [Column("cantidad")]
    public int Cantidad { get; set; }

    [Column("costo_unitario", TypeName = "decimal(18,2)")]
    public decimal? CostoUnitario { get; set; }

    [Column("precio_cobrado", TypeName = "decimal(18,2)")]
    public decimal? PrecioCobrado { get; set; }

    // Navigation
    [ForeignKey("IdReparacion")]
    public virtual Reparacion? Reparacion { get; set; }

    [ForeignKey("IdProducto")]
    public virtual Producto? Producto { get; set; }

}
