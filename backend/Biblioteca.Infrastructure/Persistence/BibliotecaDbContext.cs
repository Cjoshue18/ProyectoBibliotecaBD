using Biblioteca.Infrastructure.Entities;
using Microsoft.EntityFrameworkCore;

namespace Biblioteca.Infrastructure.Persistence;

public class BibliotecaDbContext : DbContext
{
    public BibliotecaDbContext(DbContextOptions<BibliotecaDbContext> options)
        : base(options)
    {
    }

    public DbSet<Facultad> Facultades => Set<Facultad>();
    public DbSet<Lector> Lectores => Set<Lector>();
    public DbSet<Alumno> Alumnos => Set<Alumno>();
    public DbSet<Docente> Docentes => Set<Docente>();
    public DbSet<Editorial> Editoriales => Set<Editorial>();
    public DbSet<Libro> Libros => Set<Libro>();
    public DbSet<Autor> Autores => Set<Autor>();
    public DbSet<LibroAutor> LibroAutores => Set<LibroAutor>();
    public DbSet<Edicion> Ediciones => Set<Edicion>();
    public DbSet<Ejemplar> Ejemplares => Set<Ejemplar>();
    public DbSet<Prestamo> Prestamos => Set<Prestamo>();
    public DbSet<Deuda> Deudas => Set<Deuda>();
    public DbSet<Pago> Pagos => Set<Pago>();

