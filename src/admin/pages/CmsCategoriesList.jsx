import { useCallback, useEffect, useState } from 'react';
import { cmsCreate, cmsDelete, cmsList } from '../cms/cmsApi';
import { slugify } from '../cms/cmsConstants';
import { CmsAlert, CmsLoading, ConfirmDialog, StatusBadge } from '../cms/CmsUi';
import '../cms/Cms.css';

const emptyForm = {
  title: '',
  slug: '',
  type: 'article',
  description: '',
  status: 'published',
  sort_order: 0,
};

const CmsCategoriesList = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [deleteId, setDeleteId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await cmsList('categories');
      setItems(data?.items || []);
    } catch (err) {
      if (err?.code === 'CMS_NOT_INSTALLED') {
        setError('CMS ещё не подключена. Выполните supabase/sql/bootstrap_cms_crud.sql');
      } else {
        setError('Не удалось загрузить категории.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const save = async () => {
    setError('');
    try {
      await cmsCreate('categories', {
        ...form,
        slug: form.slug || slugify(form.title),
      });
      setForm(emptyForm);
      await load();
    } catch {
      setError('Не удалось создать категорию.');
    }
  };

  if (loading) return <CmsLoading />;

  return (
    <div className="cms-dash">
      <section className="cms-panel">
        <div className="cms-toolbar">
          <strong>Категории</strong>
        </div>
        <CmsAlert>{error}</CmsAlert>
        <div className="cms-form" style={{ marginBottom: 18 }}>
          <div className="cms-form__grid">
            <label className="cms-field">
              <span>Название</span>
              <input
                value={form.title}
                onChange={(e) => {
                  const title = e.target.value;
                  setForm((prev) => ({ ...prev, title, slug: prev.slug || slugify(title) }));
                }}
              />
            </label>
            <label className="cms-field">
              <span>Тип</span>
              <select value={form.type} onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value }))}>
                <option value="article">article</option>
                <option value="news">news</option>
                <option value="product">product</option>
              </select>
            </label>
          </div>
          <div className="cms-form__grid">
            <label className="cms-field">
              <span>Slug</span>
              <input value={form.slug} onChange={(e) => setForm((prev) => ({ ...prev, slug: slugify(e.target.value) }))} />
            </label>
            <label className="cms-field">
              <span>Описание</span>
              <input
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              />
            </label>
          </div>
          <button type="button" className="admin-btn admin-btn--primary" onClick={save}>
            Создать категорию
          </button>
        </div>

        {!items.length ? (
          <div className="cms-dash-empty">
            <p>Категорий пока нет. Создайте первую или они появятся при импорте контента.</p>
          </div>
        ) : (
          <table className="cms-table">
            <thead>
              <tr>
                <th>Название</th>
                <th>Тип</th>
                <th>Slug</th>
                <th>Статус</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>{item.title}</td>
                  <td>{item.type}</td>
                  <td>{item.slug}</td>
                  <td>
                    <StatusBadge status={item.status} />
                  </td>
                  <td>
                    <button type="button" className="admin-btn admin-btn--danger" onClick={() => setDeleteId(item.id)}>
                      Удалить
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Удалить категорию?"
        text="Категория будет скрыта из редакции."
        onClose={() => setDeleteId(null)}
        onConfirm={async () => {
          await cmsDelete('categories', deleteId);
          setDeleteId(null);
          await load();
        }}
      />
    </div>
  );
};

export default CmsCategoriesList;
