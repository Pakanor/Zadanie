namespace DocumentApp.Application.Exceptions;

public class ApplicationException : Exception
{
    public ApplicationException(string message) : base(message) { }
    public ApplicationException(string message, Exception innerException) : base(message, innerException) { }
}

public class NotFoundException : ApplicationException
{
    public NotFoundException(string message) : base(message) { }
}

public class ValidationException : ApplicationException
{
    public ValidationException(string message) : base(message) { }
}

public class ImportException : ApplicationException
{
    public ImportException(string message) : base(message) { }
    public ImportException(string message, Exception innerException) : base(message, innerException) { }
}
