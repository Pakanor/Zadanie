using Microsoft.EntityFrameworkCore;
using DocumentApp.Application.Interfaces;
using DocumentApp.Application.DTOs;
using DocumentApp.Application.Constants;
using DocumentApp.Domain.Entities;
using DocumentApp.Infrastructure.Persistence;
using System.Linq;

namespace DocumentApp.Infrastructure.Repositories;

public class DocumentRepository : IDocumentRepository
{
    private readonly AppDbContext _context;

    public DocumentRepository(AppDbContext context)
    {
        _context = context;
    }

   

    public async Task<(List<Document> Documents, int TotalCount)> GetPaginatedAsync(PaginationFilterDto filter)
    {
        var query = _context.Documents
            .Include(d => d.Items)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(filter.Type))
            query = query.Where(d => d.Type.Contains(filter.Type));

        if (!string.IsNullOrWhiteSpace(filter.FirstName))
            query = query.Where(d => d.FirstName.Contains(filter.FirstName));

        if (!string.IsNullOrWhiteSpace(filter.LastName))
            query = query.Where(d => d.LastName.Contains(filter.LastName));

        if (!string.IsNullOrWhiteSpace(filter.City))
            query = query.Where(d => d.City.Contains(filter.City));

        if (filter.DateFrom.HasValue)
            query = query.Where(d => d.Date >= filter.DateFrom);

        if (filter.DateTo.HasValue)
            query = query.Where(d => d.Date <= filter.DateTo);

        query = ApplySorting(query, filter.SortBy, filter.SortDescending);

        var totalCount = await query.CountAsync();

        var documents = await query
            .Skip((filter.PageNumber - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .ToListAsync();

        return (documents, totalCount);
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

    
    private static IQueryable<Document> ApplySorting(
        IQueryable<Document> query, 
        string? sortBy, 
        bool sortDescending)
    {
        var validSortBy = DocumentSortFields.IsAllowed(sortBy) 
            ? sortBy!.ToLower() 
            : DocumentSortFields.DefaultSortField;

        var sortedQuery = validSortBy switch
        {
            var s when s.Equals("id", StringComparison.OrdinalIgnoreCase) =>
                sortDescending ? query.OrderByDescending(d => d.Id) : query.OrderBy(d => d.Id),

            var s when s.Equals("date", StringComparison.OrdinalIgnoreCase) =>
                sortDescending 
                    ? query.OrderByDescending(d => d.Date).ThenBy(d => d.Id)
                    : query.OrderBy(d => d.Date).ThenBy(d => d.Id),

            var s when s.Equals("type", StringComparison.OrdinalIgnoreCase) =>
                sortDescending 
                    ? query.OrderByDescending(d => d.Type).ThenBy(d => d.Id)
                    : query.OrderBy(d => d.Type).ThenBy(d => d.Id),

            var s when s.Equals("firstname", StringComparison.OrdinalIgnoreCase) =>
                sortDescending 
                    ? query.OrderByDescending(d => d.FirstName).ThenBy(d => d.Id)
                    : query.OrderBy(d => d.FirstName).ThenBy(d => d.Id),

            var s when s.Equals("lastname", StringComparison.OrdinalIgnoreCase) =>
                sortDescending 
                    ? query.OrderByDescending(d => d.LastName).ThenBy(d => d.Id)
                    : query.OrderBy(d => d.LastName).ThenBy(d => d.Id),

            var s when s.Equals("city", StringComparison.OrdinalIgnoreCase) =>
                sortDescending 
                    ? query.OrderByDescending(d => d.City).ThenBy(d => d.Id)
                    : query.OrderBy(d => d.City).ThenBy(d => d.Id),

            _ => query.OrderByDescending(d => d.Date).ThenBy(d => d.Id)
        };

        return sortedQuery;
    }
}