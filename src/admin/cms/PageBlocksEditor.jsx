import { PAGE_BLOCK_TYPES } from './cmsConstants';

const emptyPayload = (type) => {
  if (type === 'cards') return { items: [{ title: '', text: '' }] };
  if (type === 'cta') return { buttonLabel: 'Подробнее', buttonUrl: '/' };
  if (type === 'faq') return { items: [{ q: '', a: '' }] };
  if (type === 'table') return { headers: ['Колонка 1', 'Колонка 2'], rows: [['', '']] };
  if (type === 'list') return { items: [''] };
  if (type === 'image') return { src: '', alt: '' };
  if (type === 'hero') return { eyebrow: '', buttonLabel: '', buttonUrl: '' };
  return {};
};

const PageBlocksEditor = ({ blocks = [], onChange, onPersistOrder, onHide, onShow, onDelete, onSaveBlock }) => {
  const list = Array.isArray(blocks) ? blocks : [];

  const patchLocal = (index, patch) => {
    onChange(list.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  };

  const move = async (index, dir) => {
    const target = index + dir;
    if (target < 0 || target >= list.length) return;
    const next = [...list];
    const tmp = next[index];
    next[index] = next[target];
    next[target] = tmp;
    const ordered = next.map((item, i) => ({ ...item, sort_order: i * 10 }));
    onChange(ordered);
    if (onPersistOrder) {
      await onPersistOrder(ordered.map((item, i) => ({ id: item.id, sort_order: i * 10 })));
    }
  };

  return (
    <div className="cms-blocks">
      {list.map((block, index) => (
        <div key={block.id || index} className={`cms-block${block.is_hidden ? ' is-hidden' : ''}`}>
          <div className="cms-block__head">
            <span className="cms-block__title">
              {PAGE_BLOCK_TYPES.find((item) => item.value === block.block_type)?.label || block.block_type}
              {block.is_hidden ? ' · скрыт' : ''}
            </span>
            <div className="cms-block__tools">
              <button type="button" className="admin-btn admin-btn--ghost" onClick={() => move(index, -1)}>
                ↑
              </button>
              <button type="button" className="admin-btn admin-btn--ghost" onClick={() => move(index, 1)}>
                ↓
              </button>
              {block.is_hidden ? (
                <button type="button" className="admin-btn admin-btn--ghost" onClick={() => onShow(block.id)}>
                  Показать
                </button>
              ) : (
                <button type="button" className="admin-btn admin-btn--ghost" onClick={() => onHide(block.id)}>
                  Скрыть
                </button>
              )}
              <button type="button" className="admin-btn admin-btn--ghost" onClick={() => onSaveBlock(block)}>
                Сохранить блок
              </button>
              <button type="button" className="admin-btn admin-btn--ghost" onClick={() => onDelete(block.id)}>
                Удалить
              </button>
            </div>
          </div>

          <div className="cms-form__grid">
            <label className="cms-field">
              <span>Заголовок</span>
              <input
                value={block.title || ''}
                onChange={(e) => patchLocal(index, { title: e.target.value })}
              />
            </label>
            <label className="cms-field">
              <span>Тип</span>
              <input value={block.block_type || ''} readOnly />
            </label>
          </div>

          <label className="cms-field">
            <span>Текст</span>
            <textarea
              value={block.body || ''}
              onChange={(e) => patchLocal(index, { body: e.target.value })}
            />
          </label>

          {block.block_type === 'image' || block.block_type === 'hero' ? (
            <div className="cms-form__grid">
              <label className="cms-field">
                <span>URL изображения</span>
                <input
                  value={block.payload?.src || ''}
                  onChange={(e) =>
                    patchLocal(index, { payload: { ...(block.payload || {}), src: e.target.value } })
                  }
                />
              </label>
              <label className="cms-field">
                <span>Кнопка / подпись</span>
                <input
                  value={block.payload?.buttonLabel || block.payload?.alt || ''}
                  onChange={(e) =>
                    patchLocal(index, {
                      payload: {
                        ...(block.payload || {}),
                        buttonLabel: e.target.value,
                        alt: e.target.value,
                      },
                    })
                  }
                />
              </label>
            </div>
          ) : null}

          {block.block_type === 'cta' ? (
            <div className="cms-form__grid">
              <label className="cms-field">
                <span>Текст кнопки</span>
                <input
                  value={block.payload?.buttonLabel || ''}
                  onChange={(e) =>
                    patchLocal(index, { payload: { ...(block.payload || {}), buttonLabel: e.target.value } })
                  }
                />
              </label>
              <label className="cms-field">
                <span>Ссылка</span>
                <input
                  value={block.payload?.buttonUrl || ''}
                  onChange={(e) =>
                    patchLocal(index, { payload: { ...(block.payload || {}), buttonUrl: e.target.value } })
                  }
                />
              </label>
            </div>
          ) : null}

          {['cards', 'faq', 'list'].includes(block.block_type) ? (
            <label className="cms-field">
              <span>
                {block.block_type === 'list'
                  ? 'Пункты списка (с новой строки)'
                  : 'Элементы JSON (редактируйте поля ниже как текст строк)'}
              </span>
              <textarea
                value={
                  block.block_type === 'list'
                    ? (block.payload?.items || []).join('\n')
                    : (block.payload?.items || [])
                        .map((item) =>
                          block.block_type === 'faq'
                            ? `${item.q || ''} | ${item.a || ''}`
                            : `${item.title || ''} | ${item.text || ''}`
                        )
                        .join('\n')
                }
                onChange={(e) => {
                  const lines = e.target.value.split('\n');
                  if (block.block_type === 'list') {
                    patchLocal(index, { payload: { ...(block.payload || {}), items: lines } });
                    return;
                  }
                  const items = lines.map((line) => {
                    const [left, ...rest] = line.split('|');
                    const right = rest.join('|').trim();
                    if (block.block_type === 'faq') return { q: (left || '').trim(), a: right };
                    return { title: (left || '').trim(), text: right };
                  });
                  patchLocal(index, { payload: { ...(block.payload || {}), items } });
                }}
              />
            </label>
          ) : null}

          {block.block_type === 'table' ? (
            <label className="cms-field">
              <span>Таблица (первая строка — заголовки, ячейки через |)</span>
              <textarea
                value={[
                  (block.payload?.headers || []).join(' | '),
                  ...((block.payload?.rows || []).map((row) => (row || []).join(' | ')) || []),
                ].join('\n')}
                onChange={(e) => {
                  const lines = e.target.value.split('\n').filter((line) => line.length);
                  const headers = (lines[0] || '').split('|').map((cell) => cell.trim());
                  const rows = lines.slice(1).map((line) => line.split('|').map((cell) => cell.trim()));
                  patchLocal(index, { payload: { ...(block.payload || {}), headers, rows } });
                }}
              />
            </label>
          ) : null}
        </div>
      ))}
    </div>
  );
};

export const createEmptyPageBlock = (type) => ({
  block_type: type,
  title: '',
  body: '',
  payload: emptyPayload(type),
  status: 'published',
  sort_order: 0,
  is_hidden: false,
});

export const renderPageBlocksPreview = (blocks = []) =>
  (blocks || [])
    .filter((block) => !block.is_hidden)
    .map((block, index) => {
      if (block.block_type === 'hero') {
        return (
          <div key={index} className="cms-preview__hero">
            {block.payload?.eyebrow ? <p>{block.payload.eyebrow}</p> : null}
            <h2>{block.title || 'Hero'}</h2>
            <p>{block.body}</p>
          </div>
        );
      }
      if (block.block_type === 'warning') {
        return (
          <div key={index} className="cms-preview__warning">
            <strong>{block.title}</strong>
            <p>{block.body}</p>
          </div>
        );
      }
      if (block.block_type === 'cta') {
        return (
          <div key={index}>
            <h3>{block.title}</h3>
            <p>{block.body}</p>
            <span className="cms-preview__cta">{block.payload?.buttonLabel || 'CTA'}</span>
          </div>
        );
      }
      if (block.block_type === 'image' && block.payload?.src) {
        return <img key={index} src={block.payload.src} alt={block.payload.alt || block.title || ''} />;
      }
      if (block.block_type === 'list') {
        return (
          <div key={index}>
            {block.title ? <h3>{block.title}</h3> : null}
            <ul>
              {(block.payload?.items || []).filter(Boolean).map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        );
      }
      return (
        <div key={index}>
          {block.title ? <h3>{block.title}</h3> : null}
          {block.body ? <p>{block.body}</p> : null}
        </div>
      );
    });

export default PageBlocksEditor;
