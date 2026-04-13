import type { DocumentDetails } from '../types';

interface Props {
  detail: DocumentDetails | null;
  loading: boolean;
  onClose: () => void;
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US');
}

function formatCurrency(v: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v);
}

function getBadgeClass(type: string) {
  return { Invoice: 'badge-invoice', Order: 'badge-order', Receipt: 'badge-receipt' }[type] ?? 'badge-default';
}

export function DocumentModal({ detail, loading, onClose }: Props) {
  const total = detail?.items.reduce((s, i) => s + i.price * i.quantity, 0) ?? 0;

  return (
    <div className="modal-overlay open" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <button className="modal-close" onClick={onClose}>X</button>
        {loading && (
          <div className="modal-loading"><div className="spinner" /></div>
        )}
        {!loading && detail && (
          <>
            <div className="modal-header">
              <div className="modal-title-row">
                <h2 className="modal-title\">Document #{detail.id}</h2>
                <span className={`badge ${getBadgeClass(detail.type)}`}>{detail.type}</span>
              </div>
              <p className="modal-date">{formatDate(detail.date)}</p>
            </div>
            <div className="modal-info">
              <div className="info-card">
                <span className="info-label">Customer</span>
                <span className="info-value">{detail.firstName} {detail.lastName}</span>
              </div>
              <div className="info-card">
                <span className="info-label">City</span>
                <span className="info-value">{detail.city}</span>
              </div>
              <div className="info-card">
                <span className="info-label">Items</span>
                <span className="info-value">{detail.items.length}</span>
              </div>
              <div className="info-card">
                <span className="info-label">Total</span>
                <span className="info-value highlight">{formatCurrency(total)}</span>
              </div>
            </div>
            <div className="modal-items">
              <h3 className="items-title">Document Items</h3>
              <table className="items-table">
                <thead>
                  <tr>
                    <th>No.</th><th>Product</th><th>Qty</th><th>Price</th><th>Tax</th><th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {detail.items.map(item => (
                    <tr key={item.ordinal}>
                      <td>{item.ordinal}</td>
                      <td className="product-cell">{item.product}</td>
                      <td>{item.quantity}</td>
                      <td>{formatCurrency(item.price)}</td>
                      <td>{item.taxRate}%</td>
                      <td className="value-cell">{formatCurrency(item.price * item.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={5} className="total-label">Total</td>
                    <td className="total-value">{formatCurrency(total)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
