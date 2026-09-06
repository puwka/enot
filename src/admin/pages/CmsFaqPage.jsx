import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { cmsCreate, cmsDelete, cmsList, cmsReorder, cmsUpdate } from '../cms/cmsApi';
import { ConfirmDialog, CmsAlert, CmsLoading, StatusBadge } from '../cms/CmsUi';
import '../cms/Cms.css';

const emptyFaq = { question: '', answer: '', category: '', sort_order: 0, status: 'published' };

const CmsFaqPage = () => {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyFaq);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [deleteId, setDeleteId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await cmsList('faq');
      setItems(data?.items || []);
    } catch (err) {
      if (err?.code === 'CMS_NOT_INSTALLED') {
        setError('CMS ещё не подключена. Выполните npm run db:migrate на сервере.');
      } else {
        setError('Не удалось загрузить FAQ. Проверьте права доступа и сессию админа.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const reset = () => {
    setEditId(null);
    setForm(emptyFaq);
  };

  const save = async () => {
    setError('');
    setMessage('');
    if (!form.question.trim() || !form.answer.trim()) {
      setError('Заполните вопрос и ответ.');
      return;
    }
    try {
      const payload = {
        question: form.question.trim(),
        answer: form.answer.trim(),
        category: form.category.trim() || null,
        sort_order: Number(form.sort_order || 0),
        status: form.status || 'published',
      };
      if (editId) {
        await cmsUpdate('faq', editId, payload);
        setMessage('Вопрос обновлён. На сайте /faq появятся только опубликованные.');
      } else {
        await cmsCreate('faq', {
          ...payload,
          sort_order: payload.sort_order || (items.length + 1) * 10,
        });
        setMessage('Вопрос создан и будет на странице /faq, если статус «Опубликовано».');
      }
      reset();
      await load();
    } catch {
      setError('Не удалось сохранить FAQ.');
    }
  };

  const setStatus = async (item, status) => {
    try {
      await cmsUpdate('faq', item.id, { status });
      await load();
    } catch {
      setError('Не удалось изменить статус.');
    }
  };

  const move = async (index, dir) => {
    const target = index + dir;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    const tmp = next[index];
    next[index] = next[target];
    next[target] = tmp;
    const ordered = next.map((item, i) => ({ id: item.id, sort_order: i * 10 }));
    setItems(next.map((item, i) => ({ ...item, sort_order: i * 10 })));
    try {
      await cmsReorder('faq', ordered);
    } catch {
      setError('Не удалось изменить порядок.');
      await load();
    }
  };

  if (loading) return <CmsLoading />;

  return (
    <div className="cms-dash">
      <section className="cms-panel">
        <div className="cms-toolbar">
          <div>
            <strong>{editId ? 'Редактирование FAQ' : 'Новый вопрос'}</strong>
            <p className="cms-panel__lead" style={{ margin: '6px 0 0' }}>
              Вопросы со статусом «Опубликовано» показываются на странице{' '}
              <Link to="/faq" target="_blank" rel="noreferrer">
                /faq
              </Link>
              .
            </p>
          </div>
          {editId ? (
            <button type="button" className="admin-btn admin-btn--ghost" onClick={reset}>
              Новый
            </button>
          ) : null}
        </div>
        <CmsAlert>{error}</CmsAlert>
        <CmsAlert type="ok">{message}</CmsAlert>
        <div className="cms-form">
          <label className="cms-field">
            <span>Вопрос</span>
            <input value={form.question} onChange={(e) => setForm((prev) => ({ ...prev, question: e.target.value }))} />
          </label>
          <label className="cms-field">
            <span>Ответ</span>
            <textarea rows={4} value={form.answer} onChange={(e) => setForm((prev) => ({ ...prev, answer: e.target.value }))} />
          </label>
          <div className="cms-form__grid">
            <label className="cms-field">
              <span>Категория (необязательно)</span>
              <input value={form.category} onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))} />
            </label>
            <label className="cms-field">
              <span>Порядок</span>
              <input
                type="number"
                value={form.sort_order}
                onChange={(e) => setForm((prev) => ({ ...prev, sort_order: Number(e.target.value) || 0 }))}
              />
            </label>
          </div>
          <label className="cms-field">
            <span>Статус</span>
            <select value={form.status} onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}>
              <option value="published">Опубликовано (на сайте)</option>
              <option value="draft">Черновик</option>
              <option value="archived">В архиве</option>
            </select>
          </label>
          <div className="cms-toolbar__right">
            <button type="button" className="admin-btn admin-btn--primary" onClick={save}>
              {editId ? 'Сохранить' : 'Создать'}
            </button>
          </div>
        </div>
      </section>

      <section className="cms-panel">
        <strong>Список FAQ ({items.length})</strong>
        {!items.length ? (
          <div className="cms-dash-empty" style={{ marginTop: 14 }}>
            <p>Вопросов пока нет. Создайте первый — он появится на /faq.</p>
          </div>
        ) : (
          <table className="cms-table">
            <thead>
              <tr>
                <th>Вопрос</th>
                <th>Категория</th>
                <th>Статус</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={item.id}>
                  <td>{item.question}</td>
                  <td>{item.category || '—'}</td>
                  <td>
                    <StatusBadge status={item.status} />
                  </td>
                  <td>
                    <div className="cms-table__actions">
                      <button type="button" className="admin-btn admin-btn--ghost" onClick={() => move(index, -1)}>
                        ↑
                      </button>
                      <button type="button" className="admin-btn admin-btn--ghost" onClick={() => move(index, 1)}>
                        ↓
                      </button>
                      <button
                        type="button"
                        className="admin-btn admin-btn--ghost"
                        onClick={() => {
                          setEditId(item.id);
                          setForm({
                            question: item.question || '',
                            answer: item.answer || '',
                            category: item.category || '',
                            sort_order: item.sort_order || 0,
                            status: item.status || 'draft',
                          });
                        }}
                      >
                        Изменить
                      </button>
                      {item.status !== 'published' ? (
                        <button type="button" className="admin-btn admin-btn--ghost" onClick={() => setStatus(item, 'published')}>
                          Опубликовать
                        </button>
                      ) : (
                        <button type="button" className="admin-btn admin-btn--ghost" onClick={() => setStatus(item, 'draft')}>
                          В черновик
                        </button>
                      )}
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
        title="Удалить вопрос?"
        text="Вопрос будет удалён из FAQ."
        onClose={() => setDeleteId(null)}
        onConfirm={async () => {
          await cmsDelete('faq', deleteId);
          setDeleteId(null);
          await load();
        }}
      />
    </div>
  );
};

export default CmsFaqPage;
