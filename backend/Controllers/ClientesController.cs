using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.DTOs;
using backend.Models;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ClientesController : ControllerBase
{
    private readonly TecnoMovilDbContext _context;

    public ClientesController(TecnoMovilDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Cliente>>> GetAll()
    {
        return await _context.Clientes.ToListAsync();
    }

    [HttpGet("activos")]
    public async Task<ActionResult<IEnumerable<Cliente>>> GetActivos()
    {
        return await _context.Clientes.Where(c => c.Activo).ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Cliente>> GetById(int id)
    {
        var cliente = await _context.Clientes.FindAsync(id);
        if (cliente == null)
            return NotFound(new { message = "Cliente no encontrado" });

        return cliente;
    }

    [HttpGet("identificacion/{identificacion}")]
    public async Task<ActionResult<Cliente>> GetByIdentificacion(string identificacion)
    {
        var cliente = await _context.Clientes
            .FirstOrDefaultAsync(c => c.Identificacion == identificacion);

        if (cliente == null)
            return NotFound(new { message = "Cliente no encontrado" });

        return cliente;
    }

    [HttpGet("buscar")]
    public async Task<ActionResult<IEnumerable<Cliente>>> Buscar([FromQuery] string termino)
    {
        if (string.IsNullOrWhiteSpace(termino))
            return await GetActivos();

        return await _context.Clientes
            .Where(c => c.Activo &&
                (c.Nombres.Contains(termino) ||
                 c.Identificacion.Contains(termino) ||
                 (c.Telefono != null && c.Telefono.Contains(termino)) ||
                 (c.Email != null && c.Email.Contains(termino))))
            .ToListAsync();
    }

    [HttpPost]
    public async Task<ActionResult<Cliente>> Create([FromBody] ClienteDto dto)
    {
        var existe = await _context.Clientes
            .AnyAsync(c => c.Identificacion == dto.Identificacion);
        if (existe)
            return BadRequest(new { message = "Ya existe un cliente con esa identificación" });

        var cliente = new Cliente
        {
            Nombres = dto.Nombres,
            Telefono = dto.Telefono,
            Email = dto.Email,
            Identificacion = dto.Identificacion,
            TipoIdentificacion = dto.TipoIdentificacion,
            Activo = dto.Activo
        };

        _context.Clientes.Add(cliente);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = cliente.IdCliente }, cliente);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] ClienteDto dto)
    {
        var cliente = await _context.Clientes.FindAsync(id);
        if (cliente == null)
            return NotFound(new { message = "Cliente no encontrado" });

        // Verificar identificación única (excluyendo el actual)
        var existe = await _context.Clientes
            .AnyAsync(c => c.Identificacion == dto.Identificacion && c.IdCliente != id);
        if (existe)
            return BadRequest(new { message = "Ya existe otro cliente con esa identificación" });

        cliente.Nombres = dto.Nombres;
        cliente.Telefono = dto.Telefono;
        cliente.Email = dto.Email;
        cliente.Identificacion = dto.Identificacion;
        cliente.TipoIdentificacion = dto.TipoIdentificacion;
        cliente.Activo = dto.Activo;

        await _context.SaveChangesAsync();
        return Ok(cliente);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var cliente = await _context.Clientes.FindAsync(id);
        if (cliente == null)
            return NotFound(new { message = "Cliente no encontrado" });

        cliente.Activo = false;
        await _context.SaveChangesAsync();

        return Ok(new { message = "Cliente desactivado" });
    }
}
