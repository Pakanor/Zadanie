using Microsoft.AspNetCore.Mvc;
using DocumentApp.Application.Services;
using DocumentApp.Application.Exceptions;
using DocumentApp.Infrastructure.Persistence;

namespace DocumentApp.API.Controllers;

[ApiController]
[Route("api/import")]
public class ImportController : ControllerBase
{
    private readonly DocumentImportService _service;
    private readonly AppDbContext _dbContext;
    private readonly ILogger<ImportController> _logger;

    public ImportController(DocumentImportService service, AppDbContext dbContext, ILogger<ImportController> logger)
    {
        _service = service;
        _dbContext = dbContext;
        _logger = logger;
    }

    [HttpPost("upload")]
    public async Task<IActionResult> ImportFromFiles()
    {
        try
        {
            var documentsFile = Request.Form.Files.GetFile("documents");
            var itemsFile = Request.Form.Files.GetFile("items");

            if (documentsFile == null || documentsFile.Length == 0)
                throw new ImportException("Documents file is required");

            if (itemsFile == null || itemsFile.Length == 0)
                throw new ImportException("Items file is required");

            if (!documentsFile.FileName.EndsWith(".csv", StringComparison.OrdinalIgnoreCase))
                throw new ImportException("Documents file must be a CSV file");

            if (!itemsFile.FileName.EndsWith(".csv", StringComparison.OrdinalIgnoreCase))
                throw new ImportException("Items file must be a CSV file");

            const long maxFileSize = 10 * 1024 * 1024; 
            if (documentsFile.Length > maxFileSize)
                throw new ImportException("Documents file is too large (max 10 MB)");

            if (itemsFile.Length > maxFileSize)
                throw new ImportException("Items file is too large (max 10 MB)");

            _logger.LogInformation($"Starting import from uploaded files: {documentsFile.FileName}, {itemsFile.FileName}");
            
            var result = await _service.ImportAsync(documentsFile.OpenReadStream(), itemsFile.OpenReadStream());
            
            _logger.LogInformation("Import completed successfully");

            return Ok(new { message = result.Message, totalRecords = result.TotalRecords, newRecords = result.NewRecords, duplicateRecords = result.DuplicateRecords });
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

    [HttpDelete("database")]
    public async Task<IActionResult> DeleteDatabase()
    {
        try
        {
            var adminToken = Request.Headers["X-Admin-Token"].ToString();
            /*
            w normalnych warunkach nie powinno być endpointu do usuwania bazy danych, ale na potrzeby 
            tego zadania dodajemy go z prostą formą zabezpieczenia 
            w prawdziwej aplikacji użyłbym autoryzacji opartej na rolach lub innego mechanizmu uwierzytelniania
            
            */

            const string expectedToken = "Rekrutacja"; 
            
            if (string.IsNullOrEmpty(adminToken) || adminToken != expectedToken)
            {
                _logger.LogWarning("Unauthorized database deletion attempt");
                return Forbid();
            }

            _logger.LogWarning("Admin initiated database deletion");
            
            await _dbContext.Database.EnsureDeletedAsync();
            await _dbContext.Database.EnsureCreatedAsync();
            
            _logger.LogInformation("Database successfully deleted and recreated");
            
            return Ok(new { message = "Database has been reset successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error deleting database: {ex.Message}");
            throw;
        }
    }
}
