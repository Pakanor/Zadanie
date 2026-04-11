using DocumentApp.Domain.Entities;
using DocumentApp.Application.DTOs;

namespace DocumentApp.Application.Interfaces;

public interface IDocumentRepository
{
    Task<(List<Document> Documents, int TotalCount)> GetPaginatedAsync(PaginationFilterDto filter);
    Task<Document?> GetByIdAsync(int id);
    Task UpsertRangeAsync(List<Document> documents);
}