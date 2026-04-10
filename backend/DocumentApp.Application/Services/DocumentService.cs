using DocumentApp.Application.Interfaces;
using DocumentApp.Domain.Entities;

namespace DocumentApp.Application.Services;

public class DocumentService
{
    private readonly IDocumentRepository _repository;

    public DocumentService(IDocumentRepository repository)
    {
        _repository = repository;
    }

    public Task<List<Document>> GetAllAsync()
    {
        return _repository.GetAllAsync();
    }
}