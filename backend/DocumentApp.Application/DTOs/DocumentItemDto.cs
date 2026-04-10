namespace DocumentApp.Application.DTOs;

public class DocumentItemDto
{
    public int Ordinal { get; set; }
    public string Product { get; set; } = null!;
    public decimal Quantity { get; set; }
    public decimal Price { get; set; }
    public decimal TaxRate { get; set; }
}