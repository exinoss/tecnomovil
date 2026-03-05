using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using backend.Services;

namespace backend.Controllers;

public class EnviarEmailDto
{
    public string Destinatario { get; set; } = "";
    public string? NombreDestinatario { get; set; }
    public string Asunto { get; set; } = "";
    /// <summary>Puede ser HTML o texto plano.</summary>
    public string Cuerpo { get; set; } = "";
    /// <summary>Si es true, el cuerpo se trata como texto plano (se convierte a HTML simple).</summary>
    public bool EsTextoPlano { get; set; } = false;
    public List<ArchivoAdjuntoDto>? Adjuntos { get; set; }
}

public class ArchivoAdjuntoDto
{
    public string Nombre { get; set; } = "";
    public string Base64 { get; set; } = "";
    public string ContentType { get; set; } = "";
}

[ApiController]
[Route("api/email")]
[Authorize]
public class EmailController : ControllerBase
{
    private readonly EmailService _emailService;

    public EmailController(EmailService emailService)
    {
        _emailService = emailService;
    }

    /// <summary>Envía un correo electrónico.</summary>
    [HttpPost("enviar")]
    public async Task<IActionResult> Enviar([FromBody] EnviarEmailDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Destinatario))
            return BadRequest(new { message = "El destinatario es requerido." });

        if (string.IsNullOrWhiteSpace(dto.Asunto))
            return BadRequest(new { message = "El asunto es requerido." });

        if (string.IsNullOrWhiteSpace(dto.Cuerpo))
            return BadRequest(new { message = "El cuerpo del correo es requerido." });

        try
        {
            if (dto.EsTextoPlano)
                await _emailService.EnviarTextoAsync(dto.Destinatario, dto.Asunto, dto.Cuerpo, dto.NombreDestinatario);
            else
                await _emailService.EnviarAsync(dto.Destinatario, dto.Asunto, dto.Cuerpo, dto.NombreDestinatario, dto.Adjuntos);

            return Ok(new { message = "Correo enviado correctamente." });

        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error al enviar el correo.", detalle = ex.Message });
        }
    }
}
