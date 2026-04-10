using Microsoft.EntityFrameworkCore;
using DocumentApp.Domain.Entities;

namespace DocumentApp.Infrastructure.Persistence;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options) { }

    public DbSet<Document> Documents => Set<Document>();
    public DbSet<DocumentItem> DocumentItems => Set<DocumentItem>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Document>()
            .HasMany(d => d.Items)
            .WithOne(i => i.Document)
            .HasForeignKey(i => i.DocumentId);
    }
}