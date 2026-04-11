using DocumentApp.Domain.Entities;
using DocumentApp.Application.Interfaces;
using System.Globalization;

namespace DocumentApp.Application.Services;

public class DocumentImportService : IDocumentImportService
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

        await ProcessImportAsync(documentLines, itemLines);
    }

    public async Task ImportAsync(Stream documentsStream, Stream itemsStream)
    {
        using var documentReader = new StreamReader(documentsStream);
        using var itemReader = new StreamReader(itemsStream);

        var documentContent = await documentReader.ReadToEndAsync();
        var itemContent = await itemReader.ReadToEndAsync();

        var documentLines = documentContent.Split(new[] { "\r\n", "\r", "\n" }, StringSplitOptions.None);
        var itemLines = itemContent.Split(new[] { "\r\n", "\r", "\n" }, StringSplitOptions.None);

        await ProcessImportAsync(documentLines, itemLines);
    }

    private async Task ProcessImportAsync(string[] documentLines, string[] itemLines)
    {
        var documents = new List<Document>();

        foreach (var line in documentLines.Skip(1).Where(l => !string.IsNullOrWhiteSpace(l)))
        {
            var parts = line.Split(';');
            if (parts.Length < 6) continue;

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

        foreach (var line in itemLines.Skip(1).Where(l => !string.IsNullOrWhiteSpace(l)))
        {
            var parts = line.Split(';');
            if (parts.Length < 6) continue;

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

        await _repository.UpsertRangeAsync(documents);
    }
}