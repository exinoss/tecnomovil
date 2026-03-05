using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.DTOs;
using backend.Models;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProductosController : ControllerBase
{
    private readonly TecnoMovilDbContext _context;

    public ProductosController(TecnoMovilDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Producto>>> GetAll()
    {
        return await _context.Productos
            .Include(p => p.Categoria)
            .ToListAsync();
    }

    [HttpGet("paged")]
    public async Task<ActionResult<PagedResponseDto<ProductoListItemDto>>> GetPaged(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? search = null,
        [FromQuery] int? idCategoria = null)
    {
        if (page < 1) page = 1;
        if (pageSize < 1) pageSize = 10;
        if (pageSize > 100) pageSize = 100;

        var query = _context.Productos
            .AsNoTracking()
            .Include(p => p.Categoria)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(p =>
                EF.Functions.Like(p.NombreProducto, $"%{search}%") ||
                (p.Descripcion != null && EF.Functions.Like(p.Descripcion, $"%{search}%"))
            );
        }

        if (idCategoria.HasValue && idCategoria.Value > 0)
        {
            query = query.Where(p => p.IdCategoria == idCategoria.Value);
        }

        var totalItems = await query.CountAsync();
        var totalPages = totalItems == 0 ? 1 : (int)Math.Ceiling(totalItems / (double)pageSize);

        if (page > totalPages) page = totalPages;

        var items = await query
            .OrderByDescending(p => p.IdProducto)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(p => new ProductoListItemDto
            {
                IdProducto = p.IdProducto,
                IdCategoria = p.IdCategoria,
                NombreProducto = p.NombreProducto,
                Imagen = p.Imagen,
                Descripcion = p.Descripcion,
                StockActual = p.StockActual,
                PrecioVenta = p.PrecioVenta,
                EsSerializado = p.EsSerializado,
                Activo = p.Activo,
                CategoriaNombre = p.Categoria != null ? p.Categoria.NombreCategoria : string.Empty
            })
            .ToListAsync();

        return Ok(new PagedResponseDto<ProductoListItemDto>
        {
            Page = page,
            PageSize = pageSize,
            TotalItems = totalItems,
            TotalPages = totalPages,
            Items = items
        });
    }

    [HttpGet("activos")]
    public async Task<ActionResult<IEnumerable<Producto>>> GetActivos()
    {
        return await _context.Productos
            .Include(p => p.Categoria)
            .Where(p => p.Activo)
            .ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Producto>> GetById(int id)
    {
        var producto = await _context.Productos
            .Include(p => p.Categoria)
            .Include(p => p.Seriales)
            .Include(p => p.Atributos)
                .ThenInclude(a => a.Atributo)
            .FirstOrDefaultAsync(p => p.IdProducto == id);

        if (producto == null)
            return NotFound(new { message = "Producto no encontrado" });

        return producto;
    }

    [HttpGet("categoria/{idCategoria}")]
    public async Task<ActionResult<IEnumerable<Producto>>> GetByCategoria(int idCategoria)
    {
        return await _context.Productos
            .Where(p => p.IdCategoria == idCategoria && p.Activo)
            .ToListAsync();
    }

    [HttpGet("buscar")]
    public async Task<ActionResult<IEnumerable<Producto>>> Buscar([FromQuery] string termino)
    {
        if (string.IsNullOrWhiteSpace(termino))
            return await GetActivos();

        return await _context.Productos
            .Include(p => p.Categoria)
            .Where(p => p.Activo && 
                (p.NombreProducto.Contains(termino) || 
                 (p.Descripcion != null && p.Descripcion.Contains(termino))))
            .ToListAsync();
    }

    [HttpPost]
    public async Task<ActionResult<Producto>> Create([FromBody] ProductoDto dto)
    {
        var producto = new Producto
        {
            IdCategoria = dto.IdCategoria,
            NombreProducto = dto.NombreProducto,
            Imagen = dto.Imagen,
            Descripcion = dto.Descripcion,
            PrecioVenta = dto.PrecioVenta,
            EsSerializado = dto.EsSerializado,
            Activo = dto.Activo
        };

        _context.Productos.Add(producto);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = producto.IdProducto }, producto);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] ProductoDto dto)
    {
        var producto = await _context.Productos.FindAsync(id);
        if (producto == null)
            return NotFound(new { message = "Producto no encontrado" });

        bool eraSerializado = producto.EsSerializado;

        producto.IdCategoria = dto.IdCategoria;
        producto.NombreProducto = dto.NombreProducto;
        producto.Imagen = dto.Imagen;
        producto.Descripcion = dto.Descripcion;
        producto.PrecioVenta = dto.PrecioVenta;
        producto.EsSerializado = dto.EsSerializado;
        producto.Activo = dto.Activo;

        // Si quitaron la serialización, marcar todos sus seriales como Inhabilitado
        if (eraSerializado && !dto.EsSerializado)
        {
            var seriales = await _context.ProductoSeriales
                .Where(s => s.IdProducto == id)
                .ToListAsync();
            foreach (var s in seriales)
                s.Estado = "Inhabilitado";
        }

        await _context.SaveChangesAsync();
        return Ok(producto);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var producto = await _context.Productos.FindAsync(id);
        if (producto == null)
            return NotFound(new { message = "Producto no encontrado" });

        producto.Activo = false;
        await _context.SaveChangesAsync();

        return Ok(new { message = "Producto desactivado" });
    }

    // ========== SERIALES ==========
    [HttpGet("{idProducto}/seriales")]
    public async Task<ActionResult<IEnumerable<ProductoSerial>>> GetSeriales(int idProducto)
    {
        return await _context.ProductoSeriales
            .Where(s => s.IdProducto == idProducto)
            .ToListAsync();
    }

    [HttpGet("{idProducto}/seriales/disponibles")]
    public async Task<ActionResult<IEnumerable<ProductoSerial>>> GetSerialesDisponibles(int idProducto)
    {
        return await _context.ProductoSeriales
            .Where(s => s.IdProducto == idProducto && s.Estado == "Disponible")
            .ToListAsync();
    }

    [HttpPost("{idProducto}/seriales")]
    public async Task<ActionResult<ProductoSerial>> CreateSerial(int idProducto, [FromBody] ProductoSerialDto dto)
    {
        var producto = await _context.Productos.FindAsync(idProducto);
        if (producto == null)
            return NotFound(new { message = "Producto no encontrado" });

        if (!producto.EsSerializado)
            return BadRequest(new { message = "El producto no es serializado" });

        var existe = await _context.ProductoSeriales
            .AnyAsync(s => s.NumeroSerieImei == dto.NumeroSerieImei);
        if (existe)
            return BadRequest(new { message = "El número de serie ya existe" });

        var serial = new ProductoSerial
        {
            IdProducto = idProducto,
            NumeroSerieImei = dto.NumeroSerieImei,
            Estado = "Disponible"
        };

        _context.ProductoSeriales.Add(serial);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetSeriales), new { idProducto }, serial);
    }

    [HttpPut("seriales/{idSerial}")]
    public async Task<IActionResult> UpdateSerial(int idSerial, [FromBody] ProductoSerialDto dto)
    {
        var serial = await _context.ProductoSeriales.FindAsync(idSerial);
        if (serial == null)
            return NotFound(new { message = "Serial no encontrado" });

        serial.NumeroSerieImei = dto.NumeroSerieImei;
        serial.Estado = dto.Estado;

        await _context.SaveChangesAsync();
        return Ok(serial);
    }

    [HttpDelete("seriales/{idSerial}")]
    public async Task<IActionResult> DeleteSerial(int idSerial)
    {
        var serial = await _context.ProductoSeriales.FindAsync(idSerial);
        if (serial == null)
            return NotFound(new { message = "Serial no encontrado" });

        _context.ProductoSeriales.Remove(serial);
        await _context.SaveChangesAsync();
        return Ok(new { message = "Serial eliminado" });
    }

    // ========== UPLOAD IMAGEN ==========
    [HttpPost("upload-imagen")]
    public async Task<IActionResult> UploadImagen(IFormFile archivo)
    {
        if (archivo == null || archivo.Length == 0)
            return BadRequest(new { message = "No se envió ningún archivo" });

        // Validar extensión
        var extensionesPermitidas = new[] { ".jpg", ".jpeg", ".png", ".webp", ".gif" };
        var extension = Path.GetExtension(archivo.FileName).ToLowerInvariant();
        
        if (!extensionesPermitidas.Contains(extension))
            return BadRequest(new { message = "Extensión no permitida. Use: jpg, jpeg, png, webp, gif" });

        // Validar tamaño (max 5MB)
        if (archivo.Length > 5 * 1024 * 1024)
            return BadRequest(new { message = "El archivo excede el tamaño máximo de 5MB" });

        // Crear directorio si no existe
        var uploadsPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "productos");
        if (!Directory.Exists(uploadsPath))
            Directory.CreateDirectory(uploadsPath);

        // Generar nombre único
        var nombreArchivo = $"{Guid.NewGuid()}{extension}";
        var rutaCompleta = Path.Combine(uploadsPath, nombreArchivo);

        // Guardar archivo
        using (var stream = new FileStream(rutaCompleta, FileMode.Create))
        {
            await archivo.CopyToAsync(stream);
        }

        // Retornar URL relativa
        var urlImagen = $"/uploads/productos/{nombreArchivo}";
        
        return Ok(new { url = urlImagen });
    }

    [HttpPost("{id}/upload-imagen")]
    public async Task<IActionResult> UploadImagenProducto(int id, IFormFile archivo)
    {
        var producto = await _context.Productos.FindAsync(id);
        if (producto == null)
            return NotFound(new { message = "Producto no encontrado" });

        if (archivo == null || archivo.Length == 0)
            return BadRequest(new { message = "No se envió ningún archivo" });

        var extensionesPermitidas = new[] { ".jpg", ".jpeg", ".png", ".webp", ".gif" };
        var extension = Path.GetExtension(archivo.FileName).ToLowerInvariant();
        
        if (!extensionesPermitidas.Contains(extension))
            return BadRequest(new { message = "Extensión no permitida. Use: jpg, jpeg, png, webp, gif" });

        if (archivo.Length > 5 * 1024 * 1024)
            return BadRequest(new { message = "El archivo excede el tamaño máximo de 5MB" });

        var uploadsPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "productos");
        if (!Directory.Exists(uploadsPath))
            Directory.CreateDirectory(uploadsPath);

        // Eliminar imagen anterior si existe
        if (!string.IsNullOrEmpty(producto.Imagen))
        {
            var imagenAnterior = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", producto.Imagen.TrimStart('/'));
            if (System.IO.File.Exists(imagenAnterior))
                System.IO.File.Delete(imagenAnterior);
        }

        var nombreArchivo = $"{Guid.NewGuid()}{extension}";
        var rutaCompleta = Path.Combine(uploadsPath, nombreArchivo);

        using (var stream = new FileStream(rutaCompleta, FileMode.Create))
        {
            await archivo.CopyToAsync(stream);
        }

        // Actualizar producto con nueva URL
        producto.Imagen = $"/uploads/productos/{nombreArchivo}";
        await _context.SaveChangesAsync();

        return Ok(new { url = producto.Imagen, producto });
    }

    [HttpDelete("{id}/imagen")]
    public async Task<IActionResult> DeleteImagen(int id)
    {
        var producto = await _context.Productos.FindAsync(id);
        if (producto == null)
            return NotFound(new { message = "Producto no encontrado" });

        if (string.IsNullOrEmpty(producto.Imagen))
            return BadRequest(new { message = "El producto no tiene imagen" });

        var rutaImagen = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", producto.Imagen.TrimStart('/'));
        if (System.IO.File.Exists(rutaImagen))
            System.IO.File.Delete(rutaImagen);

        producto.Imagen = null;
        await _context.SaveChangesAsync();

        return Ok(new { message = "Imagen eliminada" });
    }
}
