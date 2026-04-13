namespace DocumentApp.Application.Interfaces;

using DocumentApp.Application.DTOs;

public interface IDocumentImportService
{
    Task<ImportResultDto> ImportAsync(string documentsPath, string itemsPath);
    Task<ImportResultDto> ImportAsync(Stream documentsStream, Stream itemsStream);
}

