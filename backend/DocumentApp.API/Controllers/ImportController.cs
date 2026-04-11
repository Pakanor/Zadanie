using Microsoft.AspNetCore.Mvc;
using DocumentApp.Application.Services;
using DocumentApp.Application.Exceptions;

namespace DocumentApp.API.Controllers;

[ApiController]
[Route("api/import")]
public class ImportController : ControllerBase
{
    private readonly DocumentImportService _service;
    private readonly ILogger<ImportController> _logger;

    public ImportController(DocumentImportService service, ILogger<ImportController> logger)
    {
        _service = service;
        _logger = logger;
    }

    [HttpPost]
    public async Task<IActionResult> Import()
    {
        try
        {
            var basePath = Path.Combine(Directory.GetCurrentDirectory(), "Data");

            var documentsPath = Path.Combine(basePath, "Documensts.csv");
            var itemsPath = Path.Combine(basePath, "DocumentItems.csv");

           if (!System.IO.File.Exists(documentsPath))
            throw new ImportException($"Documents file not found at: {documentsPath}");

        if (!System.IO.File.Exists(itemsPath))
            throw new ImportException($"Items file not found at: {itemsPath}");

            _logger.LogInformation("Starting import from CSV files...");
            await _service.ImportAsync(documentsPath, itemsPath);
            _logger.LogInformation("Import completed successfully");

            return Ok(new { message = "Data imported successfully" });
        }
        catch (ImportException ex)
        {
            _logger.LogError($"Import error: {ex.Message}");
            throw;
        }
        catch (Exception ex)
        {
            _logger.LogError($"Unexpected error during import: {ex.Message}\n{ex.StackTrace}");
            throw new ImportException("An error occurred during import process", ex);
        }
    }
}
