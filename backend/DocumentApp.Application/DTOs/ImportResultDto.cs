namespace DocumentApp.Application.DTOs;

public class ImportResultDto
{
    public int TotalRecords { get; set; }
    public int NewRecords { get; set; }
    public int DuplicateRecords { get; set; }
    public string Message { get; set; } = string.Empty;
}
