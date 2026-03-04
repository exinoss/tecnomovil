using System.ComponentModel.DataAnnotations;

namespace backend.DTOs;

public class FacturaDto
{
    public int? IdFactura { get; set; }

    [Required(ErrorMessage = "El cliente es requerido")]
    public int IdCliente { get; set; }

    public int? IdUsuario { get; set; } // Se toma del token

    public List<DetalleFacturaDto> Detalles { get; set; } = new();
    public List<int>? ReparacionIds { get; set; } // IDs de reparaciones a facturar
}

public class DetalleFacturaDto
{
    public int? IdDetalle { get; set; }
    public int? IdProducto { get; set; }

    public int? IdReparacion { get; set; }
    public string? DescripcionItem { get; set; }

    [Required(ErrorMessage = "La cantidad es requerida")]
    [Range(1, int.MaxValue, ErrorMessage = "La cantidad debe ser mayor a 0")]
    public int Cantidad { get; set; }

    [Required(ErrorMessage = "El precio unitario es requerido")]
    [Range(0, double.MaxValue, ErrorMessage = "El precio no puede ser negativo")]
    public decimal PrecioUnitario { get; set; }

    [Required(ErrorMessage = "El tipo de item es requerido")]
    public string TipoItem { get; set; } = "Venta Directa";
}

public class FacturaResponseDto
{
    public int IdFactura { get; set; }
    public DateTime Fecha { get; set; }
    public string ClienteNombre { get; set; } = string.Empty;
    public string VendedorNombre { get; set; } = string.Empty;
    public decimal IvaPorcentaje { get; set; }
    public decimal Subtotal { get; set; }
    public decimal Iva { get; set; }
    public decimal Total { get; set; }
    public List<DetalleFacturaDto> Detalles { get; set; } = new();
}
