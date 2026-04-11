using Microsoft.AspNetCore.Mvc;
using DocumentApp.Application.Services;
using DocumentApp.Application.DTOs;
using DocumentApp.Application.Exceptions;

namespace DocumentApp.API.Controllers;

[ApiController]
[Route("api/documents")]
public class DocumentsController : ControllerBase
{
    private readonly DocumentService _service;
    private readonly ILogger<DocumentsController> _logger;

    public DocumentsController(DocumentService service, ILogger<DocumentsController> logger)
    {
        _service = service;
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? type, 
        [FromQuery] string? firstName, 
        [FromQuery] string? lastName, 
        [FromQuery] string? city, 
        [FromQuery] DateTime? dateFrom, 
        [FromQuery] DateTime? dateTo,
        [FromQuery] int pageNumber = 1, 
        [FromQuery] int pageSize = 10,
        [FromQuery] string? sortBy = null,
        [FromQuery] bool sortDescending = false)
    {
        try
        {
            var paginationFilter = new PaginationFilterDto
            {
                PageNumber = pageNumber,
                PageSize = pageSize,
                Type = type,
                FirstName = firstName,
                LastName = lastName,
                City = city,
                DateFrom = dateFrom,
                DateTo = dateTo,
                SortBy = sortBy,
                SortDescending = sortDescending
            };

            var validationContext = new System.ComponentModel.DataAnnotations.ValidationContext(paginationFilter);
            var validationResults = new List<System.ComponentModel.DataAnnotations.ValidationResult>();
            if (!System.ComponentModel.DataAnnotations.Validator.TryValidateObject(paginationFilter, validationContext, validationResults, validateAllProperties: true))
            {
                var errors = string.Join("; ", validationResults.Select(v => v.ErrorMessage));
                throw new ValidationException(errors);
            }

            var result = await _service.GetPaginatedAsync(paginationFilter);
            
            if (result.PageNumber > result.TotalPages)
            {
                throw new ValidationException($"Page number {result.PageNumber} exceeds total pages {result.TotalPages}");
            }
            
            _logger.LogInformation($"Retrieved documents - Page: {result.PageNumber}, Total: {result.TotalRecords}");
            return Ok(result);
        }
        catch (ValidationException)
        {
            throw;
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error retrieving documents: {ex.Message}");
            throw;
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        try
        {
            if (id <= 0)
                throw new ValidationException("Document ID must be greater than 0");

            var result = await _service.GetByIdAsync(id);
            
            if (result == null)
                throw new NotFoundException($"Document with ID {id} not found");

            _logger.LogInformation($"Retrieved document with ID: {id}");
            return Ok(result);
        }
        catch (NotFoundException)
        {
            throw;
        }
        catch (ValidationException)
        {
            throw;
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error retrieving document {id}: {ex.Message}");
            throw;
        }
    }
}