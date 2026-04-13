import { useState, useRef, useEffect } from 'react';
import { useDocuments, DEFAULT_FILTER } from './hooks/useDocuments';
import { useDocumentDetail } from './hooks/useDocumentDetail';
import { useImport } from './hooks/useImport';
import { ImportSection } from './components/ImportSection';
import { AdminSection } from './components/AdminSection';
import { NotificationToasts } from './components/NotificationToasts';
import { DocumentsContent } from './components/DocumentsContent';
import { DocumentModal } from './components/DocumentModal';
import type { Document } from './types';

export default function App() {
  const { data, filter, loading, error, updateFilter, setPage, refresh } = useDocuments();
  const { document: detail, loading: detailLoading, fetch: fetchDetail, clear } = useDocumentDetail();
  const { loading: importing, success, error: importError, runImport, reset } = useImport();

  const [modalOpen, setModalOpen] = useState(false);
  const [adminToken, setAdminToken] = useState<string>('');
  const [showAdminInput, setShowAdminInput] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [documentsFile, setDocumentsFile] = useState<File | null>(null);
  const [itemsFile, setItemsFile] = useState<File | null>(null);
  const [importStep, setImportStep] = useState<'idle' | 'documents' | 'items'>('idle');
  const [fileError, setFileError] = useState<string | null>(null);
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

  const handleSort = (field: string) => {
    if (filter.sortBy === field) {
      updateFilter({ sortDescending: !filter.sortDescending });
    } else {
      updateFilter({ sortBy: field, sortDescending: false });
    }
  };

  const handleClearFilters = () => {
    updateFilter(DEFAULT_FILTER);
  };

  const resetImport = () => {
    setImportStep('idle');
    setDocumentsFile(null);
    setItemsFile(null);
    setFileError(null);
    if (documentsInputRef.current) documentsInputRef.current.value = '';
    if (itemsInputRef.current) itemsInputRef.current.value = '';
  };

  const handleImportStart = () => {
    setFileError(null);
    setDocumentsFile(null);
    setItemsFile(null);
    setImportStep('documents');
  };

  const handleDocumentsFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    e.target.value = '';

    if (!file) {
      setImportStep('idle');
      return;
    }

    if (!file.name.includes('Documents') || !file.name.endsWith('.csv')) {
      setFileError('Invalid file! Must be named Documents.csv');
      return;
    }

    setFileError(null);
    setDocumentsFile(file);
    setImportStep('items');
  };



  const handleItemsFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    e.target.value = '';

    if (!file) {
      resetImport();
      return;
    }

    if (!file.name.includes('DocumentItems') || !file.name.endsWith('.csv')) {
      setFileError('Invalid file! Must be named DocumentItems.csv');
      return;
    }

    setFileError(null);
    setItemsFile(file);
  };

  const handleImportExecute = async () => {
    if (!documentsFile || !itemsFile) return;
    await runImport(documentsFile, itemsFile);
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



  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        reset();
        refresh();
        resetImport();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [success, reset, refresh]);

  useEffect(() => {
    if (importError) {
      const timer = setTimeout(() => {
        reset();
        resetImport();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [importError, reset]);



  return (
    <div className="app">
      <aside className="sidebar">
        <nav className="nav">
          <div className="nav-item"><span>▤</span> Documents</div>
        </nav>
        <div className="sidebar-footer">
          <ImportSection
              importStep={importStep}
              documentsFile={documentsFile}
              itemsFile={itemsFile}
              importing={importing}
              fileError={fileError}
              onImportStart={handleImportStart}
              onDocumentsFileSelect={handleDocumentsFileSelect}
              onItemsFileSelect={handleItemsFileSelect}
              onImportExecute={handleImportExecute}
              onCancelImport={resetImport}
              onClearFileError={() => setFileError(null)}
          />

          <AdminSection
              showAdminInput={showAdminInput}
              adminToken={adminToken}
              deleting={deleting}
              onToggleAdminInput={() => setShowAdminInput(!showAdminInput)}
              onAdminTokenChange={setAdminToken}
              onDeleteDatabase={handleDeleteDatabase}
          />

          <NotificationToasts
            success={success}
            importError={importError}
            onDismiss={() => {
              reset();
              resetImport();
            }}
          />
        </div>
      </aside>

      <DocumentsContent
        data={data}
        filter={filter}
        loading={loading}
        error={error}
        onUpdateFilter={updateFilter}
        onSetPage={setPage}
        onClearFilters={handleClearFilters}
        onRowClick={handleRowClick}
        onSort={handleSort}
        onRetry={refresh}
      />

      {modalOpen && (
        <DocumentModal detail={detail} loading={detailLoading} onClose={handleCloseModal} />
      )}
    </div>
  );
}
