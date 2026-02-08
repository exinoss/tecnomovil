using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models;

[Table("Cliente")]
public class Cliente
{
    [Key]
    [Column("id_cliente")]
    public int IdCliente { get; set; }

    [Required]
    [MaxLength(100)]
    [Column("nombres")]
    public string Nombres { get; set; } = string.Empty;

    [MaxLength(20)]
    [Column("telefono")]
    public string? Telefono { get; set; }

    [MaxLength(100)]
    [Column("email")]
    public string? Email { get; set; }

    [Required]
    [MaxLength(13)]
    [Column("identificacion")]
    public string Identificacion { get; set; } = string.Empty;

    [Required]
    [MaxLength(10)]
    [Column("tipo_identificacion")]
    public string TipoIdentificacion { get; set; } = "Cedula"; // Cedula, RUC, Pasaporte

    [Column("activo")]
    public bool Activo { get; set; } = true;

    // Navigation
    public virtual ICollection<Reparacion> Reparaciones { get; set; } = new List<Reparacion>();
    public virtual ICollection<Factura> Facturas { get; set; } = new List<Factura>();
}
