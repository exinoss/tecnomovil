using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models;

[Table("Producto")]
public class Producto
{
    [Key]
    [Column("id_producto")]
    public int IdProducto { get; set; }

    [Column("id_categoria")]
    public int IdCategoria { get; set; }

    [Required]
    [MaxLength(255)]
    [Column("nombre_producto")]
    public string NombreProducto { get; set; } = string.Empty;

    [Column("imagen")]
    public string? Imagen { get; set; }

    [Column("descripcion")]
    public string? Descripcion { get; set; }

    [Column("stock_actual")]
    public int StockActual { get; set; } = 0;

    [Column("precio_venta", TypeName = "decimal(18,2)")]
    public decimal PrecioVenta { get; set; }

    [Column("es_serializado")]
    public bool EsSerializado { get; set; } = false;

    [Column("activo")]
    public bool Activo { get; set; } = true;

    // Navigation
    [ForeignKey("IdCategoria")]
    public virtual Categoria? Categoria { get; set; }

    public virtual ICollection<ProductoSerial> Seriales { get; set; } = new List<ProductoSerial>();
    public virtual ICollection<ProductoAtributo> Atributos { get; set; } = new List<ProductoAtributo>();
}
