using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;

namespace backend.Services;

public class EmailSettings
{
    public string Host { get; set; } = "";
    public int Port { get; set; } = 587;
    public string User { get; set; } = "";
    public string Pass { get; set; } = "";
    public string From { get; set; } = "";
    public string FromName { get; set; } = "";
}

public class EmailService
{
    private readonly EmailSettings _settings;

    public EmailService()
    {
        _settings = new EmailSettings
        {
            Host     = Environment.GetEnvironmentVariable("SMTP_HOST")      ?? "smtp.gmail.com",
            Port     = int.TryParse(Environment.GetEnvironmentVariable("SMTP_PORT"), out var p) ? p : 587,
            User     = Environment.GetEnvironmentVariable("SMTP_USER")      ?? "",
            Pass     = Environment.GetEnvironmentVariable("SMTP_PASS")      ?? "",
            From     = Environment.GetEnvironmentVariable("SMTP_FROM")      ?? "",
            FromName = Environment.GetEnvironmentVariable("SMTP_FROM_NAME") ?? "TecnoMovil"
        };
    }

    public async Task EnviarAsync(string destinatario, string asunto, string cuerpoHtml, string? nombreDestinatario = null, List<backend.Controllers.ArchivoAdjuntoDto>? adjuntos = null)
    {
        var mensaje = new MimeMessage();
        mensaje.From.Add(new MailboxAddress(_settings.FromName, _settings.From));
        mensaje.To.Add(new MailboxAddress(nombreDestinatario ?? destinatario, destinatario));
        mensaje.Subject = asunto;

        var builder = new BodyBuilder { HtmlBody = cuerpoHtml };

        if (adjuntos != null && adjuntos.Count > 0)
        {
            foreach (var adjunto in adjuntos)
            {
                var bytes = Convert.FromBase64String(adjunto.Base64);
                builder.Attachments.Add(adjunto.Nombre, bytes, ContentType.Parse(adjunto.ContentType));
            }
        }

        mensaje.Body = builder.ToMessageBody();

        using var smtp = new SmtpClient();
        await smtp.ConnectAsync(_settings.Host, _settings.Port, SecureSocketOptions.StartTls);
        await smtp.AuthenticateAsync(_settings.User, _settings.Pass);
        await smtp.SendAsync(mensaje);
        await smtp.DisconnectAsync(true);
    }


    /// <summary>Envía con cuerpo de texto plano.</summary>
    public async Task EnviarTextoAsync(string destinatario, string asunto, string cuerpoTexto, string? nombreDestinatario = null)
    {
        var html = $"<pre style='font-family:sans-serif'>{System.Net.WebUtility.HtmlEncode(cuerpoTexto)}</pre>";
        await EnviarAsync(destinatario, asunto, html, nombreDestinatario);
    }
}
