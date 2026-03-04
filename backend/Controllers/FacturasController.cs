using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using backend.Data;
using backend.DTOs;
using backend.Models;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class FacturasController : ControllerBase
{
    private readonly TecnoMovilDbContext _context;

    public FacturasController(TecnoMovilDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResponseDto<FacturaListItemDto>>> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? search = null)
    {
        if (page < 1) page = 1;
        if (pageSize < 1) pageSize = 10;
        if (pageSize > 100) pageSize = 100;

        var query = _context.Facturas
            .AsNoTracking()
            .Include(f => f.Cliente)
            .Include(f => f.Vendedor)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(f =>
                EF.Functions.Like(f.IdFactura.ToString(), $"%{search}%") ||
                (f.Cliente != null && EF.Functions.Like(f.Cliente.Nombres, $"%{search}%")) ||
                (f.Vendedor != null && EF.Functions.Like(f.Vendedor.Nombres, $"%{search}%"))
            );
        }

        var totalItems = await query.CountAsync();
        var totalPages = totalItems == 0 ? 1 : (int)Math.Ceiling(totalItems / (double)pageSize);

        if (page > totalPages) page = totalPages;

        var items = await query
            .OrderByDescending(f => f.Fecha)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(f => new FacturaListItemDto
            {
                IdFactura = f.IdFactura,
                Fecha = f.Fecha,
                IvaPorcentaje = f.IvaPorcentaje,
                Subtotal = f.Subtotal,
                Iva = f.Iva,
                Total = f.Total,
                ClienteNombre = f.Cliente != null ? f.Cliente.Nombres : string.Empty,
                VendedorNombre = f.Vendedor != null ? f.Vendedor.Nombres : string.Empty
            })
            .ToListAsync();

        return Ok(new PagedResponseDto<FacturaListItemDto>
        {
            Page = page,
            PageSize = pageSize,
            TotalItems = totalItems,
            TotalPages = totalPages,
            Items = items
        });
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<FacturaResponseDto>> GetById(int id)
    {
        var factura = await _context.Facturas
            .Include(f => f.Cliente)
            .Include(f => f.Vendedor)
            .Include(f => f.Detalles)
                .ThenInclude(d => d.Producto)
            .FirstOrDefaultAsync(f => f.IdFactura == id);

        if (factura == null)
            return NotFound(new { message = "Factura no encontrada" });

        return new FacturaResponseDto
        {
            IdFactura = factura.IdFactura,
            Fecha = factura.Fecha,
            ClienteNombre = factura.Cliente?.Nombres ?? "",
            VendedorNombre = factura.Vendedor?.Nombres ?? "",
            IvaPorcentaje = factura.IvaPorcentaje,
            Subtotal = factura.Subtotal,
            Iva = factura.Iva,
            Total = factura.Total,
            Detalles = factura.Detalles.Select(d => new DetalleFacturaDto
            {
                IdDetalle = d.IdDetalle,
                IdProducto = d.IdProducto,

                IdReparacion = d.IdReparacion,
                DescripcionItem = d.DescripcionItem,
                Cantidad = d.Cantidad,
                PrecioUnitario = d.PrecioUnitario,
                TipoItem = d.TipoItem
            }).ToList()
        };
    }

    [HttpGet("cliente/{idCliente}")]
    public async Task<ActionResult<IEnumerable<Factura>>> GetByCliente(int idCliente)
    {
        return await _context.Facturas
            .Include(f => f.Vendedor)
            .Where(f => f.IdCliente == idCliente)
            .OrderByDescending(f => f.Fecha)
            .ToListAsync();
    }

    [HttpGet("fecha")]
    public async Task<ActionResult<IEnumerable<Factura>>> GetByFecha(
        [FromQuery] DateTime desde, 
        [FromQuery] DateTime hasta)
    {
        return await _context.Facturas
            .Include(f => f.Cliente)
            .Include(f => f.Vendedor)
            .Where(f => f.Fecha >= desde && f.Fecha <= hasta)
            .OrderByDescending(f => f.Fecha)
            .ToListAsync();
    }

    [HttpPost]
    public async Task<ActionResult<Factura>> Create([FromBody] FacturaDto dto)
    {
        // Obtener ID del usuario desde el token
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        var idUsuario = dto.IdUsuario ?? int.Parse(userIdClaim?.Value ?? "0");

        var factura = new Factura
        {
            IdCliente = dto.IdCliente,
            IdUsuario = idUsuario,
            Fecha = DateTime.Now
        };

        _context.Facturas.Add(factura);
        await _context.SaveChangesAsync();

        // Agregar detalles
        foreach (var detalleDto in dto.Detalles)
        {
            var detalle = new DetalleFactura
            {
                IdFactura = factura.IdFactura,
                IdProducto = detalleDto.IdProducto,

                IdReparacion = detalleDto.IdReparacion,
                DescripcionItem = detalleDto.DescripcionItem,
                Cantidad = detalleDto.Cantidad,
                PrecioUnitario = detalleDto.PrecioUnitario,
                TipoItem = detalleDto.TipoItem
            };
            _context.DetalleFacturas.Add(detalle);
        }

        // Vincular reparaciones si hay y cambiar estado a "Facturado"
        if (dto.ReparacionIds != null && dto.ReparacionIds.Any())
        {
            foreach (var idReparacion in dto.ReparacionIds)
            {
                _context.FacturaReparaciones.Add(new FacturaReparacion
                {
                    IdFactura = factura.IdFactura,
                    IdReparacion = idReparacion
                });

                // Cambiar estado de la reparación a "Facturado" y sincronizar costo
                var reparacion = await _context.Reparaciones.FindAsync(idReparacion);
                if (reparacion != null)
                {
                    reparacion.Estado = "Facturado";

                    // Buscar el detalle de factura correspondiente a esta reparación
                    var detalleReparacion = dto.Detalles
                        .FirstOrDefault(d => d.IdReparacion == idReparacion && d.TipoItem == "Reparacion");
                    if (detalleReparacion != null)
                    {
                        // Actualizar el costo de mano de obra con el valor facturado
                        reparacion.CostoManoObra = detalleReparacion.PrecioUnitario;
                    }
                }
            }
        }

        await _context.SaveChangesAsync();

        // Recargar para obtener totales calculados
        await _context.Entry(factura).ReloadAsync();

        return CreatedAtAction(nameof(GetById), new { id = factura.IdFactura }, factura);
    }

    [HttpPost("{id}/detalles")]
    public async Task<ActionResult<DetalleFactura>> AddDetalle(int id, [FromBody] DetalleFacturaDto dto)
    {
        var factura = await _context.Facturas.FindAsync(id);
        if (factura == null)
            return NotFound(new { message = "Factura no encontrada" });

        var detalle = new DetalleFactura
        {
            IdFactura = id,
            IdProducto = dto.IdProducto,

            IdReparacion = dto.IdReparacion,
            DescripcionItem = dto.DescripcionItem,
            Cantidad = dto.Cantidad,
            PrecioUnitario = dto.PrecioUnitario,
            TipoItem = dto.TipoItem
        };

        _context.DetalleFacturas.Add(detalle);
        await _context.SaveChangesAsync();

        return Ok(detalle);
    }

    [HttpDelete("detalles/{idDetalle}")]
    public async Task<IActionResult> DeleteDetalle(int idDetalle)
    {
        var detalle = await _context.DetalleFacturas.FindAsync(idDetalle);
        if (detalle == null)
            return NotFound(new { message = "Detalle no encontrado" });

        _context.DetalleFacturas.Remove(detalle);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Detalle eliminado" });
    }
}
