using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models;

[Table("Atributo")]
public class Atributo
{
    [Key]
    [Column("id_atributo")]
    public int IdAtributo { get; set; }

    [Required]
    [MaxLength(60)]
    [Column("nombre_atributo")]
    public string NombreAtributo { get; set; } = string.Empty;

    [Required]
    [MaxLength(10)]
    [Column("tipo_dato")]
    public string TipoDato { get; set; } = "texto"; // texto, numero, bool, fecha

    [MaxLength(20)]
    [Column("unidad")]
    public string? Unidad { get; set; }

    [Column("activo")]
    public bool Activo { get; set; } = true;

    // Navigation
    public virtual ICollection<ProductoAtributo> ProductoAtributos { get; set; } = new List<ProductoAtributo>();
}
