import type { Document, PaginationResponse, DocumentFilter } from '../types';
import { DocumentFilters } from './DocumentFilters';
import { DocumentTable } from './DocumentTable';
import { Pagination } from './Pagination';

interface Props {
  data: PaginationResponse<Document> | null;
  filter: DocumentFilter;
  loading: boolean;
  error: string | null;
  onUpdateFilter: (updates: Partial<DocumentFilter>) => void;
  onSetPage: (page: number) => void;
  onClearFilters: () => void;
  onRowClick: (doc: Document) => void;
  onSort: (field: string) => void;
  onRetry: () => void;
}

export function DocumentsContent({
  data,
  filter,
  loading,
  error,
  onUpdateFilter,
  onSetPage,
  onClearFilters,
  onRowClick,
  onSort,
  onRetry,
}: Props) {
  return (
    <main className="main">
      <header className="page-header">
        <h1 className="page-title">Documents</h1>
        <p className="page-subtitle">{data ? `${data.totalRecords} records` : '—'}</p>
      </header>

      <DocumentFilters 
        filter={filter} 
        onUpdate={onUpdateFilter} 
        onClear={onClearFilters} 
      />

      <section className="table-section">
        {loading ? (
          <div className="state-box"><div className="spinner" /><span>Loading data...</span></div>
        ) : error ? (
          <div className="state-box error">
            <span>{error}</span>
            <button className="retry-btn" onClick={onRetry}>Try again</button>
          </div>
        ) : (
          <>
            <DocumentTable 
              documents={data?.data ?? []} 
              onRowClick={onRowClick}
              sortBy={filter.sortBy}
              sortDescending={filter.sortDescending}
              onSort={onSort}
            />
            {data && (
              <Pagination
                data={data}
                currentPage={filter.pageNumber}
                pageSize={filter.pageSize}
                onPageChange={onSetPage}
                onPageSizeChange={size => onUpdateFilter({ pageSize: size })}
              />
            )}
          </>
        )}
      </section>
    </main>
  );
}
