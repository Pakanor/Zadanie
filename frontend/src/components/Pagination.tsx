import type { PaginationResponse } from '../types';
import type { Document } from '../types';

interface Props {
  data: PaginationResponse<Document>;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export function Pagination({ data, currentPage, pageSize, onPageChange, onPageSizeChange }: Props) {
  if (data.totalPages <= 1) return null;

  const pages = Array.from({ length: Math.min(data.totalPages, 7) }, (_, i) => i + 1);

  return (
    <div className="pagination">
      <button className="page-btn" onClick={() => onPageChange(currentPage - 1)} disabled={!data.hasPreviousPage}>←</button>
      <div className="page-numbers">
        {pages.map(p => (
          <button key={p} className={`page-num ${currentPage === p ? 'active' : ''}`} onClick={() => onPageChange(p)}>{p}</button>
        ))}
        {data.totalPages > 7 && <span className="page-ellipsis">...</span>}
      </div>
      <button className="page-btn" onClick={() => onPageChange(currentPage + 1)} disabled={!data.hasNextPage}>→</button>
      <span className="page-info">Page {data.pageNumber} of {data.totalPages}</span>
      <select className="page-size-select" value={pageSize} onChange={e => onPageSizeChange(Number(e.target.value))}>
        {[10, 20, 50, 100].map(s => <option key={s} value={s}>{s} / page</option>)}
      </select>
    </div>
  );
}
