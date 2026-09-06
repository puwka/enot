import { useCallback, useEffect, useState } from 'react';
import { cmsCreate, cmsDelete, cmsList, cmsUpdate } from '../cms/cmsApi';
import { slugify } from '../cms/cmsConstants';
import { CmsAlert, CmsLoading, ConfirmDialog, StatusBadge } from '../cms/CmsUi';
import '../cms/Cms.css';

const emptyForm = {
  id: '',
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
        setError('CMS ещё не подключена. Выполните npm run db:migrate');
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
      const payload = {
        title: form.title.trim(),
        slug: form.slug || slugify(form.title),
        type: form.type,
        description: form.description || null,
        status: form.status,
        sort_order: Number(form.sort_order || 0),
      };
      if (form.id) {
        await cmsUpdate('categories', form.id, payload);
      } else {
        await cmsCreate('categories', payload);
      }
      setForm(emptyForm);
      await load();
    } catch {
      setError('Не удалось сохранить категорию.');
    }
  };

  if (loading) return <CmsLoading />;

  return (
    <div className="cms-dash">
      <section className="cms-panel">
        <div className="cms-toolbar">
          <strong>Категории</strong>
        </div>
        <p className="cms-panel__lead" style={{ marginBottom: 12 }}>
          Тип — для чего категория: article (статьи), news (новости), product (продукты каталога).
          Slug — короткий адрес категории латиницей (например: loans, jobs).
        </p>
        <CmsAlert>{error}</CmsAlert>
        <div className="cms-form" style={{ marginBottom: 18 }}>
          <div className="cms-form__grid">
            <label className="cms-field">
              <span>Название</span>
              <input
                value={form.title}
                onChange={(e) => {
                  const title = e.target.value;
                  setForm((prev) => ({ ...prev, title, slug: prev.id ? prev.slug : prev.slug || slugify(title) }));
                }}
              />
            </label>
            <label className="cms-field">
              <span>Тип</span>
              <select value={form.type} onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value }))}>
                <option value="article">article — статьи</option>
                <option value="news">news — новости</option>
                <option value="product">product — продукты</option>
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
          <div className="cms-toolbar__right">
            <button type="button" className="admin-btn admin-btn--primary" onClick={save} disabled={!form.title.trim()}>
              {form.id ? 'Сохранить' : 'Создать категорию'}
            </button>
            {form.id ? (
              <button type="button" className="admin-btn admin-btn--ghost" onClick={() => setForm(emptyForm)}>
                Отмена
              </button>
            ) : null}
          </div>
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
                    <div className="cms-table__actions">
                      <button
                        type="button"
                        className="admin-btn admin-btn--ghost"
                        onClick={() =>
                          setForm({
                            id: item.id,
                            title: item.title || '',
                            slug: item.slug || '',
                            type: item.type || 'article',
                            description: item.description || '',
                            status: item.status || 'published',
                            sort_order: item.sort_order ?? 0,
                          })
                        }
                      >
                        Изменить
                      </button>
                      <button type="button" className="admin-btn admin-btn--danger" onClick={() => setDeleteId(item.id)}>
                        Удалить
                      </button>
                    </div>
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
