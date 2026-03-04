namespace backend.DTOs;

// DTO que se arma en C# y se envía a Gemini (serializado como JSON en el prompt)
public class VentaProductoGeminiDTO
{
    public int ProductoId { get; set; }
    public string NombreProducto { get; set; } = string.Empty;
    public int StockActual { get; set; }
    public decimal PrecioVenta { get; set; }
    // Lista de ventas mensuales ordenadas de más antigua a más reciente
    // Ej: [10, 15, 20, 25, 30, 40] = últimos 6 meses
    public List<VentaMensualDTO> VentasMensuales { get; set; } = new();
}

public class VentaMensualDTO
{
    public string Mes { get; set; } = string.Empty; // "Enero 2025"
    public int CantidadVendida { get; set; }
}

// DTO que Gemini devuelve (un elemento dentro del array JSON)
public class RecomendacionGeminiDTO
{
    public int ProductoId { get; set; }
    public int SugerenciaCompra { get; set; }
    public string Justificacion { get; set; } = string.Empty;
    public int ProyeccionProximoMes { get; set; }
    public string NivelUrgencia { get; set; } = "Baja"; // Alta, Media, Baja
}

// DTO para el resultado completo que Angular recibirá al pedir el último análisis
public class AnalisisIAResponseDTO
{
    public int IdAnalisis { get; set; }
    public DateTime FechaGeneracion { get; set; }
    public int TotalProductosAnalizados { get; set; }
    public DateTime PeriodoInicio { get; set; }
    public DateTime PeriodoFin { get; set; }
    public int? TokensUsados { get; set; }
    public List<DetalleAnalisisIAResponseDTO> Detalles { get; set; } = new();
}

public class DetalleAnalisisIAResponseDTO
{
    public int IdProducto { get; set; }
    public string NombreProducto { get; set; } = string.Empty;
    public string? ImagenProducto { get; set; }
    public int StockActual { get; set; }
    public int SugerenciaCompra { get; set; }
    public string Justificacion { get; set; } = string.Empty;
    public int ProyeccionProximoMes { get; set; }
    public string NivelUrgencia { get; set; } = "Baja";
    // Datos históricos para los gráficos de Angular
    public List<VentaMensualDTO> VentasMensuales { get; set; } = new();
}

// DTO para el historial (lista de análisis pasados)
public class AnalisisIAResumenDTO
{
    public int IdAnalisis { get; set; }
    public DateTime FechaGeneracion { get; set; }
    public int TotalProductosAnalizados { get; set; }
    public int? TokensUsados { get; set; }
}
