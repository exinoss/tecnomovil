using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using backend.Data;
using backend.DTOs;
using backend.Services;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AnalisisController : ControllerBase
{
    private readonly TecnoMovilDbContext _context;
    private readonly AnalisisIAService _analisisService;

    public AnalisisController(TecnoMovilDbContext context, AnalisisIAService analisisService)
    {
        _context = context;
        _analisisService = analisisService;
    }

    [HttpPost("generar")]
    public async Task<IActionResult> GenerarAnalisis()
    {
        try
        {
            var datosVentas = await _analisisService.ObtenerDatosVentasAsync();

            if (!datosVentas.Any())
                return BadRequest(new { mensaje = "No hay datos de ventas suficientes para generar un análisis." });

            var (recomendaciones, tokensUsados) = await _analisisService.SolicitarAnalisisAsync(datosVentas);

            if (!recomendaciones.Any())
                return StatusCode(502, new { mensaje = "Gemini no devolvió recomendaciones válidas." });

            var analisis = await _analisisService.GuardarAnalisisAsync(recomendaciones, datosVentas, tokensUsados);

            return Ok(new
            {
                mensaje = "Análisis generado correctamente.",
                idAnalisis = analisis.IdAnalisis,
                fechaGeneracion = analisis.FechaGeneracion,
                totalProductosAnalizados = analisis.TotalProductosAnalizados,
                tokensUsados = analisis.TokensUsados
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensaje = ex.Message });
        }
    }

    [HttpGet("ultimo")]
    public async Task<IActionResult> ObtenerUltimoAnalisis()
    {
        var analisis = await _context.AnalisisIA
            .Include(a => a.Detalles).ThenInclude(d => d.Producto)
            .OrderByDescending(a => a.FechaGeneracion)
            .FirstOrDefaultAsync();

        if (analisis == null)
            return NotFound(new { mensaje = "No existe ningún análisis. Use POST /api/analisis/generar primero." });

        return Ok(MapToResponseDTO(analisis));
    }

    [HttpGet("historial")]
    public async Task<IActionResult> ObtenerHistorial()
    {
        var historial = await _context.AnalisisIA
            .OrderByDescending(a => a.FechaGeneracion)
            .Select(a => new AnalisisIAResumenDTO
            {
                IdAnalisis = a.IdAnalisis,
                FechaGeneracion = a.FechaGeneracion,
                TotalProductosAnalizados = a.TotalProductosAnalizados,
                TokensUsados = a.TokensUsados
            })
            .ToListAsync();

        return Ok(historial);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> ObtenerPorId(int id)
    {
        var analisis = await _context.AnalisisIA
            .Include(a => a.Detalles).ThenInclude(d => d.Producto)
            .FirstOrDefaultAsync(a => a.IdAnalisis == id);

        if (analisis == null)
            return NotFound(new { mensaje = $"Análisis {id} no encontrado." });

        return Ok(MapToResponseDTO(analisis));
    }

    private static AnalisisIAResponseDTO MapToResponseDTO(backend.Models.AnalisisIA analisis)
    {
        var jsonOpts = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };

        return new AnalisisIAResponseDTO
        {
            IdAnalisis = analisis.IdAnalisis,
            FechaGeneracion = analisis.FechaGeneracion,
            TotalProductosAnalizados = analisis.TotalProductosAnalizados,
            PeriodoInicio = analisis.PeriodoInicio,
            PeriodoFin = analisis.PeriodoFin,
            TokensUsados = analisis.TokensUsados,
            Detalles = analisis.Detalles
                .Select(d => new DetalleAnalisisIAResponseDTO
                {
                    IdProducto = d.IdProducto,
                    NombreProducto = d.Producto?.NombreProducto ?? "",
                    ImagenProducto = d.Producto?.Imagen,
                    StockActual = d.Producto?.StockActual ?? 0,
                    SugerenciaCompra = d.SugerenciaCompra,
                    Justificacion = d.Justificacion,
                    ProyeccionProximoMes = d.ProyeccionProximoMes,
                    NivelUrgencia = d.NivelUrgencia,
                    VentasMensuales = string.IsNullOrEmpty(d.VentasHistoricasJson)
                        ? new List<VentaMensualDTO>()
                        : JsonSerializer.Deserialize<List<VentaMensualDTO>>(d.VentasHistoricasJson, jsonOpts)
                            ?? new List<VentaMensualDTO>()
                })
                .OrderByDescending(d => d.NivelUrgencia == "Alta" ? 3 : d.NivelUrgencia == "Media" ? 2 : 1)
                .ThenByDescending(d => d.SugerenciaCompra)
                .ToList()
        };
    }
}
