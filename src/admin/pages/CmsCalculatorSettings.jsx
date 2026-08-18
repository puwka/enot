import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAdminAuth } from '../AdminAuthContext';
import { cmsCreate, cmsDelete, cmsList, cmsUpdate } from '../cms/cmsApi';
import { CmsAlert, CmsLoading, ConfirmDialog, StatusBadge } from '../cms/CmsUi';
import '../cms/Cms.css';

const emptyForm = {
  id: '',
  key: 'loan',
  title: 'Калькулятор кредита',
  min_amount: 50000,
  max_amount: 5000000,
  min_term: 6,
  max_term: 84,
  rate: 0.008,
  default_amount: 500000,
  default_term: 36,
  default_purpose: 'Любая цель',
  purposes_text: 'Любая цель\nПотребительский кредит\nРефинансирование\nКредитная карта',
  formula: 'simple_interest',
  formula_locked: true,
  status: 'published',
  sort_order: 0,
};

const CmsCalculatorSettings = () => {
  const { role } = useAdminAuth();
  const canEditFormula = role === 'SUPERADMIN';
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [deleteId, setDeleteId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await cmsList('calculator_configs');
      setItems(data?.items || []);
    } catch {
      setItems([]);
      setError('Не удалось загрузить параметры калькуляторов.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onSave = async () => {
    setSaving(true);
    setError('');
    try {
      const payload = {
        key: form.key.trim(),
        title: form.title.trim(),
        min_amount: Number(form.min_amount),
        max_amount: Number(form.max_amount),
        min_term: Number(form.min_term),
        max_term: Number(form.max_term),
        rate: Number(form.rate),
        default_amount: Number(form.default_amount),
        default_term: Number(form.default_term),
        default_purpose: form.default_purpose.trim() || null,
        purposes: form.purposes_text.split('\n').map((row) => row.trim()).filter(Boolean),
        formula_locked: Boolean(form.formula_locked),
        status: form.status,
        sort_order: Number(form.sort_order || 0),
      };
      if (canEditFormula) {
        payload.formula = form.formula.trim() || 'simple_interest';
      }
      if (form.id) {
        await cmsUpdate('calculator_configs', form.id, payload);
      } else {
        await cmsCreate('calculator_configs', payload);
      }
      setForm(emptyForm);
      await load();
    } catch {
      setError('Не удалось сохранить параметры калькулятора.');
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    try {
      await cmsDelete('calculator_configs', deleteId);
      setDeleteId(null);
      await load();
    } catch {
      setError('Не удалось удалить параметры калькулятора.');
      setDeleteId(null);
    }
  };

  const canSubmit = useMemo(() => form.key.trim() && form.title.trim(), [form.key, form.title]);

  if (loading) return <CmsLoading />;

  return (
    <div className="cms-panel">
      <div className="cms-toolbar">
        <div className="cms-toolbar__left">
          <strong>Параметры калькуляторов</strong>
          <span className="cms-muted">{items.length}</span>
        </div>
      </div>
      <CmsAlert>{error}</CmsAlert>
      <div className="cms-form" style={{ marginBottom: 18 }}>
        <div className="cms-form__grid">
          <label className="cms-field">
            <span>key</span>
            <input value={form.key} onChange={(e) => setForm((prev) => ({ ...prev, key: e.target.value }))} />
          </label>
          <label className="cms-field">
            <span>Название</span>
            <input value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} />
          </label>
        </div>
        <div className="cms-form__grid">
          <label className="cms-field">
            <span>min amount</span>
            <input type="number" value={form.min_amount} onChange={(e) => setForm((prev) => ({ ...prev, min_amount: e.target.value }))} />
          </label>
          <label className="cms-field">
            <span>max amount</span>
            <input type="number" value={form.max_amount} onChange={(e) => setForm((prev) => ({ ...prev, max_amount: e.target.value }))} />
          </label>
        </div>
        <div className="cms-form__grid">
          <label className="cms-field">
            <span>min term</span>
            <input type="number" value={form.min_term} onChange={(e) => setForm((prev) => ({ ...prev, min_term: e.target.value }))} />
          </label>
          <label className="cms-field">
            <span>max term</span>
            <input type="number" value={form.max_term} onChange={(e) => setForm((prev) => ({ ...prev, max_term: e.target.value }))} />
          </label>
        </div>
        <div className="cms-form__grid">
          <label className="cms-field">
            <span>rate</span>
            <input type="number" step="0.0001" value={form.rate} onChange={(e) => setForm((prev) => ({ ...prev, rate: e.target.value }))} />
          </label>
          <label className="cms-field">
            <span>default values</span>
            <div className="cms-form__grid">
              <input type="number" value={form.default_amount} onChange={(e) => setForm((prev) => ({ ...prev, default_amount: e.target.value }))} />
              <input type="number" value={form.default_term} onChange={(e) => setForm((prev) => ({ ...prev, default_term: e.target.value }))} />
            </div>
          </label>
        </div>
        <label className="cms-field">
          <span>цели кредита</span>
          <textarea rows={4} value={form.purposes_text} onChange={(e) => setForm((prev) => ({ ...prev, purposes_text: e.target.value }))} />
        </label>
        <label className="cms-field">
          <span>default purpose</span>
          <input value={form.default_purpose} onChange={(e) => setForm((prev) => ({ ...prev, default_purpose: e.target.value }))} />
        </label>
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
        <div className="cms-form__grid">
          <label className="cms-checkbox">
            <input type="checkbox" checked={form.formula_locked} onChange={(e) => setForm((prev) => ({ ...prev, formula_locked: e.target.checked }))} />
            <span>formula_locked</span>
          </label>
          <label className="cms-field">
            <span>formula</span>
            <input
              value={form.formula}
              readOnly={!canEditFormula}
              onChange={(e) => setForm((prev) => ({ ...prev, formula: e.target.value }))}
            />
          </label>
        </div>
        <div className="cms-toolbar__right">
          <button type="button" className="admin-btn admin-btn--primary" onClick={onSave} disabled={!canSubmit || saving}>
            {saving ? 'Сохранение...' : form.id ? 'Сохранить' : 'Добавить'}
          </button>
          {form.id ? (
            <button type="button" className="admin-btn admin-btn--ghost" onClick={() => setForm(emptyForm)}>
              Отмена
            </button>
          ) : null}
        </div>
      </div>

      <table className="cms-table">
        <thead>
          <tr>
            <th>key</th>
            <th>Название</th>
            <th>Rate</th>
            <th>Диапазон</th>
            <th>Статус</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>{item.key}</td>
              <td>{item.title}</td>
              <td>{item.rate}</td>
              <td>{`${item.min_amount} - ${item.max_amount} / ${item.min_term}-${item.max_term}`}</td>
              <td><StatusBadge status={item.status} /></td>
              <td>
                <div className="cms-table__actions">
                  <button
                    type="button"
                    className="admin-btn admin-btn--ghost"
                    onClick={() => setForm({
                      id: item.id,
                      key: item.key || '',
                      title: item.title || '',
                      min_amount: item.min_amount ?? 50000,
                      max_amount: item.max_amount ?? 5000000,
                      min_term: item.min_term ?? 6,
                      max_term: item.max_term ?? 84,
                      rate: item.rate ?? 0.008,
                      default_amount: item.default_amount ?? 500000,
                      default_term: item.default_term ?? 36,
                      default_purpose: item.default_purpose || '',
                      purposes_text: Array.isArray(item.purposes) ? item.purposes.join('\n') : '',
                      formula: item.formula || 'simple_interest',
                      formula_locked: Boolean(item.formula_locked),
                      status: item.status || 'published',
                      sort_order: item.sort_order ?? 0,
                    })}
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
      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Удалить параметры калькулятора?"
        text="Запись будет скрыта из CMS."
        onClose={() => setDeleteId(null)}
        onConfirm={onDelete}
      />
    </div>
  );
};

export default CmsCalculatorSettings;
