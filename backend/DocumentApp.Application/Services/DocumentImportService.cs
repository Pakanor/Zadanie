using DocumentApp.Domain.Entities;
using DocumentApp.Application.Interfaces;
using System.Globalization;

namespace DocumentApp.Application.Services;

public class DocumentImportService
{
    private readonly IDocumentRepository _repository;
    private static readonly CultureInfo _csvCulture = new("pl-PL");

    public DocumentImportService(IDocumentRepository repository)
    {
        _repository = repository;    
        }

    public async Task ImportAsync(string documentsPath, string itemsPath)
    {
        var documentLines = await File.ReadAllLinesAsync(documentsPath);
        var itemLines = await File.ReadAllLinesAsync(itemsPath);

        var documents = new List<Document>();

        foreach (var line in documentLines.Skip(1))
        {
            var parts = line.Split(';');  
            var document = new Document
            {
                Id        = int.Parse(parts[0]),
                Type      = parts[1],
                Date      = DateTime.ParseExact(parts[2], "yyyy-MM-dd", CultureInfo.InvariantCulture),
                FirstName = parts[3],
                LastName  = parts[4],
                City      = parts[5]
            };
            documents.Add(document);
        }

        foreach (var line in itemLines.Skip(1))
        {
            var parts = line.Split(';'); 
            var item = new DocumentItem
            {
                DocumentId = int.Parse(parts[0]),
                Ordinal    = int.Parse(parts[1]),
                Product    = parts[2],
                Quantity   = int.Parse(parts[3]),
                Price      = decimal.Parse(parts[4], _csvCulture),  
                TaxRate    = decimal.Parse(parts[5], _csvCulture)
            };

            var doc = documents.FirstOrDefault(d => d.Id == item.DocumentId);
            doc?.Items.Add(item);
        }

        await _repository.AddRangeAsync(documents);
    }
}