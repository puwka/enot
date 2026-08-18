import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  cmsCreate,
  cmsDelete,
  cmsGet,
  cmsHideBlock,
  cmsPublish,
  cmsReorder,
  cmsShowBlock,
  cmsUnpublish,
  cmsUpdate,
} from '../cms/cmsApi';
import { PAGE_BLOCK_TYPES, slugify } from '../cms/cmsConstants';
import PageBlocksEditor, { createEmptyPageBlock, renderPageBlocksPreview } from '../cms/PageBlocksEditor';
import { getSitePageBySlug } from '../cms/siteContent';
import { CmsAlert, CmsLoading, ConfirmDialog, PreviewModal, StatusBadge } from '../cms/CmsUi';
import '../cms/Cms.css';

const emptyPage = {
  title: '',
  slug: '',
  meta_title: '',
  meta_description: '',
  status: 'draft',
  sort_order: 0,
};

const CmsPageEdit = () => {
  const { id, slug: siteSlugParam } = useParams();
  const isNew = id === 'new';
  const isSite = Boolean(siteSlugParam) || String(id || '').startsWith('site:');
  const siteSlug = siteSlugParam || (String(id || '').startsWith('site:') ? String(id).slice(5) : '');
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyPage);
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [blockType, setBlockType] = useState('text');
  const [cmsPageId, setCmsPageId] = useState(null);

  const pageId = useMemo(() => {
    if (isNew || isSite) return cmsPageId;
    return id;
  }, [cmsPageId, id, isNew, isSite]);

  const load = useCallback(async () => {
    if (isNew) return;
    setLoading(true);
    setError('');
    try {
      if (isSite) {
        const sitePage = getSitePageBySlug(siteSlug);
        if (!sitePage) {
          setError('Страница сайта не найдена.');
          return;
        }
        setForm({
          title: sitePage.title || '',
          slug: sitePage.slug || '',
          meta_title: sitePage.meta_title || '',
          meta_description: sitePage.meta_description || '',
          status: sitePage.status || 'published',
          sort_order: sitePage.sort_order || 0,
        });
        setBlocks(sitePage.blocks || []);
        setCmsPageId(null);
        return;
      }

      const data = await cmsGet('pages', id);
      const item = data?.item || {};
      setForm({
        title: item.title || '',
        slug: item.slug || '',
        meta_title: item.meta_title || '',
        meta_description: item.meta_description || '',
        status: item.status || 'draft',
        sort_order: item.sort_order || 0,
      });
      let nextBlocks = item.blocks || [];
      if (!nextBlocks.length) {
        const sitePage = getSitePageBySlug(item.slug);
        if (sitePage?.blocks?.length) nextBlocks = sitePage.blocks;
      }
      setBlocks(nextBlocks);
      setCmsPageId(item.id || id);
    } catch {
      setError('Не удалось загрузить страницу.');
    } finally {
      setLoading(false);
    }
  }, [id, isNew, isSite, siteSlug]);

  useEffect(() => {
    load();
  }, [load]);

  const patch = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const savePage = async () => {
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const payload = {
        ...form,
        slug: form.slug || slugify(form.title),
      };
      if (isNew || isSite) {
        const created = await cmsCreate('pages', payload);
        const newId = created.item.id;
        for (let i = 0; i < blocks.length; i += 1) {
          const block = blocks[i];
          await cmsCreate('page_blocks', {
            block_type: block.block_type,
            title: block.title || '',
            body: block.body || '',
            payload: block.payload || {},
            status: block.status || 'published',
            sort_order: block.sort_order ?? i * 10,
            is_hidden: Boolean(block.is_hidden),
            page_id: newId,
          });
        }
        setMessage(isSite ? 'Страница и блоки сохранены в CMS.' : 'Страница создана.');
        navigate(`/admin/pages/${newId}`, { replace: true });
      } else {
        await cmsUpdate('pages', id, payload);
        setMessage('Страница сохранена.');
        await load();
      }
    } catch (err) {
      setError(err?.code === 'SLUG_EXISTS' ? 'Такой slug уже занят.' : 'Не удалось сохранить страницу.');
    } finally {
      setSaving(false);
    }
  };

  const addBlock = async () => {
    const draft = {
      ...createEmptyPageBlock(blockType),
      id: `local-${Date.now()}`,
      sort_order: (blocks.length + 1) * 10,
    };

    if (!pageId) {
      setBlocks((prev) => [...prev, draft]);
      setMessage('Блок добавлен локально. Сохраните страницу в CMS, чтобы зафиксировать.');
      return;
    }

    try {
      await cmsCreate('page_blocks', {
        ...draft,
        page_id: pageId,
        sort_order: (blocks.length + 1) * 10,
      });
      await load();
    } catch {
      setError('Не удалось создать блок.');
    }
  };

  const saveBlock = async (block) => {
    if (!pageId || String(block.id || '').startsWith('local-') || String(block.id || '').startsWith('home-') || String(block.id || '').includes('-hero') || !/^[0-9a-f-]{36}$/i.test(String(block.id || ''))) {
      setBlocks((prev) => prev.map((item) => (item.id === block.id ? block : item)));
      setMessage('Блок обновлён локально. Нажмите «Сохранить», чтобы записать в CMS.');
      return;
    }
    try {
      await cmsUpdate('page_blocks', block.id, {
        title: block.title,
        body: block.body,
        payload: block.payload || {},
        block_type: block.block_type,
        sort_order: block.sort_order,
        is_hidden: block.is_hidden,
        status: block.status || 'published',
      });
      setMessage('Блок сохранён.');
      await load();
    } catch {
      setError('Не удалось сохранить блок.');
    }
  };

  if (loading) return <CmsLoading />;

  return (
    <div className="cms-editor">
      <div className="cms-editor__main">
        <div className="cms-toolbar">
          <div className="cms-toolbar__left">
            <strong>{isNew ? 'Новая страница' : form.title || 'Страница'}</strong>
            {isSite ? <span className="cms-muted">с сайта · {blocks.length} блоков</span> : null}
          </div>
          <div className="cms-toolbar__right">
            <button type="button" className="admin-btn admin-btn--ghost" onClick={() => setPreviewOpen(true)}>
              Предпросмотр
            </button>
            <button type="button" className="admin-btn admin-btn--secondary" onClick={savePage} disabled={saving}>
              {isSite ? 'Сохранить в CMS' : 'Сохранить'}
            </button>
            {!isNew && !isSite && form.status !== 'published' ? (
              <button
                type="button"
                className="admin-btn admin-btn--primary"
                onClick={() => cmsPublish('pages', id).then(load)}
              >
                Опубликовать
              </button>
            ) : null}
            {!isNew && !isSite && form.status === 'published' ? (
              <button
                type="button"
                className="admin-btn admin-btn--ghost"
                onClick={() => cmsUnpublish('pages', id).then(load)}
              >
                Снять с публикации
              </button>
            ) : null}
          </div>
        </div>

        <CmsAlert>{error}</CmsAlert>
        <CmsAlert type="ok">{message}</CmsAlert>

        <div className="cms-form">
          <div className="cms-form-section">
            <h3 className="cms-form-section__title">Основной контент</h3>
            <div className="cms-form__grid">
              <label className="cms-field">
                <span>Название</span>
                <input
                  value={form.title}
                  onChange={(e) => {
                    const title = e.target.value;
                    setForm((prev) => ({
                      ...prev,
                      title,
                      slug: prev.slug ? prev.slug : slugify(title),
                    }));
                  }}
                />
              </label>
              <label className="cms-field">
                <span>Slug</span>
                <input value={form.slug} onChange={(e) => patch('slug', slugify(e.target.value))} />
              </label>
            </div>
          </div>
        </div>

        <div className="cms-toolbar" style={{ marginTop: 28 }}>
          <div className="cms-toolbar__left">
            <strong>Блоки страницы</strong>
            <span className="cms-muted">{blocks.length}</span>
          </div>
          <div className="cms-add-row">
            <select value={blockType} onChange={(e) => setBlockType(e.target.value)}>
              {PAGE_BLOCK_TYPES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
            <button type="button" className="admin-btn admin-btn--primary" onClick={addBlock}>
              Добавить блок
            </button>
          </div>
        </div>
        {!blocks.length ? (
          <div className="cms-dash-empty">
            <p>Блоков пока нет. Выберите тип и нажмите «Добавить блок».</p>
          </div>
        ) : (
          <PageBlocksEditor
            blocks={blocks}
            onChange={setBlocks}
            onPersistOrder={async (items) => {
              setBlocks((prev) => {
                const map = new Map(items.map((item) => [item.id, item.sort_order]));
                return prev
                  .map((block) => ({ ...block, sort_order: map.has(block.id) ? map.get(block.id) : block.sort_order }))
                  .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
              });
              if (pageId) {
                const cmsItems = items.filter((item) => /^[0-9a-f-]{36}$/i.test(String(item.id || '')));
                if (cmsItems.length) await cmsReorder('page_blocks', cmsItems);
              }
            }}
            onHide={async (blockId) => {
              if (!pageId || !/^[0-9a-f-]{36}$/i.test(String(blockId || ''))) {
                setBlocks((prev) => prev.map((block) => (block.id === blockId ? { ...block, is_hidden: true } : block)));
                return;
              }
              await cmsHideBlock(blockId);
              await load();
            }}
            onShow={async (blockId) => {
              if (!pageId || !/^[0-9a-f-]{36}$/i.test(String(blockId || ''))) {
                setBlocks((prev) => prev.map((block) => (block.id === blockId ? { ...block, is_hidden: false } : block)));
                return;
              }
              await cmsShowBlock(blockId);
              await load();
            }}
            onDelete={async (blockId) => {
              if (!pageId || !/^[0-9a-f-]{36}$/i.test(String(blockId || ''))) {
                setBlocks((prev) => prev.filter((block) => block.id !== blockId));
                return;
              }
              await cmsDelete('page_blocks', blockId);
              await load();
            }}
            onSaveBlock={saveBlock}
          />
        )}
      </div>

      <aside className="cms-editor__side">
        <div className="cms-form-section">
          <h3 className="cms-form-section__title">Публикация</h3>
          <div className="cms-form">
            <label className="cms-field">
              <span>Статус</span>
              <div><StatusBadge status={form.status} /></div>
            </label>
            <label className="cms-field">
              <span>Порядок</span>
              <input
                type="number"
                value={form.sort_order}
                onChange={(e) => patch('sort_order', Number(e.target.value) || 0)}
              />
            </label>
            {!isNew && !isSite ? (
              <button type="button" className="admin-btn admin-btn--danger" onClick={() => setDeleteOpen(true)}>
                Удалить страницу
              </button>
            ) : null}
          </div>
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
              <textarea value={form.meta_description} onChange={(e) => patch('meta_description', e.target.value)} />
            </label>
          </div>
        </div>
      </aside>

      <PreviewModal open={previewOpen} title={form.title || 'Preview'} onClose={() => setPreviewOpen(false)}>
        <p style={{ color: '#6b7689' }}>{form.meta_description}</p>
        {renderPageBlocksPreview(blocks)}
      </PreviewModal>

      <ConfirmDialog
        open={deleteOpen}
        title="Удалить страницу?"
        text="Страница и её блоки будут удалены из редакции."
        onClose={() => setDeleteOpen(false)}
        onConfirm={async () => {
          await cmsDelete('pages', id);
          navigate('/admin/pages');
        }}
      />
    </div>
  );
};

export default CmsPageEdit;
