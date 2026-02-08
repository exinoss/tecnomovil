using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models;

[Table("Movimiento_Inventario")]
public class MovimientoInventario
{
    [Key]
    [Column("id_movimiento")]
    public int IdMovimiento { get; set; }

    [Column("fecha")]
    public DateTime Fecha { get; set; } = DateTime.Now;

    [Column("id_producto")]
    public int IdProducto { get; set; }

    [Column("id_serial")]
    public int? IdSerial { get; set; }

    [Required]
    [MaxLength(30)]
    [Column("tipo")]
    public string Tipo { get; set; } = string.Empty; // Compra, Venta, ConsumoReparacion, Ajuste, Devolucion

    [Column("cantidad")]
    public int Cantidad { get; set; } // + entrada, - salida

    [MaxLength(30)]
    [Column("referencia_tabla")]
    public string? ReferenciaTabla { get; set; }

    [Column("referencia_id")]
    public int? ReferenciaId { get; set; }

    [MaxLength(200)]
    [Column("detalle")]
    public string? Detalle { get; set; }

    // Navigation
    [ForeignKey("IdProducto")]
    public virtual Producto? Producto { get; set; }

    [ForeignKey("IdSerial")]
    public virtual ProductoSerial? Serial { get; set; }
}
