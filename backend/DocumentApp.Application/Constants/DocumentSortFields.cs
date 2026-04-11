namespace DocumentApp.Application.Constants;


public static class DocumentSortFields
{
    public const string Id = "Id";
    public const string Date = "Date";
    public const string Type = "Type";
    public const string FirstName = "FirstName";
    public const string LastName = "LastName";
    public const string City = "City";


    public static readonly HashSet<string> AllowedFields = new(StringComparer.OrdinalIgnoreCase)
    {
        Id,
        Date,
        Type,
        FirstName,
        LastName,
        City
    };


    public static bool IsAllowed(string? sortBy) => 
        !string.IsNullOrWhiteSpace(sortBy) && AllowedFields.Contains(sortBy);

   
    public const string DefaultSortField = Id;


    public const bool DefaultSortDescending = false;
}
