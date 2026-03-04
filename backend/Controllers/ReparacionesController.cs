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
public class ReparacionesController : ControllerBase
{
    private readonly TecnoMovilDbContext _context;

    public ReparacionesController(TecnoMovilDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Reparacion>>> GetAll()
    {
        return await _context.Reparaciones
            .Include(r => r.Cliente)
            .Include(r => r.Tecnico)
            .OrderByDescending(r => r.FechaIngreso)
            .ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Reparacion>> GetById(int id)
    {
        var reparacion = await _context.Reparaciones
            .Include(r => r.Cliente)
            .Include(r => r.Tecnico)
            .Include(r => r.Repuestos)
                .ThenInclude(rep => rep.Producto)
            .FirstOrDefaultAsync(r => r.IdReparacion == id);

        if (reparacion == null)
            return NotFound(new { message = "Reparación no encontrada" });

        return reparacion;
    }

    [HttpGet("cliente/{idCliente}")]
    public async Task<ActionResult<IEnumerable<Reparacion>>> GetByCliente(int idCliente)
    {
        return await _context.Reparaciones
            .Include(r => r.Tecnico)
            .Where(r => r.IdCliente == idCliente)
            .OrderByDescending(r => r.FechaIngreso)
            .ToListAsync();
    }

    [HttpGet("tecnico/{idUsuario}")]
    public async Task<ActionResult<IEnumerable<Reparacion>>> GetByTecnico(int idUsuario)
    {
        return await _context.Reparaciones
            .Include(r => r.Cliente)
            .Where(r => r.IdUsuario == idUsuario)
            .OrderByDescending(r => r.FechaIngreso)
            .ToListAsync();
    }

    [HttpGet("estado/{estado}")]
    public async Task<ActionResult<IEnumerable<Reparacion>>> GetByEstado(string estado)
    {
        return await _context.Reparaciones
            .Include(r => r.Cliente)
            .Include(r => r.Tecnico)
            .Where(r => r.Estado == estado)
            .OrderByDescending(r => r.FechaIngreso)
            .ToListAsync();
    }

    [HttpPost]
    public async Task<ActionResult<Reparacion>> Create([FromBody] ReparacionDto dto)
    {
        var reparacion = new Reparacion
        {
            IdCliente = dto.IdCliente,
            IdUsuario = dto.IdUsuario,
            ModeloEquipo = dto.ModeloEquipo,
            SerieImeiIngreso = dto.SerieImeiIngreso,
            DescripcionFalla = dto.DescripcionFalla,
            Estado = "Recibido",
            FechaIngreso = DateTime.Now
        };

        _context.Reparaciones.Add(reparacion);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = reparacion.IdReparacion }, reparacion);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] ReparacionDto dto)
    {
        var reparacion = await _context.Reparaciones.FindAsync(id);
        if (reparacion == null)
            return NotFound(new { message = "Reparación no encontrada" });

        // No permitir modificar si está en estado final
        if (reparacion.Estado == "Reparado" || reparacion.Estado == "Cancelado" || reparacion.Estado == "Facturado")
            return BadRequest(new { message = $"No se puede modificar una reparación con estado '{reparacion.Estado}'" });

        reparacion.IdCliente = dto.IdCliente;
        reparacion.IdUsuario = dto.IdUsuario;
        reparacion.ModeloEquipo = dto.ModeloEquipo;
        reparacion.SerieImeiIngreso = dto.SerieImeiIngreso;
        reparacion.DescripcionFalla = dto.DescripcionFalla;
        reparacion.DiagnosticoFinal = dto.DiagnosticoFinal;
        reparacion.CostoManoObra = dto.CostoManoObra;
        reparacion.Estado = dto.Estado;

        await _context.SaveChangesAsync();
        return Ok(reparacion);
    }

    [HttpPut("{id}/estado")]
    public async Task<IActionResult> CambiarEstado(int id, [FromBody] CambiarEstadoDto dto)
    {
        var reparacion = await _context.Reparaciones.FindAsync(id);
        if (reparacion == null)
            return NotFound(new { message = "Reparación no encontrada" });

        // No permitir cambiar estado si ya está en estado final
        if (reparacion.Estado == "Reparado" || reparacion.Estado == "Cancelado" || reparacion.Estado == "Facturado")
            return BadRequest(new { message = $"No se puede cambiar el estado de una reparación '{reparacion.Estado}'" });

        reparacion.Estado = dto.Estado;
        await _context.SaveChangesAsync();

        return Ok(reparacion);
    }

    [HttpPut("{id}/aprobar")]
    public async Task<IActionResult> Aprobar(int id, [FromBody] AprobacionDto dto)
    {
        var reparacion = await _context.Reparaciones.FindAsync(id);
        if (reparacion == null)
            return NotFound(new { message = "Reparación no encontrada" });

        reparacion.Aprobado = dto.Aprobado;
        reparacion.FechaAprobacion = DateTime.Now;

        if (dto.Aprobado)
        {
            reparacion.Estado = "Aprobado";
        }
        else
        {
            reparacion.Estado = "Rechazado";
            reparacion.MotivoRechazo = dto.MotivoRechazo;
        }

        await _context.SaveChangesAsync();
        return Ok(reparacion);
    }

    // ========== REPUESTOS ==========
    [HttpGet("{id}/repuestos")]
    public async Task<ActionResult<IEnumerable<ReparacionRepuesto>>> GetRepuestos(int id)
    {
        return await _context.ReparacionRepuestos
            .Include(r => r.Producto)

            .Where(r => r.IdReparacion == id)
            .ToListAsync();
    }

    [HttpPost("{id}/repuestos")]
    public async Task<ActionResult<ReparacionRepuesto>> AddRepuesto(int id, [FromBody] ReparacionRepuestoDto dto)
    {
        var reparacion = await _context.Reparaciones.FindAsync(id);
        if (reparacion == null)
            return NotFound(new { message = "Reparación no encontrada" });

        var repuesto = new ReparacionRepuesto
        {
            IdReparacion = id,
            IdProducto = dto.IdProducto,

            Cantidad = dto.Cantidad,
            CostoUnitario = dto.CostoUnitario,
            PrecioCobrado = dto.PrecioCobrado
        };

        _context.ReparacionRepuestos.Add(repuesto);
        await _context.SaveChangesAsync();

        return Ok(repuesto);
    }

    [HttpDelete("repuestos/{idRepuesto}")]
    public async Task<IActionResult> DeleteRepuesto(int idRepuesto)
    {
        var repuesto = await _context.ReparacionRepuestos.FindAsync(idRepuesto);
        if (repuesto == null)
            return NotFound(new { message = "Repuesto no encontrado" });

        _context.ReparacionRepuestos.Remove(repuesto);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Repuesto eliminado" });
    }
}

public class CambiarEstadoDto
{
    public string Estado { get; set; } = string.Empty;
}
