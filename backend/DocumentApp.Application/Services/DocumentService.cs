using DocumentApp.Application.Interfaces;
using DocumentApp.Domain.Entities;
using DocumentApp.Application.DTOs;
namespace DocumentApp.Application.Services;

public class DocumentService
{
    private readonly IDocumentRepository _repository;

    public DocumentService(IDocumentRepository repository)
    {
        _repository = repository;
    }

    public async Task<List<DocumentDto>> GetAllAsync()
    {
        var docs = await _repository.GetAllAsync();

        return docs.Select(d => new DocumentDto
        {
            Id = d.Id,
            Type = d.Type,
            Date = d.Date,
            FirstName = d.FirstName,
            LastName = d.LastName,
            City = d.City,
            ItemsCount = d.Items.Count
        }).ToList();
    }

    public async Task<DocumentDetailsDto?> GetByIdAsync(int id)
{
    var d = await _repository.GetByIdAsync(id);

    if (d == null) return null;

    return new DocumentDetailsDto
    {
        Id = d.Id,
        Type = d.Type,
        Date = d.Date,
        FirstName = d.FirstName,
        LastName = d.LastName,
        City = d.City,

        Items = d.Items.Select(i => new DocumentItemDto
        {
            Ordinal = i.Ordinal,
            Product = i.Product,
            Quantity = i.Quantity,
            Price = i.Price,
            TaxRate = i.TaxRate
        }).ToList()
    };
}
}