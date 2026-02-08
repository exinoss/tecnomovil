using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models;

[Table("Producto_Serial")]
public class ProductoSerial
{
    [Key]
    [Column("id_serial")]
    public int IdSerial { get; set; }

    [Column("id_producto")]
    public int IdProducto { get; set; }

    [Required]
    [MaxLength(50)]
    [Column("numero_serie_imei")]
    public string NumeroSerieImei { get; set; } = string.Empty;

    [Required]
    [MaxLength(20)]
    [Column("estado")]
    public string Estado { get; set; } = "Disponible"; // Disponible, Vendido, En Reparacion, Reservado

    // Navigation
    [ForeignKey("IdProducto")]
    public virtual Producto? Producto { get; set; }
}
