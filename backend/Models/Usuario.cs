using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models;

[Table("Usuario")]
public class Usuario
{
    [Key]
    [Column("id_usuario")]
    public int IdUsuario { get; set; }

    [Required]
    [MaxLength(100)]
    [Column("nombres")]
    public string Nombres { get; set; } = string.Empty;

    [MaxLength(100)]
    [Column("correo")]
    public string? Correo { get; set; }

    [Required]
    [MaxLength(13)]
    [Column("identificacion")]
    public string Identificacion { get; set; } = string.Empty;

    [Required]
    [MaxLength(10)]
    [Column("tipo_identificacion")]
    public string TipoIdentificacion { get; set; } = "Cedula"; // Cedula, RUC

    [Required]
    [MaxLength(255)]
    [Column("password_hash")]
    public string PasswordHash { get; set; } = string.Empty;

    [Required]
    [MaxLength(20)]
    [Column("rol")]
    public string Rol { get; set; } = "Vendedor"; // Admin, Tecnico, Vendedor

    [Column("activo")]
    public bool Activo { get; set; } = true;

    // Navigation
    public virtual ICollection<Reparacion> Reparaciones { get; set; } = new List<Reparacion>();
    public virtual ICollection<Factura> Facturas { get; set; } = new List<Factura>();
}
