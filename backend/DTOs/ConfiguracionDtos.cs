using System.ComponentModel.DataAnnotations;

namespace backend.DTOs;

public class ConfiguracionDto
{
    [Required]
    [Range(0, 100, ErrorMessage = "El IVA debe estar entre 0 y 100")]
    public decimal IvaPorcentaje { get; set; }
}

public class AtributoDto
{
    public int? IdAtributo { get; set; }

    [Required(ErrorMessage = "El nombre del atributo es requerido")]
    [MaxLength(60)]
    public string NombreAtributo { get; set; } = string.Empty;

    [Required(ErrorMessage = "El tipo de dato es requerido")]
    public string TipoDato { get; set; } = "texto";

    [MaxLength(20)]
    public string? Unidad { get; set; }

    public bool Activo { get; set; } = true;
}

public class ProductoAtributoDto
{
    [Required]
    public int IdProducto { get; set; }

    [Required]
    public int IdAtributo { get; set; }

    public string? ValorTexto { get; set; }
    public decimal? ValorNumero { get; set; }
    public bool? ValorBool { get; set; }
    public DateOnly? ValorFecha { get; set; }
}

public class MovimientoInventarioDto
{
    public int? IdMovimiento { get; set; }

    [Required]
    public int IdProducto { get; set; }



    [Required]
    public string Tipo { get; set; } = string.Empty;

    [Required]
    public int Cantidad { get; set; }

    public string? ReferenciaTabla { get; set; }
    public int? ReferenciaId { get; set; }
    public string? Detalle { get; set; }
}
