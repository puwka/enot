import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { cmsCreate, cmsGet, cmsList, cmsUpdate } from '../cms/cmsApi';
import { PRODUCT_SECTIONS } from '../cms/productSections';
import { getSiteProductBySlug, getSiteBanks, mergeBankItems } from '../cms/siteContent';
import { resolveProductImage } from '../../data/productImages';
import { slugify, ensureProductSlug } from '../cms/cmsConstants';
import CmsImageUpload from '../cms/CmsImageUpload';
import { CmsAlert, CmsLoading, StatusBadge } from '../cms/CmsUi';
import { TERM_UNITS, normalizeTermUnit } from '../../utils/termUnit';
import '../cms/Cms.css';

const emptyConditions = (fields = []) =>
  Object.fromEntries(fields.map((field) => [field.key, '']));

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
    term_unit: 'month',
    monthly_payment: '',
    commission: '',
    description: '',
    conditions_text: '',
    advantages_text: '',
    main_info: '',
    lead: '',
    education_format: '',
    education_start: '',
    condition_values: {},
    logo_url: '',
    link: '',
    active: true,
    featured: false,
    status: 'published',
    sort_order: 0,
  });

  const formVariant = section?.formVariant || 'loan';
  const isLoanLike = formVariant === 'loan' || formVariant === 'card';
  const conditionFields = section?.conditionFields || [];
  const descriptionLabel = section?.descriptionLabel || 'Описание';
  const showAdvantagesField =
    section?.showAdvantages || section?.specsMode === 'advantages' || formVariant === 'loan';
  const typeLabel =
    sectionKey === 'jobs'
      ? 'Направление'
      : sectionKey === 'services'
        ? 'Категория'
        : sectionKey === 'obuchenie'
          ? 'Направление'
          : sectionKey === 'shops'
            ? 'Тип'
            : 'Тип продукта';

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
      const [banksData, categoriesData] = await Promise.all([cmsList('banks'), cmsList('categories')]);
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
          condition_values: emptyConditions(section.conditionFields || []),
          term_unit: normalizeTermUnit(section.defaultTermUnit, 'month'),
          status: 'published',
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
        const matchedCategory = categoriesItems.find(
          (entry) => entry.slug === product.category_slug || entry.path === product.catalog_path
        );
        const attrs = product.attributes && typeof product.attributes === 'object' ? product.attributes : {};
        const conditionValues = {
          ...emptyConditions(section.conditionFields || []),
          ...(attrs.conditions || {}),
        };
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
          term_unit: normalizeTermUnit(attrs.term_unit, section.defaultTermUnit || 'month'),
          monthly_payment: product.monthly_payment ?? '',
          commission: product.commission || '',
          description: product.description || '',
          conditions_text: product.conditions || attrs.conditions_text || '',
          advantages_text: Array.isArray(product.advantages) ? product.advantages.join('\n') : '',
          main_info: attrs.main_info || '',
          lead: attrs.lead || '',
          education_format: attrs.education_format || '',
          education_start: attrs.education_start || '',
          condition_values: conditionValues,
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

  const canSave = useMemo(() => Boolean(form.title.trim()), [form.title]);

  const logoPreview = useMemo(
    () =>
      resolveProductImage({
        slug: form.slug,
        link: form.link,
        logoUrl: form.logo_url,
      }),
    [form.slug, form.link, form.logo_url]
  );

  const setConditionValue = (key, value) => {
    setForm((prev) => ({
      ...prev,
      condition_values: { ...prev.condition_values, [key]: value },
    }));
  };

  const onSave = async () => {
    if (!canSave) return;
    setSaving(true);
    setError('');
    try {
      const allowedSlugs = section?.categorySlugs || [section?.categorySlug].filter(Boolean);
      let categoryId = form.category_id || null;
      const sectionCategory = categories.find((entry) => entry.slug === section?.categorySlug);
      if (!isLoanLike) {
        categoryId = sectionCategory?.id || categoryId;
      } else if (categoryId) {
        const selected = categories.find((entry) => entry.id === categoryId);
        if (selected && allowedSlugs.length && !allowedSlugs.includes(selected.slug)) {
          categoryId = sectionCategory?.id || categoryId;
        }
      } else {
        categoryId = sectionCategory?.id || null;
      }
      if (!categoryId) {
        setError('Не выбрана категория раздела. Проверьте категории в админке или выполните миграции БД.');
        setSaving(false);
        return;
      }

      let slug = ensureProductSlug(form.slug, form.title);
      let advantages = form.advantages_text
        .split('\n')
        .map((row) => row.trim())
        .filter(Boolean);
      let productType = form.product_type.trim() || null;

      const attributes = {
        conditions: form.condition_values || {},
        main_info: form.main_info.trim(),
        lead: form.lead.trim(),
        education_format: form.education_format.trim(),
        education_start: form.education_start.trim(),
        conditions_text: form.conditions_text.trim(),
        term_unit: normalizeTermUnit(form.term_unit, section?.defaultTermUnit || 'month'),
      };

      if (sectionKey === 'shops') {
        const cond = form.condition_values || {};
        productType = cond.shop_category || productType;
        advantages = [cond.shop_activity, cond.shop_region].filter(Boolean);
      }

      const payload = {
        title: form.title.trim(),
        slug,
        bank_id: form.bank_id && !String(form.bank_id).startsWith('site-') ? form.bank_id : null,
        category_id: categoryId,
        product_type: productType,
        apr_rate: form.apr_rate === '' || form.apr_rate == null ? null : Number(form.apr_rate),
        amount_min: form.amount_min === '' || form.amount_min == null ? null : Number(form.amount_min),
        amount_max: form.amount_max === '' || form.amount_max == null ? null : Number(form.amount_max),
        term_min: form.term_min === '' || form.term_min == null ? null : Number(form.term_min),
        term_max: form.term_max === '' || form.term_max == null ? null : Number(form.term_max),
        monthly_payment:
          form.monthly_payment === '' || form.monthly_payment == null ? null : Number(form.monthly_payment),
        commission: form.commission.trim() || null,
        description: form.description.trim() || null,
        conditions: section?.freeformConditions ? form.conditions_text.trim() || null : null,
        advantages,
        attributes,
        logo_url: form.logo_url.trim() || null,
        link: form.link.trim() || 'https://example.com',
        partner_url: form.link.trim() || 'https://example.com',
        active: Boolean(form.active),
        featured: Boolean(form.featured),
        status: form.status || 'published',
        sort_order: Number(form.sort_order || 0),
      };

      const saveOnce = async (nextSlug) => {
        const body = { ...payload, slug: nextSlug };
        if (isNew || String(item?.id || '').startsWith('site-')) {
          return cmsCreate('products', body);
        }
        await cmsUpdate('products', id, body);
        return null;
      };

      try {
        const created = await saveOnce(slug);
        if (created) {
          navigate(`${section.listPath}/${created?.item?.id || ''}`, { replace: true });
        } else {
          await load();
        }
      } catch (firstErr) {
        if (firstErr?.code === 'SLUG_EXISTS') {
          slug = `${slug}-${Date.now().toString(36).slice(-4)}`;
          setForm((prev) => ({ ...prev, slug }));
          const created = await saveOnce(slug);
          if (created) {
            navigate(`${section.listPath}/${created?.item?.id || ''}`, { replace: true });
          } else {
            await load();
          }
        } else {
          throw firstErr;
        }
      }
    } catch (err) {
      if (err?.code === 'SLUG_EXISTS') {
        setError('Такой slug уже занят. Измените адрес (slug) — он должен быть уникальным.');
      } else if (err?.message && !/REQUEST_FAILED/i.test(err.message)) {
        setError(err.message);
      } else {
        setError('Не удалось сохранить продукт. Проверьте slug (латиницей, уникальный) и категорию.');
      }
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
                <input
                  value={form.title}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      title: e.target.value,
                      slug:
                        isNew && (!prev.slug || prev.slug === slugify(prev.title))
                          ? slugify(e.target.value)
                          : prev.slug || slugify(e.target.value),
                    }))
                  }
                />
              </label>
              <label className="cms-field">
                <span>Slug (латиницей, уникальный адрес)</span>
                <input
                  value={form.slug}
                  placeholder="naprimer-product"
                  onChange={(e) => setForm((prev) => ({ ...prev, slug: slugify(e.target.value) }))}
                />
              </label>
            </div>

            {isLoanLike ? (
              <div className="cms-form__grid">
                <label className="cms-field">
                  <span>Банк</span>
                  <select value={form.bank_id} onChange={(e) => setForm((prev) => ({ ...prev, bank_id: e.target.value }))}>
                    <option value="">Не выбран</option>
                    {banks.map((bank) => (
                      <option key={bank.id} value={bank.id}>
                        {bank.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="cms-field">
                  <span>Категория</span>
                  <select
                    value={form.category_id}
                    onChange={(e) => setForm((prev) => ({ ...prev, category_id: e.target.value }))}
                  >
                    <option value="">Не выбрана</option>
                    {categories
                      .filter((category) => (section.categorySlugs || [section.categorySlug]).includes(category.slug))
                      .map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.title}
                        </option>
                      ))}
                  </select>
                </label>
              </div>
            ) : (
              <label className="cms-field">
                <span>Категория раздела</span>
                <select value={form.category_id} onChange={(e) => setForm((prev) => ({ ...prev, category_id: e.target.value }))}>
                  <option value="">Не выбрана</option>
                  {categories
                    .filter((category) => (section.categorySlugs || [section.categorySlug]).includes(category.slug))
                    .map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.title}
                      </option>
                    ))}
                </select>
              </label>
            )}

            <div className="cms-form__grid">
              <label className="cms-field">
                <span>{typeLabel}</span>
                <input
                  value={form.product_type}
                  onChange={(e) => setForm((prev) => ({ ...prev, product_type: e.target.value }))}
                />
              </label>
              {formVariant === 'loan' ? (
                <label className="cms-field">
                  <span>Ставка (%)</span>
                  <input
                    type="number"
                    step="0.001"
                    value={form.apr_rate}
                    onChange={(e) => setForm((prev) => ({ ...prev, apr_rate: e.target.value }))}
                  />
                </label>
              ) : null}
            </div>

            {formVariant === 'education' ? (
              <div className="cms-form__grid">
                <label className="cms-field">
                  <span>Формат обучения</span>
                  <input
                    value={form.education_format}
                    placeholder="Онлайн / очно / смешанный"
                    onChange={(e) => setForm((prev) => ({ ...prev, education_format: e.target.value }))}
                  />
                </label>
                <label className="cms-field">
                  <span>Старт</span>
                  <input
                    value={form.education_start}
                    placeholder="В любое время / по набору"
                    onChange={(e) => setForm((prev) => ({ ...prev, education_start: e.target.value }))}
                  />
                </label>
              </div>
            ) : null}

            <label className="cms-field">
              <span>Подзаголовок под названием (на странице продукта)</span>
              <input
                value={form.lead}
                placeholder="Короткий текст под заголовком"
                onChange={(e) => setForm((prev) => ({ ...prev, lead: e.target.value }))}
              />
            </label>
          </div>

          {formVariant === 'loan' ? (
            <div className="cms-form-section">
              <h3 className="cms-form-section__title">Финансовые параметры</h3>
              <div className="cms-form__grid">
                <label className="cms-field">
                  <span>Сумма от</span>
                  <input
                    type="number"
                    value={form.amount_min}
                    onChange={(e) => setForm((prev) => ({ ...prev, amount_min: e.target.value }))}
                  />
                </label>
                <label className="cms-field">
                  <span>Сумма до</span>
                  <input
                    type="number"
                    value={form.amount_max}
                    onChange={(e) => setForm((prev) => ({ ...prev, amount_max: e.target.value }))}
                  />
                </label>
              </div>
              <div className="cms-form__grid">
                <label className="cms-field">
                  <span>Срок от</span>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={form.term_min}
                    onChange={(e) => setForm((prev) => ({ ...prev, term_min: e.target.value }))}
                  />
                </label>
                <label className="cms-field">
                  <span>Срок до</span>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={form.term_max}
                    onChange={(e) => setForm((prev) => ({ ...prev, term_max: e.target.value }))}
                  />
                </label>
              </div>
              <label className="cms-field">
                <span>Единица срока</span>
                <select
                  value={form.term_unit}
                  onChange={(e) => setForm((prev) => ({ ...prev, term_unit: e.target.value }))}
                >
                  {TERM_UNITS.map((unit) => (
                    <option key={unit.value} value={unit.value}>
                      {unit.label} (от 1)
                    </option>
                  ))}
                </select>
              </label>
              <div className="cms-form__grid">
                <label className="cms-field">
                  <span>Ежемесячный платёж</span>
                  <input
                    type="number"
                    value={form.monthly_payment}
                    onChange={(e) => setForm((prev) => ({ ...prev, monthly_payment: e.target.value }))}
                  />
                </label>
                <label className="cms-field">
                  <span>Комиссия</span>
                  <input value={form.commission} onChange={(e) => setForm((prev) => ({ ...prev, commission: e.target.value }))} />
                </label>
              </div>
            </div>
          ) : null}

          <div className="cms-form-section">
            <h3 className="cms-form-section__title">Контент на сайте</h3>
            <label className="cms-field">
              <span>{descriptionLabel} → блок «Основная информация»</span>
              <textarea
                rows={4}
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              />
            </label>

            {showAdvantagesField ? (
              <label className="cms-field">
                <span>
                  {section?.showAdvantages
                    ? 'Преимущества (каждое с новой строки)'
                    : 'Преимущества в верхних прямоугольниках (каждое с новой строки)'}
                </span>
                <textarea
                  rows={4}
                  value={form.advantages_text}
                  onChange={(e) => setForm((prev) => ({ ...prev, advantages_text: e.target.value }))}
                />
              </label>
            ) : null}

            {section?.showBottomMainInfo ? (
              <label className="cms-field">
                <span>Основная информация (нижний блок, свободная форма)</span>
                <textarea
                  rows={4}
                  value={form.main_info}
                  onChange={(e) => setForm((prev) => ({ ...prev, main_info: e.target.value }))}
                />
              </label>
            ) : null}
          </div>

          {section?.showConditions || section?.freeformConditions || conditionFields.length ? (
            <div className="cms-form-section">
              <h3 className="cms-form-section__title">
                {sectionKey === 'shops' ? 'Параметры в прямоугольниках' : 'Условия'}
              </h3>
              {section?.freeformConditions ? (
                <label className="cms-field">
                  <span>Условия банка (свободная форма)</span>
                  <textarea
                    rows={5}
                    value={form.conditions_text}
                    onChange={(e) => setForm((prev) => ({ ...prev, conditions_text: e.target.value }))}
                  />
                </label>
              ) : (
                conditionFields.map((field) => (
                  <label key={field.key} className="cms-field">
                    <span>{field.label}</span>
                    <input
                      value={form.condition_values?.[field.key] || ''}
                      onChange={(e) => setConditionValue(field.key, e.target.value)}
                    />
                  </label>
                ))
              )}
            </div>
          ) : null}

          <div className="cms-form-section">
            <h3 className="cms-form-section__title">Изображение и ссылка</h3>
            <div className="cms-form__grid">
              <CmsImageUpload
                label="Логотип / изображение"
                value={form.logo_url}
                previewFallback={logoPreview && logoPreview !== form.logo_url ? logoPreview : ''}
                onChange={(url) => setForm((prev) => ({ ...prev, logo_url: url }))}
              />
              <label className="cms-field">
                <span>Ссылка на партнёра</span>
                <input value={form.link} onChange={(e) => setForm((prev) => ({ ...prev, link: e.target.value }))} />
              </label>
            </div>
          </div>

          <div className="cms-form-section">
            <h3 className="cms-form-section__title">Публикация</h3>
            <div className="cms-form__grid">
              <label className="cms-field">
                <span>Порядок сортировки</span>
                <input
                  type="number"
                  value={form.sort_order}
                  onChange={(e) => setForm((prev) => ({ ...prev, sort_order: e.target.value }))}
                />
              </label>
              <label className="cms-field">
                <span>Статус</span>
                <select value={form.status} onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}>
                  <option value="draft">Черновик</option>
                  <option value="published">Опубликовано</option>
                  <option value="archived">В архиве</option>
                </select>
              </label>
            </div>
            <div className="cms-form__grid">
              <label className="cms-checkbox">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) => setForm((prev) => ({ ...prev, active: e.target.checked }))}
                />
                <span>Показывать на сайте</span>
              </label>
              <label className="cms-checkbox">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) => setForm((prev) => ({ ...prev, featured: e.target.checked }))}
                />
                <span>В избранных / топе</span>
              </label>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CmsProductEdit;
