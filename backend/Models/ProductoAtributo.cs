using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace backend.Models;

[Table("Producto_Atributo")]
[PrimaryKey(nameof(IdProducto), nameof(IdAtributo))]
public class ProductoAtributo
{
    [Column("id_producto")]
    public int IdProducto { get; set; }

    [Column("id_atributo")]
    public int IdAtributo { get; set; }

    [Column("valor_texto")]
    public string? ValorTexto { get; set; }

    [Column("valor_numero", TypeName = "decimal(18,4)")]
    public decimal? ValorNumero { get; set; }

    [Column("valor_bool")]
    public bool? ValorBool { get; set; }

    [Column("valor_fecha")]
    public DateOnly? ValorFecha { get; set; }

    // Navigation
    [ForeignKey("IdProducto")]
    public virtual Producto? Producto { get; set; }

    [ForeignKey("IdAtributo")]
    public virtual Atributo? Atributo { get; set; }
}
