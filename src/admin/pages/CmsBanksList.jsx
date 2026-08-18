import { useCallback, useEffect, useMemo, useState } from 'react';
import { cmsCreate, cmsDelete, cmsList, cmsUpdate } from '../cms/cmsApi';
import { slugify } from '../cms/cmsConstants';
import { getSiteBanks, mergeBankItems } from '../cms/siteContent';
import { CmsAlert, CmsLoading, ConfirmDialog, StatusBadge } from '../cms/CmsUi';
import '../cms/Cms.css';

const emptyForm = {
  id: '',
  name: '',
  slug: '',
  logo_url: '',
  website_url: '',
  status: 'published',
  sort_order: 0,
};

const CmsBanksList = () => {
  const [query, setQuery] = useState('');
  const [rawItems, setRawItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [deleteId, setDeleteId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await cmsList('banks');
      setRawItems(mergeBankItems(data?.items || [], getSiteBanks()));
    } catch {
      setRawItems(getSiteBanks());
      setError('');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rawItems;
    return rawItems.filter((item) => item.name.toLowerCase().includes(q) || item.slug.includes(q));
  }, [rawItems, query]);

  const save = async () => {
    try {
      const payload = {
        name: form.name.trim(),
        slug: slugify(form.slug || form.name),
        logo_url: form.logo_url.trim() || null,
        website_url: form.website_url.trim() || null,
        status: form.status,
        sort_order: Number(form.sort_order || 0),
      };
      if (form.id && !String(form.id).startsWith('site-')) {
        await cmsUpdate('banks', form.id, payload);
      } else {
        await cmsCreate('banks', payload);
      }
      setForm(emptyForm);
      await load();
    } catch {
      setError('Не удалось сохранить банк.');
    }
  };

  const onDelete = async () => {
    try {
      await cmsDelete('banks', deleteId);
      setDeleteId(null);
      await load();
    } catch {
      setError('Не удалось удалить банк.');
      setDeleteId(null);
    }
  };

  if (loading) return <CmsLoading />;

  return (
    <div className="cms-panel">
      <div className="cms-toolbar">
        <div className="cms-toolbar__left">
          <strong>Банки</strong>
          <span className="cms-muted">{items.length}</span>
        </div>
        <div className="cms-toolbar__right">
          <input
            className="cms-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск…"
            style={{ minWidth: 180 }}
          />
        </div>
      </div>
      <CmsAlert>{error}</CmsAlert>
      <div className="cms-form" style={{ marginBottom: 18 }}>
        <div className="cms-form-section">
          <h3 className="cms-form-section__title">Банк</h3>
          <div className="cms-form__grid">
          <label className="cms-field">
            <span>Название</span>
            <input value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value, slug: prev.slug || slugify(e.target.value) }))} />
          </label>
          <label className="cms-field">
            <span>Slug</span>
            <input value={form.slug} onChange={(e) => setForm((prev) => ({ ...prev, slug: slugify(e.target.value) }))} />
          </label>
        </div>
        <div className="cms-form__grid">
          <label className="cms-field">
            <span>Логотип</span>
            <input value={form.logo_url} onChange={(e) => setForm((prev) => ({ ...prev, logo_url: e.target.value }))} />
          </label>
          <label className="cms-field">
            <span>Сайт</span>
            <input value={form.website_url} onChange={(e) => setForm((prev) => ({ ...prev, website_url: e.target.value }))} />
          </label>
        </div>
        <div className="cms-form__grid">
          <label className="cms-field">
            <span>Статус</span>
            <select value={form.status} onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}>
              <option value="draft">draft</option>
              <option value="published">published</option>
              <option value="archived">archived</option>
            </select>
          </label>
          <label className="cms-field">
            <span>sort_order</span>
            <input type="number" value={form.sort_order} onChange={(e) => setForm((prev) => ({ ...prev, sort_order: e.target.value }))} />
          </label>
        </div>
        <div className="cms-toolbar__right">
          <button type="button" className="admin-btn admin-btn--primary" onClick={save} disabled={!form.name.trim()}>
            {form.id ? 'Сохранить' : 'Добавить'}
          </button>
          {form.id ? (
            <button type="button" className="admin-btn admin-btn--ghost" onClick={() => setForm(emptyForm)}>
              Отмена
            </button>
          ) : null}
        </div>
        </div>
      </div>
      <table className="cms-table">
        <thead>
          <tr>
            <th>Логотип</th>
            <th>Название</th>
            <th>Slug</th>
            <th>Продуктов</th>
            <th>Статус</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>
                {item.logo_url ? (
                  <img src={item.logo_url} alt="" style={{ width: 40, height: 40, objectFit: 'contain' }} />
                ) : (
                  '—'
                )}
              </td>
              <td>{item.name}</td>
              <td>{item.slug}</td>
              <td>{item.products_count}</td>
              <td>
                <StatusBadge status={item.status} />
              </td>
              <td>
                <div className="cms-table__actions">
                  <button type="button" className="admin-btn admin-btn--ghost" onClick={() => setForm({
                    id: item.id,
                    name: item.name || '',
                    slug: item.slug || '',
                    logo_url: item.logo_url || '',
                    website_url: item.website_url || '',
                    status: item.status || 'published',
                    sort_order: item.sort_order ?? 0,
                  })}>
                    Изменить
                  </button>
                  {String(item.id).startsWith('site-') ? null : (
                    <button type="button" className="admin-btn admin-btn--danger" onClick={() => setDeleteId(item.id)}>
                      Удалить
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Удалить банк?"
        text="Банк будет скрыт из CMS."
        onClose={() => setDeleteId(null)}
        onConfirm={onDelete}
      />
    </div>
  );
};

export default CmsBanksList;
