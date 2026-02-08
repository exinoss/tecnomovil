using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.DTOs;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class ConfiguracionController : ControllerBase
{
    private readonly TecnoMovilDbContext _context;

    public ConfiguracionController(TecnoMovilDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<ConfiguracionDto>> Get()
    {
        var config = await _context.Configuraciones.FindAsync(1);
        if (config == null)
            return NotFound(new { message = "Configuración no encontrada" });

        return new ConfiguracionDto { IvaPorcentaje = config.IvaPorcentaje };
    }

    [HttpPut]
    public async Task<IActionResult> Update([FromBody] ConfiguracionDto dto)
    {
        var config = await _context.Configuraciones.FindAsync(1);
        if (config == null)
            return NotFound(new { message = "Configuración no encontrada" });

        config.IvaPorcentaje = dto.IvaPorcentaje;
        await _context.SaveChangesAsync();

        return Ok(new { message = "Configuración actualizada", ivaPorcentaje = config.IvaPorcentaje });
    }
}
