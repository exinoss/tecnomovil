using System.ComponentModel.DataAnnotations;

namespace backend.DTOs;

public class ReparacionDto
{
    public int? IdReparacion { get; set; }

    [Required(ErrorMessage = "El cliente es requerido")]
    public int IdCliente { get; set; }

    [Required(ErrorMessage = "El técnico es requerido")]
    public int IdUsuario { get; set; }

    [Required(ErrorMessage = "El modelo del equipo es requerido")]
    [MaxLength(100)]
    public string ModeloEquipo { get; set; } = string.Empty;

    [Required(ErrorMessage = "El IMEI/Serie de ingreso es requerido")]
    [MaxLength(50)]
    public string SerieImeiIngreso { get; set; } = string.Empty;

    public string? DescripcionFalla { get; set; }
    public string? DiagnosticoFinal { get; set; }
    public decimal CostoManoObra { get; set; } = 0;
    public string Estado { get; set; } = "Recibido";
    public bool? Aprobado { get; set; }
    public string? MotivoRechazo { get; set; }
}

public class ReparacionRepuestoDto
{
    public int? IdReparacionRepuesto { get; set; }

    [Required(ErrorMessage = "La reparación es requerida")]
    public int IdReparacion { get; set; }

    [Required(ErrorMessage = "El producto es requerido")]
    public int IdProducto { get; set; }


    [Required(ErrorMessage = "La cantidad es requerida")]
    [Range(1, int.MaxValue, ErrorMessage = "La cantidad debe ser mayor a 0")]
    public int Cantidad { get; set; }

    public decimal? CostoUnitario { get; set; }
    public decimal? PrecioCobrado { get; set; }
}

public class AprobacionDto
{
    public bool Aprobado { get; set; }
    public string? MotivoRechazo { get; set; }
}
