import { useRef, useState } from 'react';
import { getAdminToken } from '../adminApi';

const API_BASE = (process.env.REACT_APP_API_URL || '/api').replace(/\/$/, '');

const CmsImageUpload = ({ label = 'Логотип', value = '', onChange, previewFallback = '' }) => {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const preview = value || previewFallback;

  const uploadFile = async (file) => {
    if (!file) return;
    setError('');
    setUploading(true);
    try {
      const token = getAdminToken();
      if (!token) {
        throw new Error('INVALID_SESSION');
      }
      const body = new FormData();
      body.append('file', file);
      const response = await fetch(`${API_BASE}/admin/upload`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'x-admin-token': token,
        },
        body,
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.message || payload?.error || 'UPLOAD_FAILED');
      }
      onChange(payload.url || '');
    } catch (err) {
      setError(err?.message === 'INVALID_SESSION' ? 'Сессия истекла. Войдите снова.' : 'Не удалось загрузить изображение.');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className="cms-field cms-image-upload">
      <span>{label}</span>
      <div className="cms-image-upload__row">
          <button
          type="button"
          className="admin-btn admin-btn--ghost"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? 'Загрузка…' : 'Выбрать файл'}
        </button>
        {value ? (
          <button
            type="button"
            className="admin-btn admin-btn--ghost"
            disabled={uploading}
            onClick={() => onChange('')}
          >
            Удалить
          </button>
        ) : null}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
          hidden
          onChange={(e) => uploadFile(e.target.files?.[0])}
        />
      </div>
      {value ? <div className="cms-muted cms-image-upload__path">{value}</div> : null}
      {error ? <div className="cms-alert cms-alert--error" style={{ marginTop: 8 }}>{error}</div> : null}
      {preview ? (
        <img
          src={preview}
          alt=""
          className="cms-image-upload__preview"
        />
      ) : null}
    </div>
  );
};

export default CmsImageUpload;
