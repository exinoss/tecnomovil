using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models;

[Table("Categoria")]
public class Categoria
{
    [Key]
    [Column("id_categoria")]
    public int IdCategoria { get; set; }

    [Required]
    [MaxLength(50)]
    [Column("nombre_categoria")]
    public string NombreCategoria { get; set; } = string.Empty;

    [Column("activo")]
    public bool Activo { get; set; } = true;

    // Navigation
    public virtual ICollection<Producto> Productos { get; set; } = new List<Producto>();
}
