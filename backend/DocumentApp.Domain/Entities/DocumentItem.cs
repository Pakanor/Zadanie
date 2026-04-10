namespace DocumentApp.Domain.Entities;

public class DocumentItem
{
    public int Id { get; set; }

    public int DocumentId { get; set; }
    public Document Document { get; set; } = null!;

    public int Ordinal { get; set; }

    public string Product { get; set; } = null!;

    public decimal Quantity { get; set; }
    public decimal Price { get; set; }
    public decimal TaxRate { get; set; }
}