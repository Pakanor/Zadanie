using DocumentApp.Application.DTOs;

namespace DocumentApp.Application.Interfaces;


public interface IDocumentService
{
   
    Task<PaginationResponseDto<DocumentDto>> GetPaginatedAsync(PaginationFilterDto filter);
    Task<DocumentDetailsDto?> GetByIdAsync(int id);
}
