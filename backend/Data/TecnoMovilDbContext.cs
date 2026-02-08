using Microsoft.EntityFrameworkCore;
using backend.Models;

namespace backend.Data;

public class TecnoMovilDbContext : DbContext
{
    public TecnoMovilDbContext(DbContextOptions<TecnoMovilDbContext> options) : base(options)
    {
    }

    // DbSets
    public DbSet<Configuracion> Configuraciones { get; set; }
    public DbSet<Categoria> Categorias { get; set; }
    public DbSet<Producto> Productos { get; set; }
    public DbSet<ProductoSerial> ProductoSeriales { get; set; }
    public DbSet<Usuario> Usuarios { get; set; }
    public DbSet<Cliente> Clientes { get; set; }
    public DbSet<Reparacion> Reparaciones { get; set; }
    public DbSet<ReparacionRepuesto> ReparacionRepuestos { get; set; }
    public DbSet<Factura> Facturas { get; set; }
    public DbSet<FacturaReparacion> FacturaReparaciones { get; set; }
    public DbSet<DetalleFactura> DetalleFacturas { get; set; }
    public DbSet<MovimientoInventario> MovimientosInventario { get; set; }
    public DbSet<Atributo> Atributos { get; set; }
    public DbSet<ProductoAtributo> ProductoAtributos { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configuracion - Solo una fila permitida (id_config = 1)
        modelBuilder.Entity<Configuracion>()
            .HasCheckConstraint("CK_Configuracion_UnaFila", "id_config = 1");

        // Producto_Serial - Número único
        modelBuilder.Entity<ProductoSerial>()
            .HasIndex(ps => ps.NumeroSerieImei)
            .IsUnique();

        // Usuario - Identificación única y correo único
        modelBuilder.Entity<Usuario>()
            .HasIndex(u => u.Identificacion)
            .IsUnique();

        modelBuilder.Entity<Usuario>()
            .HasIndex(u => u.Correo)
            .IsUnique()
            .HasFilter("[correo] IS NOT NULL");

        // Cliente - Identificación única
        modelBuilder.Entity<Cliente>()
            .HasIndex(c => c.Identificacion)
            .IsUnique();

        // Atributo - Nombre único
        modelBuilder.Entity<Atributo>()
            .HasIndex(a => a.NombreAtributo)
            .IsUnique();

        // Reparacion_Repuesto - Índices filtrados
        modelBuilder.Entity<ReparacionRepuesto>()
            .HasIndex(rr => new { rr.IdReparacion, rr.IdProducto })
            .IsUnique()
            .HasFilter("[id_serial] IS NULL")
            .HasDatabaseName("UX_RR_NoSerial");

        modelBuilder.Entity<ReparacionRepuesto>()
            .HasIndex(rr => new { rr.IdReparacion, rr.IdSerial })
            .IsUnique()
            .HasFilter("[id_serial] IS NOT NULL")
            .HasDatabaseName("UX_RR_ConSerial");

        // Índices adicionales del schema
        modelBuilder.Entity<Producto>()
            .HasIndex(p => p.IdCategoria)
            .HasDatabaseName("IX_Producto_id_categoria");

        modelBuilder.Entity<ProductoSerial>()
            .HasIndex(ps => ps.IdProducto)
            .HasDatabaseName("IX_Serial_id_producto");

        modelBuilder.Entity<Reparacion>()
            .HasIndex(r => r.IdCliente)
            .HasDatabaseName("IX_Reparacion_cliente");

        modelBuilder.Entity<Reparacion>()
            .HasIndex(r => r.IdUsuario)
            .HasDatabaseName("IX_Reparacion_tecnico");

        modelBuilder.Entity<DetalleFactura>()
            .HasIndex(df => df.IdFactura)
            .HasDatabaseName("IX_Detalle_factura");

        modelBuilder.Entity<FacturaReparacion>()
            .HasIndex(fr => fr.IdReparacion)
            .HasDatabaseName("IX_FR_reparacion");

        modelBuilder.Entity<MovimientoInventario>()
            .HasIndex(mi => new { mi.IdProducto, mi.Fecha })
            .HasDatabaseName("IX_MI_producto_fecha");

        modelBuilder.Entity<ProductoAtributo>()
            .HasIndex(pa => new { pa.IdAtributo, pa.IdProducto })
            .HasDatabaseName("IX_PA_Atributo");

        // Seed IVA configuración
        modelBuilder.Entity<Configuracion>().HasData(
            new Configuracion { IdConfig = 1, IvaPorcentaje = 15.00m }
        );
        
        // Factura -> Cliente (Restrict para evitar ciclo con Reparacion)
        modelBuilder.Entity<Factura>()
            .HasOne(f => f.Cliente)
            .WithMany(c => c.Facturas)
            .HasForeignKey(f => f.IdCliente)
            .OnDelete(DeleteBehavior.Restrict);

        // Factura -> Usuario (Restrict)
        modelBuilder.Entity<Factura>()
            .HasOne(f => f.Vendedor)
            .WithMany(u => u.Facturas)
            .HasForeignKey(f => f.IdUsuario)
            .OnDelete(DeleteBehavior.Restrict);

        // Reparacion -> Cliente (Restrict)
        modelBuilder.Entity<Reparacion>()
            .HasOne(r => r.Cliente)
            .WithMany(c => c.Reparaciones)
            .HasForeignKey(r => r.IdCliente)
            .OnDelete(DeleteBehavior.Restrict);

        // Reparacion -> Usuario (Restrict)
        modelBuilder.Entity<Reparacion>()
            .HasOne(r => r.Tecnico)
            .WithMany(u => u.Reparaciones)
            .HasForeignKey(r => r.IdUsuario)
            .OnDelete(DeleteBehavior.Restrict);

        // FacturaReparacion -> Factura (Restrict)
        modelBuilder.Entity<FacturaReparacion>()
            .HasOne(fr => fr.Factura)
            .WithMany(f => f.FacturaReparaciones)
            .HasForeignKey(fr => fr.IdFactura)
            .OnDelete(DeleteBehavior.Restrict);

        // FacturaReparacion -> Reparacion (Restrict)
        modelBuilder.Entity<FacturaReparacion>()
            .HasOne(fr => fr.Reparacion)
            .WithMany(r => r.FacturaReparaciones)
            .HasForeignKey(fr => fr.IdReparacion)
            .OnDelete(DeleteBehavior.Restrict);

        // DetalleFactura -> Factura (Cascade es OK aquí)
        modelBuilder.Entity<DetalleFactura>()
            .HasOne(df => df.Factura)
            .WithMany(f => f.Detalles)
            .HasForeignKey(df => df.IdFactura)
            .OnDelete(DeleteBehavior.Cascade);

        // DetalleFactura -> Reparacion (Restrict)
        modelBuilder.Entity<DetalleFactura>()
            .HasOne(df => df.Reparacion)
            .WithMany()
            .HasForeignKey(df => df.IdReparacion)
            .OnDelete(DeleteBehavior.Restrict);

        // ReparacionRepuesto -> Reparacion (Cascade es OK)
        modelBuilder.Entity<ReparacionRepuesto>()
            .HasOne(rr => rr.Reparacion)
            .WithMany(r => r.Repuestos)
            .HasForeignKey(rr => rr.IdReparacion)
            .OnDelete(DeleteBehavior.Cascade);

        // ReparacionRepuesto -> Producto (Restrict)
        modelBuilder.Entity<ReparacionRepuesto>()
            .HasOne(rr => rr.Producto)
            .WithMany()
            .HasForeignKey(rr => rr.IdProducto)
            .OnDelete(DeleteBehavior.Restrict);

        // ReparacionRepuesto -> Serial (Restrict)
        modelBuilder.Entity<ReparacionRepuesto>()
            .HasOne(rr => rr.Serial)
            .WithMany()
            .HasForeignKey(rr => rr.IdSerial)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
