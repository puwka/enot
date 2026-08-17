import { useMemo, useState } from 'react';
import { getSiteBanks } from '../cms/siteContent';
import { StatusBadge } from '../cms/CmsUi';
import '../cms/Cms.css';

const CmsBanksList = () => {
  const [query, setQuery] = useState('');
  const items = useMemo(() => {
    const list = getSiteBanks();
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter((item) => item.name.toLowerCase().includes(q) || item.slug.includes(q));
  }, [query]);

  return (
    <div className="cms-panel">
      <div className="cms-toolbar">
        <div className="cms-toolbar__left">
          <strong>Банки</strong>
          <span className="cms-muted">{items.length}</span>
        </div>
        <input
          className="cms-input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Поиск…"
          style={{ minWidth: 180 }}
        />
      </div>
      <p className="cms-panel__lead" style={{ marginTop: 0 }}>
        Справочник банков и брендов из текущего каталога предложений.
      </p>
      <table className="cms-table">
        <thead>
          <tr>
            <th>Логотип</th>
            <th>Название</th>
            <th>Slug</th>
            <th>Продуктов</th>
            <th>Статус</th>
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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CmsBanksList;
