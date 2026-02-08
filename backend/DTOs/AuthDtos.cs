using System.ComponentModel.DataAnnotations;

namespace backend.DTOs;

public class LoginDto
{
    [Required(ErrorMessage = "La identificación es requerida")]
    public string Identificacion { get; set; } = string.Empty;

    [Required(ErrorMessage = "La contraseña es requerida")]
    public string Password { get; set; } = string.Empty;
}

public class LoginResponseDto
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public string? Token { get; set; }
    public UsuarioInfoDto? Usuario { get; set; }
}

public class UsuarioInfoDto
{
    public int IdUsuario { get; set; }
    public string Nombres { get; set; } = string.Empty;
    public string? Correo { get; set; }
    public string Rol { get; set; } = string.Empty;
}
