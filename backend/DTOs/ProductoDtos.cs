using System.ComponentModel.DataAnnotations;

namespace backend.DTOs;

public class CategoriaDto
{
    public int? IdCategoria { get; set; }

    [Required(ErrorMessage = "El nombre de la categoría es requerido")]
    [MaxLength(50)]
    public string NombreCategoria { get; set; } = string.Empty;

    public bool Activo { get; set; } = true;
}

public class ProductoDto
{
    public int? IdProducto { get; set; }

    [Required(ErrorMessage = "La categoría es requerida")]
    public int IdCategoria { get; set; }

    [Required(ErrorMessage = "El nombre del producto es requerido")]
    [MaxLength(255)]
    public string NombreProducto { get; set; } = string.Empty;

    public string? Imagen { get; set; }
    public string? Descripcion { get; set; }

    [Required(ErrorMessage = "El precio de venta es requerido")]
    [Range(0.01, double.MaxValue, ErrorMessage = "El precio debe ser mayor a 0")]
    public decimal PrecioVenta { get; set; }

    public bool EsSerializado { get; set; } = false;
    public bool Activo { get; set; } = true;
}

public class ProductoSerialDto
{
    public int? IdSerial { get; set; }

    [Required(ErrorMessage = "El producto es requerido")]
    public int IdProducto { get; set; }

    [Required(ErrorMessage = "El número de serie/IMEI es requerido")]
    [MaxLength(50)]
    public string NumeroSerieImei { get; set; } = string.Empty;

    public string Estado { get; set; } = "Disponible";
}
