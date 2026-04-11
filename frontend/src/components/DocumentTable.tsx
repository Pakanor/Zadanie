import type { Document } from '../types';

interface Props {
  documents: Document[];
  onRowClick: (doc: Document) => void;
  sortBy?: string;
  sortDescending?: boolean;
  onSort?: (field: string) => void;
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US');
}

function getBadgeClass(type: string) {
  return { Invoice: 'badge-invoice', Order: 'badge-order', Receipt: 'badge-receipt' }[type] ?? 'badge-default';
}

interface SortableHeaderProps {
  label: string;
  field: string;
  sortBy?: string;
  sortDescending?: boolean;
  onSort?: (field: string) => void;
}

function SortableHeader({ label, field, sortBy, sortDescending, onSort }: SortableHeaderProps) {
  const isActive = sortBy === field;
  const sortIcon = isActive ? (sortDescending ? ' ↓' : ' ↑') : ' ⇅';
  
  return (
    <th onClick={() => onSort?.(field)} style={{ cursor: onSort ? 'pointer' : 'default', userSelect: 'none' }}>
      {label}{onSort && sortIcon}
    </th>
  );
}

export function DocumentTable({ documents, onRowClick, sortBy, sortDescending, onSort }: Props) {
  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <SortableHeader label="ID" field="Id" sortBy={sortBy} sortDescending={sortDescending} onSort={onSort} />
            <SortableHeader label="Type" field="Type" sortBy={sortBy} sortDescending={sortDescending} onSort={onSort} />
            <SortableHeader label="Date" field="Date" sortBy={sortBy} sortDescending={sortDescending} onSort={onSort} />
            <SortableHeader label="First Name" field="FirstName" sortBy={sortBy} sortDescending={sortDescending} onSort={onSort} />
            <SortableHeader label="Last Name" field="LastName" sortBy={sortBy} sortDescending={sortDescending} onSort={onSort} />
            <SortableHeader label="City" field="City" sortBy={sortBy} sortDescending={sortDescending} onSort={onSort} />
            <th>Items</th>
          </tr>
        </thead>
        <tbody>
          {documents.length === 0 ? (
            <tr className="empty-row">
              <td colSpan={7}>No documents matching criteria</td>
            </tr>
          ) : documents.map(doc => (
            <tr key={doc.id} onClick={() => onRowClick(doc)}>
              <td className="id-cell">{doc.id}</td>
              <td><span className={`badge ${getBadgeClass(doc.type)}`}>{doc.type}</span></td>
              <td className="date-cell">{formatDate(doc.date)}</td>
              <td>{doc.firstName}</td>
              <td>{doc.lastName}</td>
              <td>{doc.city}</td>
              <td className="count-cell">{doc.itemsCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
