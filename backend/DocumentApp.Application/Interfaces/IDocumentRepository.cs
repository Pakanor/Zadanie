using DocumentApp.Domain.Entities;

namespace DocumentApp.Application.Interfaces;

public interface IDocumentRepository
{
    Task<List<Document>> GetAllAsync();
    Task<Document?> GetByIdAsync(int id);
    Task UpsertRangeAsync(List<Document> documents);
}