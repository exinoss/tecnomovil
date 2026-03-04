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
public class InventarioController : ControllerBase
{
    private readonly TecnoMovilDbContext _context;

    public InventarioController(TecnoMovilDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<MovimientoInventario>>> GetAll(
        [FromQuery] int? limite = 100)
    {
        return await _context.MovimientosInventario
            .Include(m => m.Producto)

            .OrderByDescending(m => m.Fecha)
            .Take(limite ?? 100)
            .ToListAsync();
    }

    [HttpGet("producto/{idProducto}")]
    public async Task<ActionResult<IEnumerable<MovimientoInventario>>> GetByProducto(int idProducto)
    {
        return await _context.MovimientosInventario

            .Where(m => m.IdProducto == idProducto)
            .OrderByDescending(m => m.Fecha)
            .ToListAsync();
    }

    [HttpGet("tipo/{tipo}")]
    public async Task<ActionResult<IEnumerable<MovimientoInventario>>> GetByTipo(string tipo)
    {
        return await _context.MovimientosInventario
            .Include(m => m.Producto)

            .Where(m => m.Tipo == tipo)
            .OrderByDescending(m => m.Fecha)
            .ToListAsync();
    }

    [HttpGet("fecha")]
    public async Task<ActionResult<IEnumerable<MovimientoInventario>>> GetByFecha(
        [FromQuery] DateTime desde,
        [FromQuery] DateTime hasta)
    {
        return await _context.MovimientosInventario
            .Include(m => m.Producto)

            .Where(m => m.Fecha >= desde && m.Fecha <= hasta)
            .OrderByDescending(m => m.Fecha)
            .ToListAsync();
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<MovimientoInventario>> Create([FromBody] MovimientoInventarioDto dto)
    {
        if (dto.Cantidad < 0)
        {
            var producto = await _context.Productos.FindAsync(dto.IdProducto);
            if (producto == null)
            {
                return NotFound(new { message = "Producto no encontrado." });
            }

            if (producto.StockActual < Math.Abs(dto.Cantidad))
            {
                return BadRequest(new { message = $"Stock insuficiente. Actualmente hay {producto.StockActual} unidades disponibles." });
            }
        }

        var movimiento = new MovimientoInventario
        {
            IdProducto = dto.IdProducto,

            Tipo = dto.Tipo,
            Cantidad = dto.Cantidad,
            ReferenciaTabla = dto.ReferenciaTabla,
            ReferenciaId = dto.ReferenciaId,
            Detalle = dto.Detalle,
            Fecha = DateTime.Now
        };

        _context.MovimientosInventario.Add(movimiento);
        await _context.SaveChangesAsync();

        return Ok(movimiento);
    }

    [HttpGet("stock-bajo")]
    public async Task<ActionResult<IEnumerable<object>>> GetStockBajo([FromQuery] int minimo = 5)
    {
        return await _context.Productos
            .Where(p => p.Activo && p.StockActual <= minimo)
            .Select(p => new
            {
                p.IdProducto,
                p.NombreProducto,
                p.StockActual,
                Categoria = p.Categoria != null ? p.Categoria.NombreCategoria : ""
            })
            .ToListAsync();
    }
}
