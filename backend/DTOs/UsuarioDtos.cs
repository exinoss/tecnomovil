using System.ComponentModel.DataAnnotations;

namespace backend.DTOs;

public class ClienteDto
{
    public int? IdCliente { get; set; }

    [Required(ErrorMessage = "El nombre es requerido")]
    [MaxLength(100)]
    public string Nombres { get; set; } = string.Empty;

    [MaxLength(20)]
    public string? Telefono { get; set; }

    [MaxLength(100)]
    [EmailAddress(ErrorMessage = "El email no es válido")]
    public string? Email { get; set; }

    [Required(ErrorMessage = "La identificación es requerida")]
    [MaxLength(13)]
    public string Identificacion { get; set; } = string.Empty;

    [Required(ErrorMessage = "El tipo de identificación es requerido")]
    public string TipoIdentificacion { get; set; } = "Cedula";

    public bool Activo { get; set; } = true;
}

public class UsuarioDto
{
    public int? IdUsuario { get; set; }

    [Required(ErrorMessage = "El nombre es requerido")]
    [MaxLength(100)]
    public string Nombres { get; set; } = string.Empty;

    [MaxLength(100)]
    [EmailAddress(ErrorMessage = "El correo no es válido")]
    public string? Correo { get; set; }

    [Required(ErrorMessage = "La identificación es requerida")]
    [MaxLength(13)]
    public string Identificacion { get; set; } = string.Empty;

    [Required(ErrorMessage = "El tipo de identificación es requerido")]
    public string TipoIdentificacion { get; set; } = "Cedula";

    public string? Password { get; set; } // Solo requerido al crear

    [Required(ErrorMessage = "El rol es requerido")]
    public string Rol { get; set; } = "Vendedor";

    public bool Activo { get; set; } = true;
}
