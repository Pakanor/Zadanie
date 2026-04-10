namespace DocumentApp.Domain.Entities;

public class Document
{
    public int Id { get; set; }

    public string Type { get; set; } = null!;
    public DateTime Date { get; set; }

    public string FirstName { get; set; } = null!;
    public string LastName { get; set; } = null!;
    public string City { get; set; } = null!;

    public List<DocumentItem> Items { get; set; } = new();
}