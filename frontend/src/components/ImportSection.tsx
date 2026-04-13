import { useRef, useEffect } from 'react';

interface Props {
  importStep: 'idle' | 'documents' | 'items';
  documentsFile: File | null;
  itemsFile: File | null;
  importing: boolean;
  fileError: string | null;
  onImportStart: () => void;
  onDocumentsFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onItemsFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onImportExecute: () => void;
  onCancelImport: () => void;
  onClearFileError: () => void;
}

export function ImportSection({
  importStep,
  documentsFile,
  itemsFile,
  importing,
  fileError,
  onImportStart,
  onDocumentsFileSelect,
  onItemsFileSelect,
  onImportExecute,
  onCancelImport,
  onClearFileError,
}: Props) {
  const documentsInputRef = useRef<HTMLInputElement>(null);
  const itemsInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (fileError) {
      const timer = setTimeout(() => {
        onClearFileError();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [fileError, onClearFileError]);

  useEffect(() => {
    if (importStep === 'items' && documentsFile && !itemsFile) {
      setTimeout(() => {
        itemsInputRef.current?.click();
      }, 100);
    }
  }, [importStep, documentsFile, itemsFile]);

  return (
    <>
      <input
        ref={documentsInputRef}
        type="file"
        accept=".csv"
        hidden
        onChange={onDocumentsFileSelect}
        aria-label="Select Documents.csv file"
      />
      <input
        ref={itemsInputRef}
        type="file"
        accept=".csv"
        hidden
        onChange={onItemsFileSelect}
        aria-label="Select DocumentItems.csv file"
      />

      <div className="import-section">
        {importStep === 'idle' ? (
          <button 
            className={`import-btn ${importing || (documentsFile && itemsFile) ? 'importing' : ''}`} 
            onClick={documentsFile && itemsFile ? onImportExecute : () => {
              onImportStart();
              documentsInputRef.current?.click();
            }}
            disabled={importing}
          >
            {importing ? (
              <><span className="spinner-sm" /> Importing...</>
            ) : documentsFile && itemsFile ? (
              <>Import</>
            ) : (
              <>Import CSV</>
            )}
          </button>
        ) : (
          <>
            <div className="import-status-box">
              {importStep === 'documents' ? (
                'Select Documents.csv'
              ) : importStep === 'items' && !itemsFile ? (
                <>
                  <div style={{ marginBottom: '8px' }}>{documentsFile?.name}</div>
                  <div>Now select DocumentItems.csv</div>
                </>
              ) : (
                <>
                  <div style={{ marginBottom: '8px' }}>{documentsFile?.name}</div>
                  <div>{itemsFile?.name}</div>
                </>
              )}
            </div>
            <button
              onClick={onCancelImport}
              className="import-cancel-btn"
            >
              Cancel
            </button>
            {documentsFile && itemsFile && (
              <button
                onClick={onImportExecute}
                disabled={importing}
                className="import-execute-btn"
              >
                {importing ? 'Importing...' : 'Import now'}
              </button>
            )}
          </>
        )}
      </div>

      {fileError && (
        <div 
          className="toast toast-error" 
          onClick={onClearFileError} 
          style={{ cursor: 'pointer' }}
        >
          {fileError}
        </div>
      )}
    </>
  );
}
