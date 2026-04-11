import { useState, useRef } from 'react';
import { useDocuments, DEFAULT_FILTER } from './hooks/useDocuments';
import { useDocumentDetail } from './hooks/useDocumentDetail';
import { useImport } from './hooks/useImport';
import { DocumentFilters } from './components/DocumentFilters';
import { DocumentTable } from './components/DocumentTable';
import { DocumentModal } from './components/DocumentModal';
import { Pagination } from './components/Pagination';
import type { Document } from './types';

export default function App() {
  const { data, filter, loading, error, updateFilter, setPage, refresh } = useDocuments();
  const { document: detail, loading: detailLoading, fetch: fetchDetail, clear } = useDocumentDetail();
  const { loading: importing, success, error: importError, runImport, reset } = useImport();
  const [modalOpen, setModalOpen] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [adminToken, setAdminToken] = useState<string>('');
  const [showAdminInput, setShowAdminInput] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [documentsFile, setDocumentsFile] = useState<File | null>(null);
  const [itemsFile, setItemsFile] = useState<File | null>(null);
  const [importStep, setImportStep] = useState<'idle' | 'documents' | 'items'>('idle');
  const documentsInputRef = useRef<HTMLInputElement>(null);
  const itemsInputRef = useRef<HTMLInputElement>(null);

  const handleRowClick = async (doc: Document) => {
    setModalOpen(true);
    await fetchDetail(doc.id);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    clear();
  };

  const handleImportStart = () => {
    setFileError(null);
    setDocumentsFile(null);
    setItemsFile(null);
    setImportStep('documents');
    documentsInputRef.current?.click();
  };

  const handleDocumentsFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.includes('Documents') || !file.name.endsWith('.csv')) {
      setFileError('Invalid Documents.csv file');
      return;
    }

    setFileError(null);
    setDocumentsFile(file);
    setImportStep('items');
    if (documentsInputRef.current) {
      documentsInputRef.current.value = '';
    }
    setTimeout(() => itemsInputRef.current?.click(), 200);
  };

  const handleItemsFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.includes('DocumentItems') || !file.name.endsWith('.csv')) {
      setFileError('Invalid DocumentItems.csv file');
      if (itemsInputRef.current) {
        itemsInputRef.current.value = '';
      }
      setTimeout(() => itemsInputRef.current?.click(), 500);
      return;
    }

    setFileError(null);
    setItemsFile(file);
  };

  const handleImportExecute = async () => {
    if (!documentsFile || !itemsFile) return;

    await runImport(documentsFile, itemsFile);
    refresh();
    setImportStep('idle');
    setDocumentsFile(null);
    setItemsFile(null);

    if (documentsInputRef.current) documentsInputRef.current.value = '';
    if (itemsInputRef.current) itemsInputRef.current.value = '';
  };

  const handleSort = (field: string) => {
    if (filter.sortBy === field) {
      updateFilter({ sortDescending: !filter.sortDescending });
    } else {
      updateFilter({ sortBy: field, sortDescending: false });
    }
  };

  const handleDeleteDatabase = async () => {
    try {
      setDeleting(true);
      const response = await fetch('http://localhost:5172/api/import/database', {
        method: 'DELETE',
        headers: { 'X-Admin-Token': adminToken },
      });

      if (!response.ok) {
        throw new Error('Unauthorized admin access');
      }

      const data = await response.json();
      alert(data.message);
      refresh();
      setAdminToken('');
      setShowAdminInput(false);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Database deletion failed');
    } finally {
      setDeleting(false);
    }
  };

  const handleClearFilters = () => {
    updateFilter(DEFAULT_FILTER);
  };

  return (
    <div className="app">
      <input
        ref={documentsInputRef}
        type="file"
        accept=".csv"
        hidden
        onChange={handleDocumentsFileSelect}
        aria-label="Select Documents.csv file"
      />
      <input
        ref={itemsInputRef}
        type="file"
        accept=".csv"
        hidden
        onChange={handleItemsFileSelect}
        aria-label="Select DocumentItems.csv file"
      />
      <aside className="sidebar">
    
        <nav className="nav">
          <div className="nav-item"><span>▤</span> Documents</div>
        </nav>
        <div className="sidebar-footer">
          <div className="import-section">
            {importStep === 'idle' ? (
              <button 
                className={`import-btn ${importing || (documentsFile && itemsFile) ? 'importing' : ''}`} 
                onClick={documentsFile && itemsFile ? handleImportExecute : handleImportStart}
                disabled={importing}
              >
                {importing ? (
                  <><span className="spinner-sm" /> Importing...</>
                ) : documentsFile && itemsFile ? (
                  <><span>✓</span> Import</>
                ) : (
                  <><span>⇪</span> Import CSV</>
                )}
              </button>
            ) : (
              <>
                <div className="import-status-box">
                  {importStep === 'documents' ? (
                    '📄 Select Documents.csv'
                  ) : importStep === 'items' && !itemsFile ? (
                    <>
                      <div style={{ marginBottom: '8px' }}>✓ {documentsFile?.name}</div>
                      <div>📄 Now select DocumentItems.csv</div>
                    </>
                  ) : (
                    <>
                      <div style={{ marginBottom: '8px' }}>✓ {documentsFile?.name}</div>
                      <div>✓ {itemsFile?.name}</div>
                    </>
                  )}
                </div>
                <button
                  onClick={() => {
                    setImportStep('idle');
                    setDocumentsFile(null);
                    setItemsFile(null);
                    if (documentsInputRef.current) documentsInputRef.current.value = '';
                    if (itemsInputRef.current) itemsInputRef.current.value = '';
                  }}
                  className="import-cancel-btn"
                >
                  ✕ Cancel
                </button>
                {documentsFile && itemsFile && (
                  <button
                    onClick={handleImportExecute}
                    disabled={importing}
                    className="import-execute-btn"
                  >
                    {importing ? 'Importing...' : '🚀 Import now'}
                  </button>
                )}
              </>
            )}
          </div>

          <button 
            className="admin-btn"
            onClick={() => setShowAdminInput(!showAdminInput)}
            title="Administrator"
          >
            ⚙️ Admin
          </button>
          {showAdminInput && (
            <div className="admin-section">
              <input
                type="password"
                placeholder="Admin token..."
                value={adminToken}
                onChange={(e) => setAdminToken(e.target.value)}
                className="admin-input"
              />
              <button
                onClick={handleDeleteDatabase}
                disabled={deleting || !adminToken}
                className="admin-delete-btn"
              >
                {deleting ? 'Deleting...' : '🗑 Delete Database'}
              </button>
            </div>
          )}
          {fileError && <div className="toast toast-error" onClick={() => setFileError(null)}>✕ {fileError}</div>}
          {success && <div className="toast toast-success" onClick={reset}>✓ {success}</div>}
          {importError && <div className="toast toast-error" onClick={reset}>✕ {importError}</div>}
        </div>
      </aside>

      <main className="main">
        <header className="page-header">
          <h1 className="page-title">Documents</h1>
           <p className="page-subtitle">{data ? `${data.totalRecords} records` : '—'}</p>
        </header>

        <DocumentFilters filter={filter} onUpdate={updateFilter} onClear={handleClearFilters} />

        <section className="table-section">
          {loading ? (
            <div className="state-box"><div className="spinner" /><span>Loading data...</span></div>
          ) : error ? (
            <div className="state-box error">
              <span>⚠ {error}</span>
              <button className="retry-btn" onClick={refresh}>Try again</button>
            </div>
          ) : (
            <>
              <DocumentTable 
                documents={data?.data ?? []} 
                onRowClick={handleRowClick}
                sortBy={filter.sortBy}
                sortDescending={filter.sortDescending}
                onSort={handleSort}
              />
              {data && (
                <Pagination
                  data={data}
                  currentPage={filter.pageNumber}
                  pageSize={filter.pageSize}
                  onPageChange={setPage}
                  onPageSizeChange={size => updateFilter({ pageSize: size })}
                />
              )}
            </>
          )}
        </section>
      </main>

      {modalOpen && (
        <DocumentModal detail={detail} loading={detailLoading} onClose={handleCloseModal} />
      )}
    </div>
  );
}
