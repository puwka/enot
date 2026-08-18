import './Cms.css';

const STATUS_LABELS = {
  draft: 'Draft',
  published: 'Published',
  archived: 'Archived',
  active: 'Active',
  blocked: 'Blocked',
};

export const StatusBadge = ({ status }) => {
  const value = String(status || 'draft').toLowerCase();
  return (
    <span className={`cms-badge-status cms-badge-status--${value}`}>
      {STATUS_LABELS[value] || value}
    </span>
  );
};

export const ConfirmDialog = ({ open, title, text, confirmLabel = 'Удалить', onConfirm, onClose }) => {
  if (!open) return null;
  return (
    <div className="cms-modal" role="presentation">
      <button type="button" className="cms-modal__backdrop" aria-label="Закрыть" onClick={onClose} />
      <div className="cms-modal__dialog" role="dialog" aria-modal="true">
        <h2>{title}</h2>
        <p>{text}</p>
        <div className="cms-modal__actions">
          <button type="button" className="admin-btn admin-btn--secondary" onClick={onClose}>
            Отмена
          </button>
          <button type="button" className="admin-btn admin-btn--danger" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export const PreviewModal = ({ open, title, children, onClose }) => {
  if (!open) return null;
  return (
    <div className="cms-modal" role="presentation">
      <button type="button" className="cms-modal__backdrop" aria-label="Закрыть" onClick={onClose} />
      <div className="cms-modal__dialog cms-modal__dialog--wide" role="dialog" aria-modal="true">
        <div className="cms-modal__head">
          <h2>{title || 'Предпросмотр'}</h2>
          <button type="button" className="admin-btn admin-btn--ghost" onClick={onClose}>
            Закрыть
          </button>
        </div>
        <div className="cms-preview">{children}</div>
      </div>
    </div>
  );
};

export const CmsAlert = ({ type = 'error', children }) =>
  children ? <div className={`cms-alert cms-alert--${type}`}>{children}</div> : null;

export const CmsLoading = () => (
  <div className="cms-dash-skeleton">
    <span />
    <span />
    <span />
  </div>
);
