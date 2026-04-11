using System.ComponentModel.DataAnnotations;

namespace DocumentApp.Application.DTOs;

public class PaginationFilterDto : IValidatableObject
{
    private const int MaxPageSize = 100;
    private int _pageSize = 10;

    [Range(1, int.MaxValue, ErrorMessage = "Page number must be greater than 0")]
    public int PageNumber { get; set; } = 1;

    public int PageSize
    {
        get => _pageSize;
        set => _pageSize = value > MaxPageSize ? MaxPageSize : value;
    }

    [StringLength(100, ErrorMessage = "Type cannot exceed 100 characters")]
    public string? Type { get; set; }

    [StringLength(100, ErrorMessage = "FirstName cannot exceed 100 characters")]
    public string? FirstName { get; set; }

    [StringLength(100, ErrorMessage = "LastName cannot exceed 100 characters")]
    public string? LastName { get; set; }

    [StringLength(100, ErrorMessage = "City cannot exceed 100 characters")]
    public string? City { get; set; }

    public DateTime? DateFrom { get; set; }
    public DateTime? DateTo { get; set; }

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (DateFrom.HasValue && DateTo.HasValue && DateFrom > DateTo)
        {
            yield return new ValidationResult("DateFrom cannot be greater than DateTo", new[] { nameof(DateFrom) });
        }

        if (PageSize < 1)
        {
            yield return new ValidationResult("PageSize must be at least 1", new[] { nameof(PageSize) });
        }
    }
}

