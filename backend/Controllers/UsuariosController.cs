using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.DTOs;
using backend.Models;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize] // Cualquier usuario autenticado puede acceder (los endpoints sensibles tienen su propio [Authorize(Roles)])
public class UsuariosController : ControllerBase
{
    private readonly TecnoMovilDbContext _context;

    public UsuariosController(TecnoMovilDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<IEnumerable<object>>> GetAll()
    {
        return await _context.Usuarios
            .Select(u => new
            {
                u.IdUsuario,
                u.Nombres,
                u.Correo,
                u.Identificacion,
                u.TipoIdentificacion,
                u.Rol,
                u.Activo
            })
            .ToListAsync();
    }

    [HttpGet("activos")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<IEnumerable<object>>> GetActivos()
    {
        return await _context.Usuarios
            .Where(u => u.Activo)
            .Select(u => new
            {
                u.IdUsuario,
                u.Nombres,
                u.Correo,
                u.Identificacion,
                u.TipoIdentificacion,
                u.Rol,
                u.Activo
            })
            .ToListAsync();
    }

    // Accesible por Admin, Vendedor y Tecnico (necesario para el select de reparaciones)
    [HttpGet("tecnicos")]
    [Authorize(Roles = "Admin,Vendedor,Tecnico")]
    public async Task<ActionResult<IEnumerable<object>>> GetTecnicos()
    {
        return await _context.Usuarios
            .Where(u => u.Activo && u.Rol == "Tecnico")
            .Select(u => new
            {
                u.IdUsuario,
                u.Nombres,
                u.Correo
            })
            .ToListAsync();
    }

    [HttpGet("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<object>> GetById(int id)
    {
        var usuario = await _context.Usuarios
            .Where(u => u.IdUsuario == id)
            .Select(u => new
            {
                u.IdUsuario,
                u.Nombres,
                u.Correo,
                u.Identificacion,
                u.TipoIdentificacion,
                u.Rol,
                u.Activo
            })
            .FirstOrDefaultAsync();

        if (usuario == null)
            return NotFound(new { message = "Usuario no encontrado" });

        return usuario;
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<object>> Create([FromBody] UsuarioDto dto)
    {
        if (string.IsNullOrEmpty(dto.Password))
            return BadRequest(new { message = "La contraseña es requerida" });

        var existe = await _context.Usuarios
            .AnyAsync(u => u.Identificacion == dto.Identificacion);
        if (existe)
            return BadRequest(new { message = "Ya existe un usuario con esa identificación" });

        if (!string.IsNullOrEmpty(dto.Correo))
        {
            var existeCorreo = await _context.Usuarios
                .AnyAsync(u => u.Correo == dto.Correo);
            if (existeCorreo)
                return BadRequest(new { message = "Ya existe un usuario con ese correo" });
        }

        var usuario = new Usuario
        {
            Nombres = dto.Nombres,
            Correo = dto.Correo,
            Identificacion = dto.Identificacion,
            TipoIdentificacion = dto.TipoIdentificacion,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            Rol = dto.Rol,
            Activo = dto.Activo
        };

        _context.Usuarios.Add(usuario);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = usuario.IdUsuario }, new
        {
            usuario.IdUsuario,
            usuario.Nombres,
            usuario.Correo,
            usuario.Identificacion,
            usuario.TipoIdentificacion,
            usuario.Rol,
            usuario.Activo
        });
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(int id, [FromBody] UsuarioDto dto)
    {
        var usuario = await _context.Usuarios.FindAsync(id);
        if (usuario == null)
            return NotFound(new { message = "Usuario no encontrado" });

        // Verificar identificación única
        var existe = await _context.Usuarios
            .AnyAsync(u => u.Identificacion == dto.Identificacion && u.IdUsuario != id);
        if (existe)
            return BadRequest(new { message = "Ya existe otro usuario con esa identificación" });

        if (!string.IsNullOrEmpty(dto.Correo))
        {
            var existeCorreo = await _context.Usuarios
                .AnyAsync(u => u.Correo == dto.Correo && u.IdUsuario != id);
            if (existeCorreo)
                return BadRequest(new { message = "Ya existe otro usuario con ese correo" });
        }

        usuario.Nombres = dto.Nombres;
        usuario.Correo = dto.Correo;
        usuario.Identificacion = dto.Identificacion;
        usuario.TipoIdentificacion = dto.TipoIdentificacion;
        usuario.Rol = dto.Rol;
        usuario.Activo = dto.Activo;

        // Solo actualizar password si se proporciona
        if (!string.IsNullOrEmpty(dto.Password))
        {
            usuario.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);
        }

        await _context.SaveChangesAsync();
        return Ok(new
        {
            usuario.IdUsuario,
            usuario.Nombres,
            usuario.Correo,
            usuario.Identificacion,
            usuario.TipoIdentificacion,
            usuario.Rol,
            usuario.Activo
        });
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var usuario = await _context.Usuarios.FindAsync(id);
        if (usuario == null)
            return NotFound(new { message = "Usuario no encontrado" });

        usuario.Activo = false;
        await _context.SaveChangesAsync();

        return Ok(new { message = "Usuario desactivado" });
    }

    [HttpPut("{id}/cambiar-password")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> CambiarPassword(int id, [FromBody] CambiarPasswordDto dto)
    {
        var usuario = await _context.Usuarios.FindAsync(id);
        if (usuario == null)
            return NotFound(new { message = "Usuario no encontrado" });

        usuario.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NuevaPassword);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Contraseña actualizada" });
    }
}

public class CambiarPasswordDto
{
    public string NuevaPassword { get; set; } = string.Empty;
}
