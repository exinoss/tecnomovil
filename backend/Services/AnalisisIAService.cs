using Microsoft.EntityFrameworkCore;
using System.Text;
using System.Text.Json;
using backend.Data;
using backend.DTOs;
using backend.Models;

namespace backend.Services;

public class AnalisisIAService
{
    private readonly TecnoMovilDbContext _context;
    private readonly HttpClient _httpClient;
    private readonly string _geminiApiUrl;

    private const int MESES_ANALISIS = 6;
    private const int MAX_PRODUCTOS_LOTE = 25;

    public AnalisisIAService(TecnoMovilDbContext context, IHttpClientFactory httpClientFactory, IConfiguration configuration)
    {
        _context = context;
        _httpClient = httpClientFactory.CreateClient("GeminiClient");
        var apiKey = Environment.GetEnvironmentVariable("GEMINI_API_KEY")
            ?? throw new InvalidOperationException("GEMINI_API_KEY no configurada en .env");
        _geminiApiUrl = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={apiKey}";
    }

    public async Task<List<VentaProductoGeminiDTO>> ObtenerDatosVentasAsync()
    {
        var fechaInicio = DateTime.Now.AddMonths(-MESES_ANALISIS).Date;
        var fechaFin = DateTime.Now.Date;

        var idsProductosMasVendidos = await _context.DetalleFacturas
            .Include(df => df.Factura)
            .Include(df => df.Producto)
            .Where(df =>
                df.IdProducto != null &&
                df.Factura!.Fecha >= fechaInicio &&
                df.Factura!.Fecha <= fechaFin &&
                df.Producto != null && df.Producto.Activo)
            .GroupBy(df => df.IdProducto)
            .Select(g => g.Key!.Value)
            .Take(MAX_PRODUCTOS_LOTE)
            .ToListAsync();

        var productos = await _context.Productos
            .Where(p => idsProductosMasVendidos.Contains(p.IdProducto))
            .ToListAsync();

        var ventasMensuales = await _context.DetalleFacturas
            .Include(df => df.Factura)
            .Where(df =>
                df.IdProducto != null &&
                idsProductosMasVendidos.Contains(df.IdProducto!.Value) &&
                df.Factura!.Fecha >= fechaInicio &&
                df.Factura!.Fecha <= fechaFin)
            .GroupBy(df => new
            {
                df.IdProducto,
                Año = df.Factura!.Fecha.Year,
                Mes = df.Factura!.Fecha.Month
            })
            .Select(g => new
            {
                g.Key.IdProducto,
                g.Key.Año,
                g.Key.Mes,
                Cantidad = g.Sum(df => df.Cantidad)
            })
            .OrderBy(v => v.Año).ThenBy(v => v.Mes)
            .ToListAsync();

        return productos.Select(prod => new VentaProductoGeminiDTO
        {
            ProductoId = prod.IdProducto,
            NombreProducto = prod.NombreProducto,
            StockActual = prod.StockActual,
            PrecioVenta = prod.PrecioVenta,
            VentasMensuales = ventasMensuales
                .Where(v => v.IdProducto == prod.IdProducto)
                .Select(v => new VentaMensualDTO
                {
                    Mes = $"{NombreMes(v.Mes)} {v.Año}",
                    CantidadVendida = v.Cantidad
                })
                .ToList()
        }).ToList();
    }

    public async Task<(List<RecomendacionGeminiDTO> Recomendaciones, int TokensUsados)> SolicitarAnalisisAsync(
        List<VentaProductoGeminiDTO> datosVentas)
    {
        var datosJson = JsonSerializer.Serialize(datosVentas, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        });

