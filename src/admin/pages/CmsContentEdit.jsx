import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { cmsCreate, cmsDelete, cmsGet, cmsList, cmsPublish, cmsUnpublish, cmsUpdate } from '../cms/cmsApi';
import { CONTENT_STATUSES, slugify } from '../cms/cmsConstants';
import ContentBlocksEditor, { renderContentPreview } from '../cms/ContentBlocksEditor';
import { getSiteArticleBySlug, getSiteNewsBySlug } from '../cms/siteContent';
import { CmsAlert, CmsLoading, ConfirmDialog, PreviewModal } from '../cms/CmsUi';
import '../cms/Cms.css';

const emptyForm = {
  title: '',
  slug: '',
  excerpt: '',
  lead: '',
  author: '',
  read_time: '',
  cover_url: '',
  category_id: null,
  meta_title: '',
  meta_description: '',
  status: 'draft',
  content_blocks: [],
  facts: [],
  toc: [],
  cta: {},
};

const applyItem = (item) => ({
  title: item.title || '',
  slug: item.slug || '',
  excerpt: item.excerpt || item.lead || '',
  lead: item.lead || item.excerpt || '',
  author: item.author || '',
  read_time: item.read_time || '',
  cover_url: item.cover_url || '',
  category_id: item.category_id || null,
  meta_title: item.meta_title || '',
  meta_description: item.meta_description || '',
  status: item.status || 'draft',
  content_blocks: item.content_blocks || [],
  facts: item.facts || [],
  toc: item.toc || [],
  cta: item.cta || {},
});

