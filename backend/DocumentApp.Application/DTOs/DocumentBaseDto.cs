using System.ComponentModel.DataAnnotations;

namespace DocumentApp.Application.DTOs;

public class DocumentBaseDto
{
    public int Id { get; set; }

    [Required(ErrorMessage = "Type is required")]
    [StringLength(50, MinimumLength = 1, ErrorMessage = "Type must be between 1 and 50 characters")]
    public string Type { get; set; } = null!;

    public DateTime Date { get; set; }

    [Required(ErrorMessage = "FirstName is required")]
    [StringLength(100, MinimumLength = 1, ErrorMessage = "FirstName must be between 1 and 100 characters")]
    public string FirstName { get; set; } = null!;

    [Required(ErrorMessage = "LastName is required")]
    [StringLength(100, MinimumLength = 1, ErrorMessage = "LastName must be between 1 and 100 characters")]
    public string LastName { get; set; } = null!;

    [Required(ErrorMessage = "City is required")]
    [StringLength(100, MinimumLength = 1, ErrorMessage = "City must be between 1 and 100 characters")]
    public string City { get; set; } = null!;
}