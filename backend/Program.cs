using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;
using System.Text.Json.Serialization;
using backend.Data;
using backend.Models;
using DotNetEnv;

// Cargar variables de entorno desde .env
Env.Load();

var builder = WebApplication.CreateBuilder(args);

// ========== SERVICIOS ==========

// EF Core - SQL Server con variables de entorno
var connectionString = $"Server={Environment.GetEnvironmentVariable("DB_SERVER")};" +
                       $"Database={Environment.GetEnvironmentVariable("DB_NAME")};" +
                       $"User Id={Environment.GetEnvironmentVariable("DB_USER")};" +
                       $"Password={Environment.GetEnvironmentVariable("DB_PASSWORD")};" +
                       $"TrustServerCertificate=True;";

builder.Services.AddDbContext<TecnoMovilDbContext>(options =>
    options.UseSqlServer(connectionString));

// JWT Authentication
var jwtKey = Environment.GetEnvironmentVariable("JWT_SECRET_KEY") 
    ?? throw new InvalidOperationException("JWT_SECRET_KEY no configurada en .env");

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = "TecnoMovilAPI",
            ValidAudience = "TecnoMovilApp",
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };
    });

builder.Services.AddAuthorization();

// Controllers con configuración JSON para evitar ciclos
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
    });

// Swagger con soporte JWT
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo 
    { 
        Title = "TecnoMovil API", 
        Version = "v1",
        Description = "API para gestión de tienda de tecnología móvil"
    });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header. Ejemplo: 'Bearer {token}'",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

// ========== SEED ADMIN ==========
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<TecnoMovilDbContext>();
    
    try
    {
        

        // Seed Admin desde variables de entorno
        var adminIdentificacion = Environment.GetEnvironmentVariable("ADMIN_IDENTIFICACION");
        if (!string.IsNullOrEmpty(adminIdentificacion))
        {
            var existeAdmin = await context.Usuarios
                .AnyAsync(u => u.Identificacion == adminIdentificacion);

            if (!existeAdmin)
            {
                var adminNombres = Environment.GetEnvironmentVariable("ADMIN_NOMBRES") ?? "Administrador";
                var adminCorreo = Environment.GetEnvironmentVariable("ADMIN_CORREO");
                var adminPassword = Environment.GetEnvironmentVariable("ADMIN_PASSWORD") ?? "Admin123!";

                var admin = new Usuario
                {
                    Nombres = adminNombres,
                    Correo = adminCorreo,
                    Identificacion = adminIdentificacion,
                    TipoIdentificacion = "Cedula",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(adminPassword),
                    Rol = "Admin",
                    Activo = true
                };

                context.Usuarios.Add(admin);
                await context.SaveChangesAsync();
                Console.WriteLine($"Usuario admin creado: {adminIdentificacion}");
            }
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Error en seed: {ex.Message}");
    }
}

// ========== MIDDLEWARE ==========
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "TecnoMovil API v1");
    });
}

app.UseHttpsRedirection();
app.UseCors("AllowAll");
app.UseStaticFiles(); // Servir archivos estáticos (uploads)
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
