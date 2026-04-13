using DocumentApp.Domain.Entities;
using DocumentApp.Application.Interfaces;
using DocumentApp.Application.Exceptions;
using DocumentApp.Application.DTOs;
using System.Globalization;

namespace DocumentApp.Application.Services;

public class DocumentImportService : IDocumentImportService
{
    private readonly IDocumentRepository _repository;
    private static readonly CultureInfo _csvCulture = new("pl-PL");
    private static readonly string[] DocumentHeaders = { "Id", "Type", "Date", "FirstName", "LastName", "City" };
    private static readonly string[] ItemHeaders = { "DocumentId", "Ordinal", "Product", "Quantity", "Price", "TaxRate" };

    public DocumentImportService(IDocumentRepository repository)
    {
        _repository = repository;
    }

    public async Task<ImportResultDto> ImportAsync(string documentsPath, string itemsPath)
    {
        var documentLines = await File.ReadAllLinesAsync(documentsPath);
        var itemLines = await File.ReadAllLinesAsync(itemsPath);

        return await ProcessImportAsync(documentLines, itemLines);
    }

    public async Task<ImportResultDto> ImportAsync(Stream documentsStream, Stream itemsStream)
    {
        using var documentReader = new StreamReader(documentsStream);
        using var itemReader = new StreamReader(itemsStream);

        var documentContent = await documentReader.ReadToEndAsync();
        var itemContent = await itemReader.ReadToEndAsync();

        var documentLines = documentContent.Split(new[] { "\r\n", "\r", "\n" }, StringSplitOptions.None);
        var itemLines = itemContent.Split(new[] { "\r\n", "\r", "\n" }, StringSplitOptions.None);

        return await ProcessImportAsync(documentLines, itemLines);
    }

    private async Task<ImportResultDto> ProcessImportAsync(string[] documentLines, string[] itemLines)
    {
        var validationErrors = new List<string>();

        ValidateHeaders(documentLines, DocumentHeaders, "Documents", validationErrors);
        ValidateHeaders(itemLines, ItemHeaders, "Items", validationErrors);

        if (validationErrors.Count > 0)
        {
            throw new ValidationException($"CSV validation failed:\n{string.Join("\n", validationErrors)}");
        }

        var documents = new List<Document>();

        int documentLineNumber = 1;
        foreach (var line in documentLines.Skip(1).Where(l => !string.IsNullOrWhiteSpace(l)))
        {
            documentLineNumber++;
            var parts = line.Split(';');
            
            if (parts.Length != 6)
            {
                validationErrors.Add($"Documents.csv line {documentLineNumber}: Expected 6 columns, got {parts.Length}. Line content: {line}");
                continue;
            }

            try
            {
                var document = new Document
                {
                    Id        = int.Parse(parts[0].Trim()),
                    Type      = parts[1].Trim(),
                    Date      = DateTime.ParseExact(parts[2].Trim(), "yyyy-MM-dd", CultureInfo.InvariantCulture),
                    FirstName = parts[3].Trim(),
                    LastName  = parts[4].Trim(),
                    City      = parts[5].Trim()
                };
                documents.Add(document);
            }
            catch (FormatException ex)
            {
                validationErrors.Add($"Documents.csv line {documentLineNumber}: Invalid data format. {ex.Message}. Line content: {line}");
            }
            catch (OverflowException ex)
            {
                validationErrors.Add($"Documents.csv line {documentLineNumber}: Number out of range. {ex.Message}. Line content: {line}");
            }
            catch (Exception ex)
            {
                validationErrors.Add($"Documents.csv line {documentLineNumber}: {ex.Message}. Line content: {line}");
            }
        }

        int itemLineNumber = 1;
        foreach (var line in itemLines.Skip(1).Where(l => !string.IsNullOrWhiteSpace(l)))
        {
            itemLineNumber++;
            var parts = line.Split(';');
            
            if (parts.Length != 6)
            {
                validationErrors.Add($"DocumentItems.csv line {itemLineNumber}: Expected 6 columns, got {parts.Length}. Line content: {line}");
                continue;
            }

            try
            {
                int documentId = int.Parse(parts[0].Trim());
                var doc = documents.FirstOrDefault(d => d.Id == documentId);
                
                if (doc == null)
                {
                    validationErrors.Add($"DocumentItems.csv line {itemLineNumber}: Document with ID {documentId} not found. Line content: {line}");
                    continue;
                }

                var item = new DocumentItem
                {
                    DocumentId = documentId,
                    Ordinal    = int.Parse(parts[1].Trim()),
                    Product    = parts[2].Trim(),
                    Quantity   = int.Parse(parts[3].Trim()),
                    Price      = decimal.Parse(parts[4].Trim(), _csvCulture),
                    TaxRate    = decimal.Parse(parts[5].Trim(), _csvCulture)
                };

                doc.Items.Add(item);
            }
            catch (FormatException ex)
            {
                validationErrors.Add($"DocumentItems.csv line {itemLineNumber}: Invalid data format. {ex.Message}. Line content: {line}");
            }
            catch (OverflowException ex)
            {
                validationErrors.Add($"DocumentItems.csv line {itemLineNumber}: Number out of range. {ex.Message}. Line content: {line}");
            }
            catch (Exception ex)
            {
                validationErrors.Add($"DocumentItems.csv line {itemLineNumber}: {ex.Message}. Line content: {line}");
            }
        }

        if (validationErrors.Count > 0)
        {
            throw new ValidationException($"CSV validation failed with {validationErrors.Count} error(s):\n{string.Join("\n", validationErrors)}");
        }

        // Count duplicates before upsert
        var existingDocs = await _repository.GetAllAsync();
        var existingIds = existingDocs.Select(d => d.Id).ToHashSet();
        var newRecords = documents.Count(d => !existingIds.Contains(d.Id));
        var duplicateRecords = documents.Count - newRecords;

        await _repository.UpsertRangeAsync(documents);

        return new ImportResultDto
        {
            TotalRecords = documents.Count,
            NewRecords = newRecords,
            DuplicateRecords = duplicateRecords,
            Message = BuildMessage(documents.Count, newRecords, duplicateRecords)
        };
    }

    private string BuildMessage(int total, int newRecords, int duplicates)
    {
        var parts = new List<string>();
        
        if (newRecords > 0)
            parts.Add($"{newRecords} new records added");
        
        if (duplicates > 0)
            parts.Add($"{duplicates} records already exist in database");

        if (parts.Count == 0)
            return "No records to import";

        return string.Join(", ", parts);
    }

    private void ValidateHeaders(string[] lines, string[] expectedHeaders, string fileName, List<string> validationErrors)
    {
        if (lines.Length == 0)
        {
            validationErrors.Add($"{fileName}.csv is empty");
            return;
        }

        var actualHeaders = lines[0].Split(';').Select(h => h.Trim()).ToArray();

        if (actualHeaders.Length != expectedHeaders.Length)
        {
            validationErrors.Add($"{fileName}.csv: Expected {expectedHeaders.Length} columns, got {actualHeaders.Length}");
            return;
        }

        for (int i = 0; i < expectedHeaders.Length; i++)
        {
            if (!actualHeaders[i].Equals(expectedHeaders[i], StringComparison.OrdinalIgnoreCase))
            {
                validationErrors.Add($"{fileName}.csv column {i + 1}: Expected '{expectedHeaders[i]}', got '{actualHeaders[i]}'");
            }
        }
    }
}