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
public class AtributosController : ControllerBase
{
    private readonly TecnoMovilDbContext _context;

    public AtributosController(TecnoMovilDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Atributo>>> GetAll()
    {
        return await _context.Atributos.ToListAsync();
    }

    [HttpGet("activos")]
    public async Task<ActionResult<IEnumerable<Atributo>>> GetActivos()
    {
        return await _context.Atributos.Where(a => a.Activo).ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Atributo>> GetById(int id)
    {
        var atributo = await _context.Atributos.FindAsync(id);
        if (atributo == null)
            return NotFound(new { message = "Atributo no encontrado" });

        return atributo;
    }

    [HttpPost]
    public async Task<ActionResult<Atributo>> Create([FromBody] AtributoDto dto)
    {
        var existe = await _context.Atributos
            .AnyAsync(a => a.NombreAtributo == dto.NombreAtributo);
        if (existe)
            return BadRequest(new { message = "Ya existe un atributo con ese nombre" });

        var atributo = new Atributo
        {
            NombreAtributo = dto.NombreAtributo,
            TipoDato = dto.TipoDato,
            Unidad = dto.Unidad,
            Activo = dto.Activo
        };

        _context.Atributos.Add(atributo);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = atributo.IdAtributo }, atributo);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] AtributoDto dto)
    {
        var atributo = await _context.Atributos.FindAsync(id);
        if (atributo == null)
            return NotFound(new { message = "Atributo no encontrado" });

        var existe = await _context.Atributos
            .AnyAsync(a => a.NombreAtributo == dto.NombreAtributo && a.IdAtributo != id);
        if (existe)
            return BadRequest(new { message = "Ya existe otro atributo con ese nombre" });

        atributo.NombreAtributo = dto.NombreAtributo;
        atributo.TipoDato = dto.TipoDato;
        atributo.Unidad = dto.Unidad;
        atributo.Activo = dto.Activo;

        await _context.SaveChangesAsync();
        return Ok(atributo);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var atributo = await _context.Atributos.FindAsync(id);
        if (atributo == null)
            return NotFound(new { message = "Atributo no encontrado" });

        atributo.Activo = false;
        await _context.SaveChangesAsync();

        return Ok(new { message = "Atributo desactivado" });
    }

    // ========== PRODUCTO ATRIBUTOS ==========
    [HttpGet("producto/{idProducto}")]
    public async Task<ActionResult<IEnumerable<ProductoAtributo>>> GetByProducto(int idProducto)
    {
        return await _context.ProductoAtributos
            .Include(pa => pa.Atributo)
            .Where(pa => pa.IdProducto == idProducto)
            .ToListAsync();
    }

    [HttpPost("producto")]
    public async Task<ActionResult<ProductoAtributo>> AsignarAtributo([FromBody] ProductoAtributoDto dto)
    {
        var existe = await _context.ProductoAtributos
            .AnyAsync(pa => pa.IdProducto == dto.IdProducto && pa.IdAtributo == dto.IdAtributo);

        if (existe)
        {
            // Actualizar existente
            var existente = await _context.ProductoAtributos
                .FirstAsync(pa => pa.IdProducto == dto.IdProducto && pa.IdAtributo == dto.IdAtributo);

            existente.ValorTexto = dto.ValorTexto;
            existente.ValorNumero = dto.ValorNumero;
            existente.ValorBool = dto.ValorBool;
            existente.ValorFecha = dto.ValorFecha;

            await _context.SaveChangesAsync();
            return Ok(existente);
        }
        else
        {
            var productoAtributo = new ProductoAtributo
            {
                IdProducto = dto.IdProducto,
                IdAtributo = dto.IdAtributo,
                ValorTexto = dto.ValorTexto,
                ValorNumero = dto.ValorNumero,
                ValorBool = dto.ValorBool,
                ValorFecha = dto.ValorFecha
            };

            _context.ProductoAtributos.Add(productoAtributo);
            await _context.SaveChangesAsync();

            return Ok(productoAtributo);
        }
    }

    [HttpDelete("producto/{idProducto}/{idAtributo}")]
    public async Task<IActionResult> RemoverAtributo(int idProducto, int idAtributo)
    {
        var productoAtributo = await _context.ProductoAtributos
            .FirstOrDefaultAsync(pa => pa.IdProducto == idProducto && pa.IdAtributo == idAtributo);

        if (productoAtributo == null)
            return NotFound(new { message = "Atributo de producto no encontrado" });

        _context.ProductoAtributos.Remove(productoAtributo);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Atributo removido del producto" });
    }
}