        var prompt = $@"## ROL
Eres un analista experto en cadena de suministro e inventario para 'TecnoMovil', una tienda especializada en repuestos y accesorios para teléfonos móviles. Tu análisis directamente impacta en las decisiones de compra del negocio, por lo que debe ser preciso y conservador.

## CONTEXTO DEL NEGOCIO
- Los productos son componentes tecnológicos con ciclos de vida cortos (pantallas, baterías, cargadores, fundas, etc.).
- El margen de error por exceso de stock es alto porque los productos se vuelven obsoletos con nuevos modelos.
- El margen de error por falta de stock también es alto porque se pierden ventas inmediatas y clientes.
- Las ventas suelen tener estacionalidad: altas en noviembre-enero (temporada de fiestas y año nuevo) y en junio-julio (mitad de año).

## DATOS DE ENTRADA
Recibirás un JSON con los productos más vendidos. Cada producto incluye:
- `productoId`: identificador único
- `nombreProducto`: nombre del producto
- `stockActual`: unidades disponibles ahora mismo
- `precioVenta`: precio unitario en dólares
- `ventasMensuales`: array cronológico de ventas por mes (del más antiguo al más reciente)

## INSTRUCCIONES DE ANÁLISIS
Para cada producto debes:

1. **Calcular la velocidad de ventas promedio**: suma las unidades de los últimos 3 meses y divídelas entre 3.
2. **Detectar la tendencia**: compara los primeros 3 meses contra los últimos 3. Si la diferencia es > 20% positivo = tendencia alcista; > 20% negativo = tendencia bajista; entre ±20% = estable.
3. **Calcular cobertura de stock**: `coberturaMeses = stockActual / promediomensual`. Si la cobertura es menor a 1.5 meses, el stock es crítico.
4. **Proyectar ventas del próximo mes** (`proyeccionProximoMes`): 
   - Tendencia alcista: último mes * 1.20
   - Tendencia estable: promedio de los últimos 3 meses
   - Tendencia bajista: último mes * 0.90
   - Ajusta si el próximo mes cae en temporada alta o baja
5. **Calcular sugerencia de compra** (`sugerenciaCompra`):
   - Stock objetivo = proyeccionProximoMes * 2.5 (2.5 meses de cobertura ideal)
   - sugerenciaCompra = max(0, stockObjetivo - stockActual)
   - Redondea siempre al múltiplo de 5 más cercano hacia arriba
   - Si la tendencia es bajista Y la cobertura es > 3 meses: sugerenciaCompra = 0
6. **Determinar nivel de urgencia**:
   - `Alta`: cobertura < 1 mes O stock = 0 Y hay ventas recientes
   - `Media`: cobertura entre 1 y 2 meses O tendencia alcista fuerte (>30%)
   - `Baja`: cobertura > 2 meses Y tendencia estable o bajista

## FORMATO DE RESPUESTA
Devuelve ÚNICAMENTE un array JSON válido y completo. Sin texto antes ni después. Sin markdown. Sin backticks. Solo el array.
Incluye TODOS los productos recibidos, incluso si `sugerenciaCompra` es 0.

Estructura de cada objeto:
{{
  ""productoId"": <int>,
  ""sugerenciaCompra"": <int>,
  ""justificacion"": ""<2-3 oraciones en español explicando la tendencia detectada, la cobertura actual y el razonamiento detrás de la sugerencia>"",
  ""proyeccionProximoMes"": <int>,
  ""nivelUrgencia"": ""<Alta|Media|Baja>""
}}

## DATOS
{datosJson}";

        var requestBody = new
        {
            contents = new[] { new { parts = new[] { new { text = prompt } } } },
            generationConfig = new { temperature = 0.2, maxOutputTokens = 8192 }
        };

        var content = new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json");
        var response = await _httpClient.PostAsync(_geminiApiUrl, content);
        var responseString = await response.Content.ReadAsStringAsync();

        if (!response.IsSuccessStatusCode)
            throw new Exception($"Error Gemini API: {response.StatusCode} - {responseString}");

        using var doc = JsonDocument.Parse(responseString);
        var root = doc.RootElement;

        var textoGenerado = root
            .GetProperty("candidates")[0]
            .GetProperty("content")
            .GetProperty("parts")[0]
            .GetProperty("text")
            .GetString() ?? "[]";

        int tokensUsados = 0;
        if (root.TryGetProperty("usageMetadata", out var usage))
            usage.TryGetProperty("totalTokenCount", out var t);

        // Limpiar backticks si Gemini los incluye
        textoGenerado = textoGenerado.Trim().Replace("```json", "").Replace("```", "").Trim();

        var recomendaciones = JsonSerializer.Deserialize<List<RecomendacionGeminiDTO>>(
            textoGenerado, new JsonSerializerOptions { PropertyNameCaseInsensitive = true })
            ?? new List<RecomendacionGeminiDTO>();

        return (recomendaciones, tokensUsados);
    }

    public async Task<AnalisisIA> GuardarAnalisisAsync(
        List<RecomendacionGeminiDTO> recomendaciones,
        List<VentaProductoGeminiDTO> datosVentas,
        int tokensUsados)
    {
        var analisis = new AnalisisIA
        {
            FechaGeneracion = DateTime.Now,
            TotalProductosAnalizados = recomendaciones.Count,
            PeriodoInicio = DateTime.Now.AddMonths(-MESES_ANALISIS).Date,
            PeriodoFin = DateTime.Now.Date,
            TokensUsados = tokensUsados
        };

        _context.AnalisisIA.Add(analisis);
        await _context.SaveChangesAsync();

        var ventasDict = datosVentas.ToDictionary(v => v.ProductoId);

        foreach (var rec in recomendaciones)
        {
            _context.DetalleAnalisisIA.Add(new DetalleAnalisisIA
            {
                IdAnalisis = analisis.IdAnalisis,
                IdProducto = rec.ProductoId,
                VentasHistoricasJson = ventasDict.TryGetValue(rec.ProductoId, out var v)
                    ? JsonSerializer.Serialize(v.VentasMensuales)
                    : "[]",
                SugerenciaCompra = rec.SugerenciaCompra,
                Justificacion = rec.Justificacion,
                ProyeccionProximoMes = rec.ProyeccionProximoMes,
                NivelUrgencia = rec.NivelUrgencia
            });
        }

        await _context.SaveChangesAsync();
        return analisis;
    }

    private static string NombreMes(int mes) => mes switch
    {
        1 => "Enero", 2 => "Febrero", 3 => "Marzo", 4 => "Abril",
        5 => "Mayo", 6 => "Junio", 7 => "Julio", 8 => "Agosto",
        9 => "Septiembre", 10 => "Octubre", 11 => "Noviembre", 12 => "Diciembre",
        _ => mes.ToString()
    };
}
