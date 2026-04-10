namespace DocumentApp.Application.DTOs;

public class DocumentDetailsDto : DocumentBaseDto
{
    public List<DocumentItemDto> Items { get; set; } = [];
}