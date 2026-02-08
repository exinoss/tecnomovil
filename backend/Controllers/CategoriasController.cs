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
public class CategoriasController : ControllerBase
{
    private readonly TecnoMovilDbContext _context;

    public CategoriasController(TecnoMovilDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Categoria>>> GetAll()
    {
        return await _context.Categorias.ToListAsync();
    }

    [HttpGet("activas")]
    public async Task<ActionResult<IEnumerable<Categoria>>> GetActivas()
    {
        return await _context.Categorias.Where(c => c.Activo).ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Categoria>> GetById(int id)
    {
        var categoria = await _context.Categorias.FindAsync(id);
        if (categoria == null)
            return NotFound(new { message = "Categoría no encontrada" });

        return categoria;
    }

    [HttpPost]
    public async Task<ActionResult<Categoria>> Create([FromBody] CategoriaDto dto)
    {
        var categoria = new Categoria
        {
            NombreCategoria = dto.NombreCategoria,
            Activo = dto.Activo
        };

        _context.Categorias.Add(categoria);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = categoria.IdCategoria }, categoria);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] CategoriaDto dto)
    {
        var categoria = await _context.Categorias.FindAsync(id);
        if (categoria == null)
            return NotFound(new { message = "Categoría no encontrada" });

        categoria.NombreCategoria = dto.NombreCategoria;
        categoria.Activo = dto.Activo;

        await _context.SaveChangesAsync();
        return Ok(categoria);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var categoria = await _context.Categorias.FindAsync(id);
        if (categoria == null)
            return NotFound(new { message = "Categoría no encontrada" });

        // Soft delete
        categoria.Activo = false;
        await _context.SaveChangesAsync();

        return Ok(new { message = "Categoría desactivada" });
    }
}