    protected override void ConfigureConventions(ModelConfigurationBuilder configurationBuilder)
    {
        // Alinea todas las columnas string con VARCHAR en SQL Server para evitar conversiones implícitas en índices.
        configurationBuilder.Properties<string>().AreUnicode(false);
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Facultad>(entity =>
        {
            entity.ToTable("Facultad");
            entity.HasKey(e => e.IdFacultad);
            entity.Property(e => e.IdFacultad).HasColumnName("id_facultad");
            entity.Property(e => e.NombreFacultad).HasColumnName("nombre_facultad").HasMaxLength(100).IsRequired();
        });

        modelBuilder.Entity<Lector>(entity =>
        {
            entity.ToTable("Lector");
            entity.HasKey(e => e.IdLector);
            entity.Property(e => e.IdLector).HasColumnName("id_lector");
            entity.Property(e => e.TipoDoc).HasColumnName("tipo_doc").HasMaxLength(10).IsRequired();
            entity.Property(e => e.NumeroDoc).HasColumnName("numero_doc").HasMaxLength(20).IsRequired();
            entity.Property(e => e.Nombres).HasColumnName("nombres").HasMaxLength(100).IsRequired();
            entity.Property(e => e.ApellidoPaterno).HasColumnName("apellido_paterno").HasMaxLength(50).IsRequired();
            entity.Property(e => e.ApellidoMaterno).HasColumnName("apellido_materno").HasMaxLength(50);
            entity.Property(e => e.CorreoInstitucional).HasColumnName("correo_institucional").HasMaxLength(100).IsRequired();
            entity.Property(e => e.Telefono).HasColumnName("telefono").HasMaxLength(15);
            entity.Property(e => e.Direccion).HasColumnName("direccion").HasMaxLength(200);
            entity.Property(e => e.TipoLector).HasColumnName("tipo_lector").HasMaxLength(20).IsRequired();
            entity.Property(e => e.EstadoLector).HasColumnName("estado_lector").HasMaxLength(20).HasDefaultValue("Activo").IsRequired();
            entity.Property(e => e.IdFacultad).HasColumnName("id_facultad");

            entity.HasIndex(e => new { e.TipoDoc, e.NumeroDoc }).IsUnique();
            entity.HasIndex(e => e.CorreoInstitucional).IsUnique();

            entity.HasOne(e => e.Facultad)
                .WithMany(f => f.Lectores)
                .HasForeignKey(e => e.IdFacultad)
                .OnDelete(DeleteBehavior.NoAction);
        });

        modelBuilder.Entity<Alumno>(entity =>
        {
            entity.ToTable("Alumno");
            entity.HasKey(e => e.IdLector);
            entity.Property(e => e.IdLector).HasColumnName("id_lector");
            entity.Property(e => e.CodigoAlumno).HasColumnName("codigo_alumno").HasMaxLength(9).IsRequired();
            entity.Property(e => e.Ciclo).HasColumnName("ciclo").IsRequired();

            entity.HasIndex(e => e.CodigoAlumno).IsUnique();

            entity.HasOne(e => e.Lector)
                .WithOne(l => l.Alumno)
                .HasForeignKey<Alumno>(e => e.IdLector)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Docente>(entity =>
        {
            entity.ToTable("Docente");
            entity.HasKey(e => e.IdLector);
            entity.Property(e => e.IdLector).HasColumnName("id_lector");
            entity.Property(e => e.CategoriaDocente).HasColumnName("categoria_docente").HasMaxLength(20).IsRequired();

            entity.HasOne(e => e.Lector)
                .WithOne(l => l.Docente)
                .HasForeignKey<Docente>(e => e.IdLector)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Editorial>(entity =>
        {
            entity.ToTable("Editorial");
            entity.HasKey(e => e.IdEditorial);
            entity.Property(e => e.IdEditorial).HasColumnName("id_editorial");
            entity.Property(e => e.NombreEditorial).HasColumnName("nombre_editorial").HasMaxLength(100).IsRequired();
            entity.Property(e => e.PaisOrigen).HasColumnName("pais_origen").HasMaxLength(50).IsRequired();

            entity.HasIndex(e => e.NombreEditorial).IsUnique();
        });

        modelBuilder.Entity<Libro>(entity =>
        {
            entity.ToTable("Libro");
            entity.HasKey(e => e.IdLibro);
            entity.Property(e => e.IdLibro).HasColumnName("id_libro");
            entity.Property(e => e.Titulo).HasColumnName("titulo").HasMaxLength(200).IsRequired();
        });

        modelBuilder.Entity<Autor>(entity =>
        {
            entity.ToTable("Autor");
            entity.HasKey(e => e.IdAutor);
            entity.Property(e => e.IdAutor).HasColumnName("id_autor");
            entity.Property(e => e.NombreAutor).HasColumnName("nombre_autor").HasMaxLength(200).IsRequired();
        });

        modelBuilder.Entity<LibroAutor>(entity =>
        {
            entity.ToTable("Libro_Autor");
            entity.HasKey(e => new { e.IdLibro, e.IdAutor });
            entity.Property(e => e.IdLibro).HasColumnName("id_libro");
            entity.Property(e => e.IdAutor).HasColumnName("id_autor");

            entity.HasOne(e => e.Libro)
                .WithMany(l => l.LibroAutores)
                .HasForeignKey(e => e.IdLibro)
                .OnDelete(DeleteBehavior.NoAction);

            entity.HasOne(e => e.Autor)
                .WithMany(a => a.LibroAutores)
                .HasForeignKey(e => e.IdAutor)
                .OnDelete(DeleteBehavior.NoAction);
        });

        modelBuilder.Entity<Edicion>(entity =>
        {
            entity.ToTable("Edicion");
            entity.HasKey(e => e.Isbn);
            entity.Property(e => e.Isbn).HasColumnName("isbn").HasMaxLength(20);
            entity.Property(e => e.NumeroEdicion).HasColumnName("numero_edicion").IsRequired();
            entity.Property(e => e.AnioPublicacion).HasColumnName("anio_publicacion").IsRequired();
            entity.Property(e => e.IdEditorial).HasColumnName("id_editorial");
            entity.Property(e => e.IdLibro).HasColumnName("id_libro");

            entity.HasOne(e => e.Editorial)
                .WithMany(ed => ed.Ediciones)
                .HasForeignKey(e => e.IdEditorial)
                .OnDelete(DeleteBehavior.NoAction);

            entity.HasOne(e => e.Libro)
                .WithMany(l => l.Ediciones)
                .HasForeignKey(e => e.IdLibro)
                .OnDelete(DeleteBehavior.NoAction);
        });

        modelBuilder.Entity<Ejemplar>(entity =>
        {
            entity.ToTable("Ejemplar");
            entity.HasKey(e => new { e.Isbn, e.NumeroCopia });
            entity.Property(e => e.Isbn).HasColumnName("isbn").HasMaxLength(20);
            entity.Property(e => e.NumeroCopia).HasColumnName("numero_copia");
            entity.Property(e => e.TipoEstadoFisico).HasColumnName("tipo_estado_fisico").HasMaxLength(20).HasDefaultValue("Bueno").IsRequired();
            entity.Property(e => e.IdFacultad).HasColumnName("id_facultad");

            entity.HasOne(e => e.Edicion)
                .WithMany(ed => ed.Ejemplares)
                .HasForeignKey(e => e.Isbn)
                .OnDelete(DeleteBehavior.NoAction);

            entity.HasOne(e => e.Facultad)
                .WithMany(f => f.Ejemplares)
                .HasForeignKey(e => e.IdFacultad)
                .OnDelete(DeleteBehavior.NoAction);
        });

        modelBuilder.Entity<Prestamo>(entity =>
        {
            entity.ToTable("Prestamo");
            entity.HasKey(e => e.IdPrestamo);
            entity.Property(e => e.IdPrestamo).HasColumnName("id_prestamo");
            entity.Property(e => e.FechaPrestamo).HasColumnName("fecha_prestamo").HasColumnType("datetime2(0)").IsRequired();
            entity.Property(e => e.FechaVencimiento).HasColumnName("fecha_vencimiento").HasColumnType("datetime2(0)").IsRequired();
            entity.Property(e => e.FechaDevolucionReal).HasColumnName("fecha_devolucion_real").HasColumnType("datetime2(0)");
            entity.Property(e => e.TipoPrestamo).HasColumnName("tipo_prestamo").HasMaxLength(20).IsRequired();
            entity.Property(e => e.IdLector).HasColumnName("id_lector");
            entity.Property(e => e.Isbn).HasColumnName("isbn").HasMaxLength(20).IsRequired();
            entity.Property(e => e.NumeroCopia).HasColumnName("numero_copia");

            entity.HasOne(e => e.Lector)
                .WithMany(l => l.Prestamos)
                .HasForeignKey(e => e.IdLector)
                .OnDelete(DeleteBehavior.NoAction);

            entity.HasOne(e => e.Ejemplar)
                .WithMany(ej => ej.Prestamos)
                .HasForeignKey(e => new { e.Isbn, e.NumeroCopia })
                .OnDelete(DeleteBehavior.NoAction);
        });

        modelBuilder.Entity<Deuda>(entity =>
        {
            entity.ToTable("Deuda");
            entity.HasKey(e => e.IdDeuda);
            entity.Property(e => e.IdDeuda).HasColumnName("id_deuda");
            entity.Property(e => e.TarifaDiaria).HasColumnName("tarifa_diaria").HasColumnType("decimal(10,2)").HasDefaultValue(5.00m).IsRequired();
            entity.Property(e => e.FechaFinSuspension).HasColumnName("fecha_fin_suspension").HasColumnType("datetime2(0)");
            entity.Property(e => e.EstadoDeuda).HasColumnName("estado_deuda").HasMaxLength(20).HasDefaultValue("Pendiente").IsRequired();
            entity.Property(e => e.IdPrestamo).HasColumnName("id_prestamo");

            entity.HasIndex(e => e.IdPrestamo).IsUnique();

            entity.HasOne(e => e.Prestamo)
                .WithOne(p => p.Deuda)
                .HasForeignKey<Deuda>(e => e.IdPrestamo)
                .OnDelete(DeleteBehavior.NoAction);
        });

        modelBuilder.Entity<Pago>(entity =>
        {
            entity.ToTable("Pago");
            entity.HasKey(e => e.IdPago);
            entity.Property(e => e.IdPago).HasColumnName("id_pago");
            entity.Property(e => e.NumeroRecibo).HasColumnName("numero_recibo").HasMaxLength(20).IsRequired();
            entity.Property(e => e.FechaPago).HasColumnName("fecha_pago").HasColumnType("datetime2(0)").IsRequired();
            entity.Property(e => e.MontoPagado).HasColumnName("monto_pagado").HasColumnType("decimal(10,2)").IsRequired();
            entity.Property(e => e.IdDeuda).HasColumnName("id_deuda");

            entity.HasIndex(e => e.IdDeuda).IsUnique();
            entity.HasIndex(e => e.NumeroRecibo).IsUnique();

            entity.HasOne(e => e.Deuda)
                .WithOne(d => d.Pago)
                .HasForeignKey<Pago>(e => e.IdDeuda)
                .OnDelete(DeleteBehavior.NoAction);
        });
    }
}
