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

public class AuthResponseDto
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
}

public class SolicitarCodigoDto
{
    [Required(ErrorMessage = "El correo es requerido")]
    public string Correo { get; set; } = string.Empty;
}

public class VerificarCodigoDto
{
    [Required(ErrorMessage = "El correo es requerido")]
    public string Correo { get; set; } = string.Empty;

    [Required(ErrorMessage = "El código es requerido")]
    public string Codigo { get; set; } = string.Empty;
}

public class ResetearContraseniaDto
{
    [Required(ErrorMessage = "El correo es requerido")]
    public string Correo { get; set; } = string.Empty;

    [Required(ErrorMessage = "El código es requerido")]
    public string Codigo { get; set; } = string.Empty;

    [Required(ErrorMessage = "La nueva contraseña es requerida")]
    [MinLength(6, ErrorMessage = "La contraseña debe tener al menos 6 caracteres")]
    public string NuevaPassword { get; set; } = string.Empty;
}
