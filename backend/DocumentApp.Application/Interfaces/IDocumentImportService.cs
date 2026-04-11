namespace DocumentApp.Application.Interfaces;


public interface IDocumentImportService
{
   
    Task ImportAsync(string documentsPath, string itemsPath);
    Task ImportAsync(Stream documentsStream, Stream itemsStream);
}
