using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using backend.Data;
using backend.DTOs;
using backend.Models;
using backend.Services;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private const int CodigosMaximosPorDia = 3;
    private const int IntentosMaximos = 5;
    private const int MinutosExpiracionCodigo = 5;

    private readonly TecnoMovilDbContext _context;
    private readonly IConfiguration _configuration;
    private readonly EmailService _emailService;

    public AuthController(TecnoMovilDbContext context, IConfiguration configuration, EmailService emailService)
    {
        _context = context;
        _configuration = configuration;
        _emailService = emailService;
    }

    [HttpPost("login")]
    public async Task<ActionResult<LoginResponseDto>> Login([FromBody] LoginDto loginDto)
    {
        var usuario = await _context.Usuarios
            .FirstOrDefaultAsync(u => u.Identificacion == loginDto.Identificacion && u.Activo);

        if (usuario == null || !BCrypt.Net.BCrypt.Verify(loginDto.Password, usuario.PasswordHash))
        {
            return Ok(new LoginResponseDto
            {
                Success = false,
                Message = "Usuario o contraseña incorrecta"
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

    [HttpPost("solicitar-codigo")]
    public async Task<ActionResult<AuthResponseDto>> SolicitarCodigo([FromBody] SolicitarCodigoDto dto)
    {
        var usuario = await _context.Usuarios
            .FirstOrDefaultAsync(u => u.Correo == dto.Correo && u.Activo);

        if (usuario == null)
        {
            return Ok(new AuthResponseDto { Success = false, Message = "No existe una cuenta con ese correo" });
        }

        var inicioDelDia = DateTime.Now.Date;
        var codigosHoy = await _context.CodigosRecuperacion
            .CountAsync(c => c.IdUsuario == usuario.IdUsuario && c.FechaCreacion >= inicioDelDia);

        if (codigosHoy >= CodigosMaximosPorDia)
        {
            return Ok(new AuthResponseDto
            {
                Success = false,
                Message = "Ya se enviaron demasiados códigos hoy. Intenta mañana."
            });
        }

        var codigosPendientes = await _context.CodigosRecuperacion
            .Where(c => c.IdUsuario == usuario.IdUsuario && !c.Usado)
            .ToListAsync();
        foreach (var pendiente in codigosPendientes)
        {
            pendiente.Usado = true;
        }

        var codigo = RandomNumberGenerator.GetInt32(0, 1_000_000).ToString("D6");
        _context.CodigosRecuperacion.Add(new CodigoRecuperacion
        {
            IdUsuario = usuario.IdUsuario,
            Codigo = codigo,
            FechaCreacion = DateTime.Now,
            FechaExpiracion = DateTime.Now.AddMinutes(MinutosExpiracionCodigo),
            Usado = false,
            Intentos = 0
        });

        await _context.SaveChangesAsync();

        var cuerpoHtml = $@"
            <div style='font-family:sans-serif'>
                <p>Hola {System.Net.WebUtility.HtmlEncode(usuario.Nombres)},</p>
                <p>Tu código para restablecer la contraseña de TecnoMovil es:</p>
                <p style='font-size:28px;font-weight:bold;letter-spacing:4px'>{codigo}</p>
                <p>Este código vence en {MinutosExpiracionCodigo} minutos. Si no solicitaste este código, ignora este correo.</p>
            </div>";

        await _emailService.EnviarAsync(usuario.Correo!, "Código para restablecer tu contraseña", cuerpoHtml, usuario.Nombres);

        return Ok(new AuthResponseDto { Success = true, Message = "Código enviado a tu correo" });
    }

    [HttpPost("verificar-codigo")]
    public async Task<ActionResult<AuthResponseDto>> VerificarCodigo([FromBody] VerificarCodigoDto dto)
    {
        var (_, mensajeError) = await BuscarCodigoValidoAsync(dto.Correo, dto.Codigo);

        if (mensajeError != null)
        {
            return Ok(new AuthResponseDto { Success = false, Message = mensajeError });
        }

        return Ok(new AuthResponseDto { Success = true, Message = "Código verificado" });
    }

    [HttpPost("resetear-contrasenia")]
    public async Task<ActionResult<AuthResponseDto>> ResetearContrasenia([FromBody] ResetearContraseniaDto dto)
    {
        var (codigoValido, mensajeError) = await BuscarCodigoValidoAsync(dto.Correo, dto.Codigo);

        if (mensajeError != null || codigoValido == null)
        {
            return Ok(new AuthResponseDto { Success = false, Message = mensajeError ?? "Código inválido o expirado" });
        }

        var usuario = await _context.Usuarios.FindAsync(codigoValido.IdUsuario);
        usuario!.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NuevaPassword);
        codigoValido.Usado = true;

        await _context.SaveChangesAsync();

        return Ok(new AuthResponseDto { Success = true, Message = "Contraseña actualizada correctamente" });
    }

    /// <summary>
    /// Busca el código activo del usuario (no filtra directo por el string ingresado) para poder
    /// registrar intentos fallidos y bloquear por fuerza bruta aunque el código no coincida.
    /// </summary>
    private async Task<(CodigoRecuperacion? codigo, string? mensajeError)> BuscarCodigoValidoAsync(string correo, string codigoIngresado)
    {
        var usuario = await _context.Usuarios.FirstOrDefaultAsync(u => u.Correo == correo && u.Activo);
        if (usuario == null)
        {
            return (null, "No existe una cuenta con ese correo");
        }

        var codigoActivo = await _context.CodigosRecuperacion
            .Where(c => c.IdUsuario == usuario.IdUsuario && !c.Usado)
            .OrderByDescending(c => c.FechaCreacion)
            .FirstOrDefaultAsync();

        if (codigoActivo == null)
        {
            return (null, "No hay un código activo, solicita uno nuevo");
        }

        if (codigoActivo.FechaExpiracion <= DateTime.Now)
        {
            codigoActivo.Usado = true;
            await _context.SaveChangesAsync();
            return (null, "El código expiró, solicita uno nuevo");
        }

        if (codigoActivo.Intentos >= IntentosMaximos)
        {
            codigoActivo.Usado = true;
            await _context.SaveChangesAsync();
            return (null, "Demasiados intentos fallidos, solicita un nuevo código");
        }

        if (codigoActivo.Codigo != codigoIngresado)
        {
            codigoActivo.Intentos++;
            await _context.SaveChangesAsync();
            return (null, "Código incorrecto");
        }

        return (codigoActivo, null);
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
