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
    public async Task UpsertRangeAsync(List<Document> documents)
        {
            var incomingIds = documents.Select(d => d.Id).ToHashSet();

            var existingIds = (await _context.Documents
                .Where(d => incomingIds.Contains(d.Id))
                .Select(d => d.Id)
                .ToListAsync())
                .ToHashSet();

            var toAdd = documents.Where(d => !existingIds.Contains(d.Id)).ToList();

            if (toAdd.Any())
                await _context.Documents.AddRangeAsync(toAdd);

            await _context.SaveChangesAsync();
        }

   
}