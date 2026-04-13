interface Props {
  showAdminInput: boolean;
  adminToken: string;
  deleting: boolean;
  onToggleAdminInput: () => void;
  onAdminTokenChange: (value: string) => void;
  onDeleteDatabase: () => void;
}

export function AdminSection({
  showAdminInput,
  adminToken,
  deleting,
  onToggleAdminInput,
  onAdminTokenChange,
  onDeleteDatabase,
}: Props) {
  return (
    <>
      <button 
        className="admin-btn"
        onClick={onToggleAdminInput}
        title="Administrator"
      >
        Admin
      </button>
      {showAdminInput && (
        <div className="admin-section">
          <input
            type="password"
            placeholder="Admin token..."
            value={adminToken}
            onChange={(e) => onAdminTokenChange(e.target.value)}
            className="admin-input"
          />
          <button
            onClick={onDeleteDatabase}
            disabled={deleting || !adminToken}
            className="admin-delete-btn"
          >
            {deleting ? 'Deleting...' : 'Delete Database'}
          </button>
        </div>
      )}
    </>
  );
}
