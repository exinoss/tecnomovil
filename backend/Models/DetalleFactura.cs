using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models;

[Table("Detalle_Factura")]
public class DetalleFactura
{
    [Key]
    [Column("id_detalle")]
    public int IdDetalle { get; set; }

    [Column("id_factura")]
    public int IdFactura { get; set; }

    [Column("id_producto")]
    public int? IdProducto { get; set; }

    [Column("id_serial")]
    public int? IdSerial { get; set; }

    [Column("id_reparacion")]
    public int? IdReparacion { get; set; }

    [MaxLength(200)]
    [Column("descripcion_item")]
    public string? DescripcionItem { get; set; }

    [Column("cantidad")]
    public int Cantidad { get; set; }

    [Column("precio_unitario", TypeName = "decimal(18,2)")]
    public decimal PrecioUnitario { get; set; }

    [Required]
    [MaxLength(30)]
    [Column("tipo_item")]
    public string TipoItem { get; set; } = "Venta Directa"; // Venta Directa, Repuesto, Servicio

    // Navigation
    [ForeignKey("IdFactura")]
    public virtual Factura? Factura { get; set; }

    [ForeignKey("IdProducto")]
    public virtual Producto? Producto { get; set; }

    [ForeignKey("IdSerial")]
    public virtual ProductoSerial? Serial { get; set; }

    [ForeignKey("IdReparacion")]
    public virtual Reparacion? Reparacion { get; set; }
}
