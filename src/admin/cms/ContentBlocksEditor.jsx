import { ARTICLE_BLOCK_TYPES } from './cmsConstants';

const emptyBlock = (type) => {
  if (type === 'ul' || type === 'ol') return { type, items: [''] };
  if (type === 'image') return { type, src: '', alt: '' };
  if (type === 'h2' || type === 'h3') return { type, text: '', id: '' };
  return { type, text: '' };
};

const ContentBlocksEditor = ({ value = [], onChange }) => {
  const blocks = Array.isArray(value) ? value : [];

  const update = (next) => onChange(next);

  const addBlock = (type) => update([...blocks, emptyBlock(type)]);

  const patchBlock = (index, patch) => {
    update(blocks.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  };

  const move = (index, dir) => {
    const target = index + dir;
    if (target < 0 || target >= blocks.length) return;
    const next = [...blocks];
    const tmp = next[index];
    next[index] = next[target];
    next[target] = tmp;
    update(next);
  };

  const remove = (index) => update(blocks.filter((_, i) => i !== index));

  return (
    <div className="cms-blocks">
      <div className="cms-add-row">
        {ARTICLE_BLOCK_TYPES.map((item) => (
          <button key={item.value} type="button" className="admin-btn admin-btn--ghost" onClick={() => addBlock(item.value)}>
            + {item.label}
          </button>
        ))}
      </div>
      {!blocks.length ? (
        <div className="cms-dash-empty">
          <p>Блоков пока нет — нажмите тип блока выше.</p>
        </div>
      ) : null}
      {blocks.map((block, index) => (
        <div key={`${block.type}-${index}`} className="cms-block">
          <div className="cms-block__head">
            <span className="cms-block__title">
              {ARTICLE_BLOCK_TYPES.find((item) => item.value === block.type)?.label || block.type}
            </span>
            <div className="cms-block__tools">
              <button type="button" className="admin-btn admin-btn--ghost" onClick={() => move(index, -1)}>
                ↑
              </button>
              <button type="button" className="admin-btn admin-btn--ghost" onClick={() => move(index, 1)}>
                ↓
              </button>
              <button type="button" className="admin-btn admin-btn--ghost" onClick={() => remove(index)}>
                Удалить
              </button>
            </div>
          </div>

          {block.type === 'image' ? (
            <div className="cms-form__grid">
              <label className="cms-field">
                <span>URL изображения</span>
                <input value={block.src || ''} onChange={(e) => patchBlock(index, { src: e.target.value })} />
              </label>
              <label className="cms-field">
                <span>Подпись</span>
                <input value={block.alt || ''} onChange={(e) => patchBlock(index, { alt: e.target.value })} />
              </label>
            </div>
          ) : null}

          {block.type === 'ul' || block.type === 'ol' ? (
            <label className="cms-field">
              <span>Пункты (каждый с новой строки)</span>
              <textarea
                value={(block.items || []).join('\n')}
                onChange={(e) =>
                  patchBlock(index, {
                    items: e.target.value.split('\n'),
                  })
                }
              />
            </label>
          ) : null}

          {['p', 'h2', 'h3', 'quote', 'warning'].includes(block.type) ? (
            <label className="cms-field">
              <span>Текст</span>
              <textarea
                value={block.text || ''}
                onChange={(e) => patchBlock(index, { text: e.target.value })}
              />
            </label>
          ) : null}
        </div>
      ))}
    </div>
  );
};

export const renderContentPreview = (blocks = []) =>
  (blocks || []).map((block, index) => {
    if (block.type === 'h2') return <h2 key={index}>{block.text}</h2>;
    if (block.type === 'h3') return <h3 key={index}>{block.text}</h3>;
    if (block.type === 'quote') return <blockquote key={index}>{block.text}</blockquote>;
    if (block.type === 'warning')
      return (
        <div key={index} className="cms-preview__warning">
          {block.text}
        </div>
      );
    if (block.type === 'image')
      return block.src ? <img key={index} src={block.src} alt={block.alt || ''} /> : null;
    if (block.type === 'ul')
      return (
        <ul key={index}>
          {(block.items || []).filter(Boolean).map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      );
    if (block.type === 'ol')
      return (
        <ol key={index}>
          {(block.items || []).filter(Boolean).map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ol>
      );
    return <p key={index}>{block.text}</p>;
  });

export default ContentBlocksEditor;
