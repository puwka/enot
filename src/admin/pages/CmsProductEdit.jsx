import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { cmsCreate, cmsGet, cmsList, cmsUpdate } from '../cms/cmsApi';
import { PRODUCT_SECTIONS } from '../cms/productSections';
import { getSiteProductBySlug, getSiteBanks, mergeBankItems } from '../cms/siteContent';
import { resolveProductImage } from '../../data/productImages';
import { slugify } from '../cms/cmsConstants';
import { CmsAlert, CmsLoading, StatusBadge } from '../cms/CmsUi';
import '../cms/Cms.css';

const CmsProductEdit = ({ sectionKey }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const section = PRODUCT_SECTIONS[sectionKey];
  const isNew = id === 'new';
  const [item, setItem] = useState(null);
  const [banks, setBanks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    title: '',
    slug: '',
    bank_id: '',
    category_id: '',
    product_type: '',
    apr_rate: '',
    amount_min: '',
    amount_max: '',
    term_min: '',
    term_max: '',
    monthly_payment: '',
    commission: '',
    description: '',
    conditions: '',
    advantages_text: '',
    logo_url: '',
    link: '',
    active: true,
    featured: false,
    status: 'draft',
    sort_order: 0,
  });

  const load = useCallback(async () => {
    if (!section) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    const decodedId = decodeURIComponent(id || '');
    const isSiteId = decodedId.startsWith('site-product:');
    const siteSlug = isSiteId ? decodedId.replace('site-product:', '') : '';
    try {
      const [banksData, categoriesData] = await Promise.all([
        cmsList('banks'),
        cmsList('categories'),
      ]);
      const banksItems = mergeBankItems(banksData?.items || [], getSiteBanks());
      const categoriesItems = (categoriesData?.items || []).filter((entry) => entry.type === 'product');
      setBanks(banksItems);
      setCategories(categoriesItems);
      if (isNew) {
        const selectedCategory = categoriesItems.find((entry) => entry.slug === section.categorySlug);
        setItem(null);
        setForm((prev) => ({
          ...prev,
          category_id: selectedCategory?.id || '',
          status: 'draft',
          active: true,
          featured: false,
        }));
      } else {
        let product = null;
        if (!isSiteId) {
          try {
            product = (await cmsGet('products', decodedId)).item;
          } catch {
            product = null;
          }
        }
        if (!product) {
          product = getSiteProductBySlug(siteSlug || decodedId);
        }
        if (!product) {
          throw new Error('NOT_FOUND');
        }
        setItem(product);
        const matchedBank = banksItems.find((bank) => bank.name === product.bank_name);
        const matchedCategory = categoriesItems.find((entry) =>
          entry.slug === product.category_slug || entry.path === product.catalog_path
        );
        setForm({
          title: product.title || '',
          slug: product.slug || '',
          bank_id: product.bank_id || matchedBank?.id || '',
          category_id: product.category_id || matchedCategory?.id || '',
          product_type: product.product_type || '',
          apr_rate: product.apr_rate ?? '',
          amount_min: product.amount_min ?? '',
          amount_max: product.amount_max ?? '',
          term_min: product.term_min ?? '',
          term_max: product.term_max ?? '',
          monthly_payment: product.monthly_payment ?? '',
          commission: product.commission || '',
          description: product.description || product.rate_label || '',
          conditions: product.conditions || product.term_label || '',
          advantages_text: Array.isArray(product.advantages) ? product.advantages.join('\n') : '',
          logo_url: product.logo_url || product.image_url || '',
          link: product.link || product.partner_url || '',
          active: product.active !== false,
          featured: Boolean(product.featured),
          status: product.status || 'published',
          sort_order: product.sort_order ?? 0,
        });
      }
    } catch {
      setError('Не удалось загрузить продукт.');
    } finally {
      setLoading(false);
    }
  }, [id, isNew, section]);

  useEffect(() => {
    load();
  }, [load]);

  const canSave = useMemo(() => form.title.trim() && form.slug.trim(), [form.title, form.slug]);

  const logoPreview = useMemo(
    () =>
      resolveProductImage({
        slug: form.slug,
        link: form.link,
        logoUrl: form.logo_url,
      }),
    [form.slug, form.link, form.logo_url]
  );

  const onSave = async () => {
    if (!canSave) return;
    setSaving(true);
    setError('');
    try {
      const payload = {
        title: form.title.trim(),
        slug: slugify(form.slug),
        bank_id: form.bank_id && !String(form.bank_id).startsWith('site-') ? form.bank_id : null,
        category_id: form.category_id || null,
        product_type: form.product_type.trim() || null,
        apr_rate: form.apr_rate === '' ? null : Number(form.apr_rate),
        amount_min: form.amount_min === '' ? null : Number(form.amount_min),
        amount_max: form.amount_max === '' ? null : Number(form.amount_max),
        term_min: form.term_min === '' ? null : Number(form.term_min),
        term_max: form.term_max === '' ? null : Number(form.term_max),
        monthly_payment: form.monthly_payment === '' ? null : Number(form.monthly_payment),
        commission: form.commission.trim() || null,
        description: form.description.trim() || null,
        conditions: form.conditions.trim() || null,
        advantages: form.advantages_text.split('\n').map((row) => row.trim()).filter(Boolean),
        logo_url: form.logo_url.trim() || null,
        link: form.link.trim() || null,
        active: Boolean(form.active),
        featured: Boolean(form.featured),
        status: form.status,
        sort_order: Number(form.sort_order || 0),
      };
      if (isNew || String(item?.id || '').startsWith('site-')) {
        const created = await cmsCreate('products', payload);
        navigate(`${section.listPath}/${created?.item?.id || ''}`, { replace: true });
      } else {
        await cmsUpdate('products', id, payload);
        await load();
      }
    } catch {
      setError('Не удалось сохранить продукт.');
    } finally {
      setSaving(false);
    }
  };

  if (!section) {
    return (
      <section className="cms-panel">
        <div className="cms-empty">Раздел не найден.</div>
      </section>
    );
  }

  if (loading) return <CmsLoading />;

  return (
    <div className="cms-dash">
      <section className="cms-panel">
        <div className="cms-toolbar">
          <div className="cms-toolbar__left">
            {!isNew ? <StatusBadge status={item?.status} /> : null}
            <strong>{isNew ? 'Новый продукт' : item?.title}</strong>
          </div>
          <div className="cms-toolbar__right">
            <Link className="admin-btn admin-btn--secondary" to={section.listPath}>
              К списку
            </Link>
            <button type="button" className="admin-btn admin-btn--primary" disabled={!canSave || saving} onClick={onSave}>
              {saving ? 'Сохранение...' : 'Сохранить'}
            </button>
          </div>
        </div>
        <CmsAlert>{error}</CmsAlert>

        <div className="cms-form">
          <div className="cms-form-section">
            <h3 className="cms-form-section__title">Основная информация</h3>
            <div className="cms-form__grid">
              <label className="cms-field">
                <span>Название</span>
                <input value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value, slug: prev.slug || slugify(e.target.value) }))} />
              </label>
              <label className="cms-field">
                <span>Slug</span>
                <input value={form.slug} onChange={(e) => setForm((prev) => ({ ...prev, slug: slugify(e.target.value) }))} />
              </label>
            </div>
            <div className="cms-form__grid">
              <label className="cms-field">
                <span>Банк</span>
                <select value={form.bank_id} onChange={(e) => setForm((prev) => ({ ...prev, bank_id: e.target.value }))}>
                  <option value="">Не выбран</option>
                  {banks.map((bank) => (
                    <option key={bank.id} value={bank.id}>{bank.name}</option>
                  ))}
                </select>
              </label>
              <label className="cms-field">
                <span>Категория</span>
                <select value={form.category_id} onChange={(e) => setForm((prev) => ({ ...prev, category_id: e.target.value }))}>
                  <option value="">Не выбрана</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>{category.title}</option>
                  ))}
                </select>
              </label>
            </div>
            <div className="cms-form__grid">
              <label className="cms-field">
                <span>Тип</span>
                <input value={form.product_type} onChange={(e) => setForm((prev) => ({ ...prev, product_type: e.target.value }))} />
              </label>
              <label className="cms-field">
                <span>Ставка</span>
                <input type="number" step="0.001" value={form.apr_rate} onChange={(e) => setForm((prev) => ({ ...prev, apr_rate: e.target.value }))} />
              </label>
            </div>
          </div>

          <div className="cms-form-section">
            <h3 className="cms-form-section__title">Условия</h3>
            <div className="cms-form__grid">
              <label className="cms-field">
                <span>Сумма от</span>
                <input type="number" value={form.amount_min} onChange={(e) => setForm((prev) => ({ ...prev, amount_min: e.target.value }))} />
              </label>
              <label className="cms-field">
                <span>Сумма до</span>
                <input type="number" value={form.amount_max} onChange={(e) => setForm((prev) => ({ ...prev, amount_max: e.target.value }))} />
              </label>
            </div>
            <div className="cms-form__grid">
              <label className="cms-field">
                <span>Срок от</span>
                <input type="number" value={form.term_min} onChange={(e) => setForm((prev) => ({ ...prev, term_min: e.target.value }))} />
              </label>
              <label className="cms-field">
                <span>Срок до</span>
                <input type="number" value={form.term_max} onChange={(e) => setForm((prev) => ({ ...prev, term_max: e.target.value }))} />
              </label>
            </div>
            <div className="cms-form__grid">
              <label className="cms-field">
                <span>Ежемесячный платеж</span>
                <input type="number" value={form.monthly_payment} onChange={(e) => setForm((prev) => ({ ...prev, monthly_payment: e.target.value }))} />
              </label>
              <label className="cms-field">
                <span>Комиссия</span>
                <input value={form.commission} onChange={(e) => setForm((prev) => ({ ...prev, commission: e.target.value }))} />
              </label>
            </div>
            <label className="cms-field">
              <span>Описание</span>
              <textarea rows={3} value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} />
            </label>
            <label className="cms-field">
              <span>Условия</span>
              <textarea rows={3} value={form.conditions} onChange={(e) => setForm((prev) => ({ ...prev, conditions: e.target.value }))} />
            </label>
            <label className="cms-field">
              <span>Преимущества</span>
              <textarea rows={4} value={form.advantages_text} onChange={(e) => setForm((prev) => ({ ...prev, advantages_text: e.target.value }))} />
            </label>
          </div>

          <div className="cms-form-section">
            <h3 className="cms-form-section__title">Изображение и ссылка</h3>
            <div className="cms-form__grid">
              <label className="cms-field">
                <span>Логотип</span>
                <input value={form.logo_url} onChange={(e) => setForm((prev) => ({ ...prev, logo_url: e.target.value }))} />
                {logoPreview ? (
                  <img
                    src={logoPreview}
                    alt=""
                    style={{ marginTop: 8, width: 64, height: 64, objectFit: 'contain' }}
                  />
                ) : null}
              </label>
              <label className="cms-field">
                <span>Ссылка</span>
                <input value={form.link} onChange={(e) => setForm((prev) => ({ ...prev, link: e.target.value }))} />
              </label>
            </div>
          </div>

          <div className="cms-form-section">
            <h3 className="cms-form-section__title">Публикация</h3>
            <div className="cms-form__grid">
              <label className="cms-field">
                <span>sort_order</span>
                <input type="number" value={form.sort_order} onChange={(e) => setForm((prev) => ({ ...prev, sort_order: e.target.value }))} />
              </label>
              <label className="cms-field">
                <span>Статус</span>
                <select value={form.status} onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}>
                  <option value="draft">draft</option>
                  <option value="published">published</option>
                  <option value="archived">archived</option>
                </select>
              </label>
            </div>
            <div className="cms-form__grid">
              <label className="cms-checkbox">
                <input type="checkbox" checked={form.active} onChange={(e) => setForm((prev) => ({ ...prev, active: e.target.checked }))} />
                <span>active</span>
              </label>
              <label className="cms-checkbox">
                <input type="checkbox" checked={form.featured} onChange={(e) => setForm((prev) => ({ ...prev, featured: e.target.checked }))} />
                <span>featured</span>
              </label>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CmsProductEdit;
