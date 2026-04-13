interface Props {
  success: string | null;
  importError: string | null;
  onDismiss: () => void;
}

export function NotificationToasts({
  success,
  importError,
  onDismiss,
}: Props) {
  return (
    <>
      {success && (
        <div 
          className="toast toast-success" 
          onClick={onDismiss} 
          style={{ cursor: 'pointer' }}
        >
          {success}
        </div>
      )}
      {importError && (
        <div 
          className="toast toast-error" 
          onClick={onDismiss} 
          style={{ cursor: 'pointer' }}
        >
          {importError}
        </div>
      )}
    </>
  );
}
