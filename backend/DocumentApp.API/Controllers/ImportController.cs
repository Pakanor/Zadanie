using Microsoft.AspNetCore.Mvc;
using DocumentApp.Application.Services;

namespace DocumentApp.API.Controllers;

[ApiController]
[Route("api/import")]
public class ImportController : ControllerBase
{
    private readonly DocumentImportService _service;

    public ImportController(DocumentImportService service)
    {
        _service = service;
    }

    [HttpPost]
    public async Task<IActionResult> Import()
{
    var basePath = Path.Combine(Directory.GetCurrentDirectory(), "Data");

    var documentsPath = Path.Combine(basePath, "Documents.csv");
    var itemsPath = Path.Combine(basePath, "DocumentItems.csv");

    await _service.ImportAsync(documentsPath, itemsPath);

    return Ok();
}


}