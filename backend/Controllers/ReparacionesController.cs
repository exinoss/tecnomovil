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

    [HttpGet("paged")]
    public async Task<ActionResult<PagedResponseDto<ReparacionListItemDto>>> GetPaged(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? search = null,
        [FromQuery] string? estado = null)
    {
        if (page < 1) page = 1;
        if (pageSize < 1) pageSize = 10;
        if (pageSize > 100) pageSize = 100;

        var query = _context.Reparaciones
            .AsNoTracking()
            .Include(r => r.Cliente)
            .Include(r => r.Tecnico)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            if (int.TryParse(search, out var idBusqueda))
            {
                query = query.Where(r =>
                    r.IdReparacion == idBusqueda ||
                    EF.Functions.Like(r.ModeloEquipo, $"%{search}%") ||
                    EF.Functions.Like(r.SerieImeiIngreso, $"%{search}%") ||
                    (r.Cliente != null && EF.Functions.Like(r.Cliente.Nombres, $"%{search}%"))
                );
            }
            else
            {
                query = query.Where(r =>
                    EF.Functions.Like(r.ModeloEquipo, $"%{search}%") ||
                    EF.Functions.Like(r.SerieImeiIngreso, $"%{search}%") ||
                    (r.Cliente != null && EF.Functions.Like(r.Cliente.Nombres, $"%{search}%"))
                );
            }
        }

        if (!string.IsNullOrWhiteSpace(estado))
        {
            query = query.Where(r => r.Estado == estado);
        }

        var totalItems = await query.CountAsync();
        var totalPages = totalItems == 0 ? 1 : (int)Math.Ceiling(totalItems / (double)pageSize);

        if (page > totalPages) page = totalPages;

        var items = await query
            .OrderByDescending(r => r.FechaIngreso)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(r => new ReparacionListItemDto
            {
                IdReparacion = r.IdReparacion,
                IdCliente = r.IdCliente,
                IdUsuario = r.IdUsuario,
                ModeloEquipo = r.ModeloEquipo,
                SerieImeiIngreso = r.SerieImeiIngreso,
                CostoManoObra = r.CostoManoObra,
                Estado = r.Estado,
                FechaIngreso = r.FechaIngreso,
                ClienteNombre = r.Cliente != null ? r.Cliente.Nombres : string.Empty,
                TecnicoNombre = r.Tecnico != null ? r.Tecnico.Nombres : string.Empty
            })
            .ToListAsync();

        return Ok(new PagedResponseDto<ReparacionListItemDto>
        {
            Page = page,
            PageSize = pageSize,
            TotalItems = totalItems,
            TotalPages = totalPages,
            Items = items
        });
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