const CmsContentEdit = ({ entity, listPath, titleLabel }) => {
  const { id, slug: siteSlugParam } = useParams();
  const isNew = id === 'new';
  const isSite = Boolean(siteSlugParam) || String(id || '').startsWith('site:');
  const siteSlug = siteSlugParam || (String(id || '').startsWith('site:') ? String(id).slice(5) : '');
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(!isNew);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const load = useCallback(async () => {
    setError('');
    try {
      try {
        const cats = await cmsList('categories');
        const wanted = entity === 'news' ? 'news' : 'article';
        setCategories((cats?.items || []).filter((item) => item.type === wanted));
      } catch {
        setCategories([]);
      }

      if (isNew) {
        setLoading(false);
        return;
      }

      setLoading(true);

      if (isSite) {
        const siteItem = entity === 'news' ? getSiteNewsBySlug(siteSlug) : getSiteArticleBySlug(siteSlug);
        if (!siteItem) {
          setError('Запись сайта не найдена.');
          return;
        }
        setForm(applyItem(siteItem));
        return;
      }

      const data = await cmsGet(entity, id);
      const item = data?.item || {};
      const siteItem = entity === 'news' ? getSiteNewsBySlug(item.slug) : getSiteArticleBySlug(item.slug);
      if (siteItem && !(item.content_blocks || []).length && (siteItem.content_blocks || []).length) {
        setForm(applyItem({ ...item, content_blocks: siteItem.content_blocks, toc: item.toc?.length ? item.toc : siteItem.toc }));
      } else {
        setForm(applyItem(item));
      }
    } catch {
      setError('Не удалось загрузить запись.');
    } finally {
      setLoading(false);
    }
  }, [entity, id, isNew, isSite, siteSlug]);

  useEffect(() => {
    load();
  }, [load]);

  const patch = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const save = async () => {
    setError('');
    setMessage('');
    try {
      const payload = {
        ...form,
        slug: form.slug || slugify(form.title),
        lead: form.lead || form.excerpt,
        excerpt: form.excerpt || form.lead,
        category_id: form.category_id || null,
      };
      if (isNew || isSite) {
        const created = await cmsCreate(entity, payload);
        setMessage(isSite ? 'Сохранено в CMS.' : 'Создано.');
        navigate(`${listPath}/${created.item.id}`, { replace: true });
      } else {
        await cmsUpdate(entity, id, payload);
        setMessage('Сохранено.');
        await load();
      }
    } catch (err) {
      setError(err?.code === 'SLUG_EXISTS' ? 'Slug уже занят.' : 'Не удалось сохранить.');
    }
  };

  if (loading) return <CmsLoading />;

  return (
    <div className="cms-editor">
      <div className="cms-editor__main">
        <div className="cms-toolbar">
          <div className="cms-toolbar__left">
            <strong>{isNew ? `Новая ${titleLabel}` : form.title || titleLabel}</strong>
            {isSite ? <span className="cms-muted">с сайта</span> : null}
          </div>
          <div className="cms-toolbar__right">
            <button type="button" className="admin-btn admin-btn--ghost" onClick={() => setPreviewOpen(true)}>
              Предпросмотр
            </button>
            <button type="button" className="admin-btn admin-btn--secondary" onClick={save}>
              {isSite ? 'Сохранить в CMS' : 'Сохранить'}
            </button>
            {!isNew && !isSite && form.status !== 'published' ? (
              <button type="button" className="admin-btn admin-btn--primary" onClick={() => cmsPublish(entity, id).then(load)}>
                Опубликовать
              </button>
            ) : null}
            {!isNew && !isSite && form.status === 'published' ? (
              <button type="button" className="admin-btn admin-btn--ghost" onClick={() => cmsUnpublish(entity, id).then(load)}>
                Снять с публикации
              </button>
            ) : null}
          </div>
        </div>

        <CmsAlert>{error}</CmsAlert>
        <CmsAlert type="ok">{message}</CmsAlert>

        <div className="cms-form">
          <div className="cms-form-section">
            <h3 className="cms-form-section__title">Основная информация</h3>
            <div className="cms-form__grid">
              <label className="cms-field">
                <span>Заголовок</span>
                <input
                  value={form.title}
                  onChange={(e) => {
                    const title = e.target.value;
                    setForm((prev) => ({ ...prev, title, slug: prev.slug || slugify(title) }));
                  }}
                />
              </label>
              <label className="cms-field">
                <span>Slug</span>
                <input value={form.slug} onChange={(e) => patch('slug', slugify(e.target.value))} />
              </label>
            </div>
            <div className="cms-form__grid">
              <label className="cms-field">
                <span>Автор</span>
                <input value={form.author} onChange={(e) => patch('author', e.target.value)} />
              </label>
              <label className="cms-field">
                <span>Время чтения</span>
                <input value={form.read_time} onChange={(e) => patch('read_time', e.target.value)} placeholder="5 мин" />
              </label>
            </div>
            <label className="cms-field">
              <span>Краткое описание</span>
              <textarea
                value={form.excerpt}
                onChange={(e) => {
                  patch('excerpt', e.target.value);
                  patch('lead', e.target.value);
                }}
              />
            </label>
          </div>
        </div>

        <div className="cms-form-section">
          <h3 className="cms-form-section__title">Контент</h3>
          <p className="cms-panel__lead">Блоки статьи без HTML.</p>
          <ContentBlocksEditor
            value={form.content_blocks}
            onChange={(content_blocks) => patch('content_blocks', content_blocks)}
          />
        </div>
      </div>

      <aside className="cms-editor__side">
        <div className="cms-form-section">
          <h3 className="cms-form-section__title">Публикация</h3>
          <div className="cms-form">
            <label className="cms-field">
              <span>Статус</span>
              <select value={form.status} onChange={(e) => patch('status', e.target.value)}>
                {CONTENT_STATUSES.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="cms-field">
              <span>Категория</span>
              <select
                value={form.category_id || ''}
                onChange={(e) => patch('category_id', e.target.value || null)}
              >
                <option value="">Без категории</option>
                {categories.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.title}
                  </option>
                ))}
              </select>
            </label>
            {!isNew && !isSite ? (
              <button type="button" className="admin-btn admin-btn--danger" onClick={() => setDeleteOpen(true)}>
                Удалить
              </button>
            ) : null}
          </div>
        </div>
        <div className="cms-form-section">
          <h3 className="cms-form-section__title">Изображение</h3>
          <label className="cms-field">
            <span>Обложка (URL)</span>
            <input value={form.cover_url} onChange={(e) => patch('cover_url', e.target.value)} />
          </label>
        </div>
        <div className="cms-form-section">
          <h3 className="cms-form-section__title">SEO</h3>
          <div className="cms-form">
            <label className="cms-field">
              <span>SEO title</span>
              <input value={form.meta_title} onChange={(e) => patch('meta_title', e.target.value)} />
            </label>
            <label className="cms-field">
              <span>SEO description</span>
              <input value={form.meta_description} onChange={(e) => patch('meta_description', e.target.value)} />
            </label>
          </div>
        </div>
      </aside>

      <PreviewModal open={previewOpen} title={form.title || 'Preview'} onClose={() => setPreviewOpen(false)}>
        {form.cover_url ? <img src={form.cover_url} alt="" /> : null}
        <p>{form.excerpt}</p>
        <p style={{ color: '#6b7689' }}>
          {form.author ? `${form.author} · ` : ''}
          {form.read_time || ''}
        </p>
        {renderContentPreview(form.content_blocks)}
      </PreviewModal>

      <ConfirmDialog
        open={deleteOpen}
        title="Удалить запись?"
        text="Запись будет удалена из редакции."
        onClose={() => setDeleteOpen(false)}
        onConfirm={async () => {
          await cmsDelete(entity, id);
          navigate(listPath);
        }}
      />
    </div>
  );
};

export default CmsContentEdit;
