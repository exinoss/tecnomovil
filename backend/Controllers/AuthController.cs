using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using backend.Data;
using backend.DTOs;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly TecnoMovilDbContext _context;
    private readonly IConfiguration _configuration;

    public AuthController(TecnoMovilDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    [HttpPost("login")]
    public async Task<ActionResult<LoginResponseDto>> Login([FromBody] LoginDto loginDto)
    {
        var usuario = await _context.Usuarios
            .FirstOrDefaultAsync(u => u.Identificacion == loginDto.Identificacion && u.Activo);

        if (usuario == null)
        {
            return Ok(new LoginResponseDto
            {
                Success = false,
                Message = "Usuario no encontrado o inactivo"
            });
        }

        if (!BCrypt.Net.BCrypt.Verify(loginDto.Password, usuario.PasswordHash))
        {
            return Ok(new LoginResponseDto
            {
                Success = false,
                Message = "Contraseña incorrecta"
            });
        }

        var token = GenerateJwtToken(usuario);

        return Ok(new LoginResponseDto
        {
            Success = true,
            Message = "Login exitoso",
            Token = token,
            Usuario = new UsuarioInfoDto
            {
                IdUsuario = usuario.IdUsuario,
                Nombres = usuario.Nombres,
                Correo = usuario.Correo,
                Rol = usuario.Rol
            }
        });
    }

    private string GenerateJwtToken(Models.Usuario usuario)
    {
        var jwtKey = Environment.GetEnvironmentVariable("JWT_SECRET_KEY") 
            ?? throw new InvalidOperationException("JWT_SECRET_KEY not configured");

        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, usuario.IdUsuario.ToString()),
            new Claim(ClaimTypes.Name, usuario.Nombres),
            new Claim(ClaimTypes.Email, usuario.Correo ?? ""),
            new Claim(ClaimTypes.Role, usuario.Rol),
            new Claim("identificacion", usuario.Identificacion)
        };

        var token = new JwtSecurityToken(
            issuer: "TecnoMovilAPI",
            audience: "TecnoMovilApp",
            claims: claims,
            expires: DateTime.Now.AddHours(8),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
