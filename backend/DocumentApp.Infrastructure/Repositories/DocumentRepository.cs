using Microsoft.EntityFrameworkCore;
using DocumentApp.Application.Interfaces;
using DocumentApp.Domain.Entities;
using DocumentApp.Infrastructure.Persistence;

namespace DocumentApp.Infrastructure.Repositories;

public class DocumentRepository : IDocumentRepository
{
    private readonly AppDbContext _context;

    public DocumentRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<Document>> GetAllAsync()
    {
        return await _context.Documents
            .Include(d => d.Items)
            .ToListAsync();
    }

    public async Task<Document?> GetByIdAsync(int id)
    {
        return await _context.Documents
            .Include(d => d.Items)
            .FirstOrDefaultAsync(d => d.Id == id);
    }

    public async Task AddRangeAsync(List<Document> documents)
    {
        await _context.Documents.AddRangeAsync(documents);
        await _context.SaveChangesAsync();
    }
}