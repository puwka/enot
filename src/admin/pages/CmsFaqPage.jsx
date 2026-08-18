import { useCallback, useEffect, useState } from 'react';
import {
  cmsCreate,
  cmsDelete,
  cmsList,
  cmsPublish,
  cmsReorder,
  cmsUnpublish,
  cmsUpdate,
} from '../cms/cmsApi';
import { ConfirmDialog, CmsAlert, CmsLoading, StatusBadge } from '../cms/CmsUi';
import '../cms/Cms.css';

const emptyFaq = { question: '', answer: '', category: '', sort_order: 0, status: 'draft' };

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
    } catch {
      setError('Не удалось загрузить FAQ.');
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
    try {
      if (editId) {
        await cmsUpdate('faq', editId, form);
        setMessage('FAQ обновлён.');
      } else {
        await cmsCreate('faq', {
          ...form,
          sort_order: form.sort_order || (items.length + 1) * 10,
        });
        setMessage('FAQ создан.');
      }
      reset();
      await load();
    } catch {
      setError('Не удалось сохранить FAQ.');
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
    await cmsReorder('faq', ordered);
  };

  if (loading) return <CmsLoading />;

  return (
    <div className="cms-dash">
      <section className="cms-panel">
        <div className="cms-toolbar">
          <strong>{editId ? 'Редактирование FAQ' : 'Новый вопрос'}</strong>
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
            <textarea value={form.answer} onChange={(e) => setForm((prev) => ({ ...prev, answer: e.target.value }))} />
          </label>
          <div className="cms-form__grid">
            <label className="cms-field">
              <span>Категория</span>
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
          <label className="cms-inline-check">
            <input
              type="checkbox"
              checked={form.status === 'published'}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, status: e.target.checked ? 'published' : 'draft' }))
              }
            />
            Active (опубликован)
          </label>
          <div className="cms-toolbar__right">
            <button type="button" className="admin-btn admin-btn--primary" onClick={save}>
              {editId ? 'Сохранить' : 'Создать'}
            </button>
          </div>
        </div>
      </section>

      <section className="cms-panel">
        <strong>Список FAQ</strong>
        {!items.length ? (
          <div className="cms-dash-empty" style={{ marginTop: 14 }}>
            <p>Вопросов пока нет.</p>
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
                        <button type="button" className="admin-btn admin-btn--ghost" onClick={() => cmsPublish('faq', item.id).then(load)}>
                          Publish
                        </button>
                      ) : (
                        <button type="button" className="admin-btn admin-btn--ghost" onClick={() => cmsUnpublish('faq', item.id).then(load)}>
                          Draft
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
