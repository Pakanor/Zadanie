import type { DocumentFilter } from '../types';

interface Props {
  filter: DocumentFilter;
  onUpdate: (updates: Partial<DocumentFilter>) => void;
  onClear: () => void;
}

export function DocumentFilters({ filter, onUpdate, onClear }: Props) {
  return (
    <section className="filters">
      <div className="filter-row">
        <div className="filter-group">
          <label>Type</label>
          <select value={filter.type ?? ''} onChange={e => onUpdate({ type: e.target.value || undefined })}>
            <option value="">All</option>
            <option value="Invoice">Invoice</option>
            <option value="Order">Order</option>
            <option value="Receipt">Receipt</option>
          </select>
        </div>
        <div className="filter-group">
          <label>First Name</label>
          <input type="text" placeholder="Search..." value={filter.firstName ?? ''}
            onChange={e => onUpdate({ firstName: e.target.value || undefined })} />
        </div>
        <div className="filter-group">
          <label>Last Name</label>
          <input type="text" placeholder="Search..." value={filter.lastName ?? ''}
            onChange={e => onUpdate({ lastName: e.target.value || undefined })} />
        </div>
        <div className="filter-group">
          <label>City</label>
          <input type="text" placeholder="Search..." value={filter.city ?? ''}
            onChange={e => onUpdate({ city: e.target.value || undefined })} />
        </div>
        <div className="filter-group">
          <label>Date From</label>
          <input type="date" value={filter.dateFrom ?? ''}
            onChange={e => onUpdate({ dateFrom: e.target.value || undefined })} />
        </div>
        <div className="filter-group">
          <label>Date To</label>
          <input type="date" value={filter.dateTo ?? ''}
            onChange={e => onUpdate({ dateTo: e.target.value || undefined })} />
        </div>
        <button className="clear-btn" onClick={onClear}>Clear</button>
      </div>
    </section>
  );
}
