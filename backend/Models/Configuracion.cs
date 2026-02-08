using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models;

[Table("Configuracion")]
public class Configuracion
{
    [Key]
    [Column("id_config")]
    public int IdConfig { get; set; } = 1;

    [Column("iva_porcentaje", TypeName = "decimal(5,2)")]
    public decimal IvaPorcentaje { get; set; }
}
