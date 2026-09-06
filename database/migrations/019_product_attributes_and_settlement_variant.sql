-- Settlement accounts: correct category variant (not debit card)
UPDATE public.categories
SET
  variant = 'settlement',
  title = 'Расчётные счета',
  cta_label = 'Открыть счёт',
  updated_at = timezone('utc', now())
WHERE type = 'product' AND slug = 'settlement-accounts';

-- Persist structured product attributes (conditions, main_info, education/shop fields)
CREATE OR REPLACE FUNCTION public.admin_products_cms(
  p_token text,
  p_action text,
  p_entity text,
  p_id uuid DEFAULT NULL,
  p_data jsonb DEFAULT '{}'::jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_action text := lower(trim(coalesce(p_action, '')));
  v_entity text := lower(trim(coalesce(p_entity, '')));
  v_data jsonb := coalesce(p_data, '{}'::jsonb);
  v_auth jsonb;
  v_role text;
  v_items jsonb := '[]'::jsonb;
  rec_product public.financial_products%ROWTYPE;
  rec_bank public.banks%ROWTYPE;
  rec_calc public.calculator_configs%ROWTYPE;
BEGIN
  IF v_entity NOT IN ('products', 'banks', 'calculator_configs') THEN
    RAISE EXCEPTION 'UNKNOWN_ENTITY' USING ERRCODE = '22023';
  END IF;

  v_auth := public.admin_cms_require(p_token, 'products');
  v_role := coalesce(v_auth -> 'admin' ->> 'role', '');

  IF v_action = 'list' THEN
    IF v_entity = 'products' THEN
      SELECT coalesce(jsonb_agg(to_jsonb(t) ORDER BY t.sort_order, t.created_at DESC), '[]'::jsonb)
      INTO v_items
      FROM (
        SELECT
          p.*,
          b.name AS bank_name,
          b.slug AS bank_slug,
          c.slug AS category_slug,
          c.title AS category_title
        FROM public.financial_products p
        LEFT JOIN public.banks b ON b.id = p.bank_id
        LEFT JOIN public.categories c ON c.id = p.category_id
        WHERE p.deleted_at IS NULL
          AND (
            nullif(v_data ->> 'category_slug', '') IS NULL
            OR c.slug = v_data ->> 'category_slug'
          )
        ORDER BY p.sort_order, p.created_at DESC
      ) t;
    ELSIF v_entity = 'banks' THEN
      SELECT coalesce(jsonb_agg(to_jsonb(t) ORDER BY t.sort_order, t.created_at), '[]'::jsonb)
      INTO v_items
      FROM (
        SELECT
          b.*,
          (
            SELECT count(*)
            FROM public.financial_products p
            WHERE p.bank_id = b.id
              AND p.deleted_at IS NULL
          ) AS products_count
        FROM public.banks b
        WHERE b.deleted_at IS NULL
      ) t;
    ELSE
      SELECT coalesce(jsonb_agg(to_jsonb(t) ORDER BY t.sort_order, t.created_at), '[]'::jsonb)
      INTO v_items
      FROM (
        SELECT *
        FROM public.calculator_configs
        WHERE deleted_at IS NULL
      ) t;
    END IF;
    RETURN jsonb_build_object('items', v_items);
  END IF;

  IF v_action = 'get' THEN
    IF p_id IS NULL THEN
      RAISE EXCEPTION 'ID_REQUIRED' USING ERRCODE = '22023';
    END IF;
    IF v_entity = 'products' THEN
      SELECT * INTO rec_product FROM public.financial_products WHERE id = p_id AND deleted_at IS NULL;
      IF rec_product.id IS NULL THEN RAISE EXCEPTION 'NOT_FOUND' USING ERRCODE = 'P0002'; END IF;
      RETURN jsonb_build_object('item', to_jsonb(rec_product));
    ELSIF v_entity = 'banks' THEN
      SELECT * INTO rec_bank FROM public.banks WHERE id = p_id AND deleted_at IS NULL;
      IF rec_bank.id IS NULL THEN RAISE EXCEPTION 'NOT_FOUND' USING ERRCODE = 'P0002'; END IF;
      RETURN jsonb_build_object('item', to_jsonb(rec_bank));
    ELSE
      SELECT * INTO rec_calc FROM public.calculator_configs WHERE id = p_id AND deleted_at IS NULL;
      IF rec_calc.id IS NULL THEN RAISE EXCEPTION 'NOT_FOUND' USING ERRCODE = 'P0002'; END IF;
      RETURN jsonb_build_object('item', to_jsonb(rec_calc));
    END IF;
  END IF;

  IF v_action = 'create' THEN
    IF v_entity = 'products' THEN
      INSERT INTO public.financial_products (
        category_id, bank_id, slug, title, product_type, apr_rate, amount_min, amount_max, term_min, term_max,
        monthly_payment, commission, description, conditions, advantages, attributes, logo_url, link, partner_url,
        active, featured, status, sort_order
      ) VALUES (
        CASE WHEN nullif(v_data->>'category_id', '') IS NULL THEN NULL ELSE (v_data->>'category_id')::uuid END,
        CASE WHEN nullif(v_data->>'bank_id', '') IS NULL THEN NULL ELSE (v_data->>'bank_id')::uuid END,
        nullif(trim(v_data->>'slug'), ''),
        coalesce(nullif(trim(v_data->>'title'), ''), 'Untitled'),
        nullif(v_data->>'product_type', ''),
        CASE WHEN nullif(v_data->>'apr_rate', '') IS NULL THEN NULL ELSE (v_data->>'apr_rate')::numeric END,
        CASE WHEN nullif(v_data->>'amount_min', '') IS NULL THEN NULL ELSE (v_data->>'amount_min')::numeric END,
        CASE WHEN nullif(v_data->>'amount_max', '') IS NULL THEN NULL ELSE (v_data->>'amount_max')::numeric END,
        CASE WHEN nullif(v_data->>'term_min', '') IS NULL THEN NULL ELSE (v_data->>'term_min')::integer END,
        CASE WHEN nullif(v_data->>'term_max', '') IS NULL THEN NULL ELSE (v_data->>'term_max')::integer END,
        CASE WHEN nullif(v_data->>'monthly_payment', '') IS NULL THEN NULL ELSE (v_data->>'monthly_payment')::numeric END,
        nullif(v_data->>'commission', ''),
        nullif(v_data->>'description', ''),
        nullif(v_data->>'conditions', ''),
        coalesce(v_data->'advantages', '[]'::jsonb),
        coalesce(v_data->'attributes', '{}'::jsonb),
        nullif(v_data->>'logo_url', ''),
        nullif(v_data->>'link', ''),
        coalesce(nullif(v_data->>'link', ''), nullif(v_data->>'partner_url', ''), 'https://example.com'),
        coalesce((v_data->>'active')::boolean, true),
        coalesce((v_data->>'featured')::boolean, false),
        coalesce(nullif(v_data->>'status', ''), 'draft'),
        coalesce((v_data->>'sort_order')::integer, 0)
      )
      RETURNING * INTO rec_product;
      RETURN jsonb_build_object('item', to_jsonb(rec_product));
    ELSIF v_entity = 'banks' THEN
      INSERT INTO public.banks (slug, name, logo_url, website_url, status, sort_order)
      VALUES (
        nullif(trim(v_data->>'slug'), ''),
        coalesce(nullif(trim(v_data->>'name'), ''), 'Untitled'),
        nullif(v_data->>'logo_url', ''),
        nullif(v_data->>'website_url', ''),
        coalesce(nullif(v_data->>'status', ''), 'draft'),
        coalesce((v_data->>'sort_order')::integer, 0)
      )
      RETURNING * INTO rec_bank;
      RETURN jsonb_build_object('item', to_jsonb(rec_bank));
    ELSE
      IF v_data ? 'formula' AND v_role <> 'SUPERADMIN' THEN
        RAISE EXCEPTION 'FORBIDDEN' USING ERRCODE = '42501';
      END IF;
      INSERT INTO public.calculator_configs (
        key, title, category_id, min_amount, max_amount, min_term, max_term, rate,
        default_amount, default_term, default_purpose, purposes, formula, formula_locked, status, sort_order
      ) VALUES (
        nullif(trim(v_data->>'key'), ''),
        coalesce(nullif(trim(v_data->>'title'), ''), 'Calculator'),
        CASE WHEN nullif(v_data->>'category_id', '') IS NULL THEN NULL ELSE (v_data->>'category_id')::uuid END,
        coalesce((v_data->>'min_amount')::numeric, 50000),
        coalesce((v_data->>'max_amount')::numeric, 5000000),
        coalesce((v_data->>'min_term')::integer, 6),
        coalesce((v_data->>'max_term')::integer, 84),
        coalesce((v_data->>'rate')::numeric, 0.008),
        coalesce((v_data->>'default_amount')::numeric, 500000),
        coalesce((v_data->>'default_term')::integer, 36),
        nullif(v_data->>'default_purpose', ''),
        coalesce(v_data->'purposes', '[]'::jsonb),
        coalesce(nullif(v_data->>'formula', ''), 'simple_interest'),
        coalesce((v_data->>'formula_locked')::boolean, true),
        coalesce(nullif(v_data->>'status', ''), 'published'),
        coalesce((v_data->>'sort_order')::integer, 0)
      )
      RETURNING * INTO rec_calc;
      RETURN jsonb_build_object('item', to_jsonb(rec_calc));
    END IF;
  END IF;

  IF v_action = 'update' THEN
    IF p_id IS NULL THEN
      RAISE EXCEPTION 'ID_REQUIRED' USING ERRCODE = '22023';
    END IF;
    IF v_entity = 'products' THEN
      UPDATE public.financial_products SET
        category_id = CASE WHEN v_data ? 'category_id' THEN CASE WHEN nullif(v_data->>'category_id', '') IS NULL THEN NULL ELSE (v_data->>'category_id')::uuid END ELSE category_id END,
        bank_id = CASE WHEN v_data ? 'bank_id' THEN CASE WHEN nullif(v_data->>'bank_id', '') IS NULL THEN NULL ELSE (v_data->>'bank_id')::uuid END ELSE bank_id END,
        slug = CASE WHEN v_data ? 'slug' THEN nullif(trim(v_data->>'slug'), '') ELSE slug END,
        title = CASE WHEN v_data ? 'title' THEN coalesce(nullif(trim(v_data->>'title'), ''), title) ELSE title END,
        product_type = CASE WHEN v_data ? 'product_type' THEN nullif(v_data->>'product_type', '') ELSE product_type END,
        apr_rate = CASE WHEN v_data ? 'apr_rate' THEN CASE WHEN nullif(v_data->>'apr_rate', '') IS NULL THEN NULL ELSE (v_data->>'apr_rate')::numeric END ELSE apr_rate END,
        amount_min = CASE WHEN v_data ? 'amount_min' THEN CASE WHEN nullif(v_data->>'amount_min', '') IS NULL THEN NULL ELSE (v_data->>'amount_min')::numeric END ELSE amount_min END,
        amount_max = CASE WHEN v_data ? 'amount_max' THEN CASE WHEN nullif(v_data->>'amount_max', '') IS NULL THEN NULL ELSE (v_data->>'amount_max')::numeric END ELSE amount_max END,
        term_min = CASE WHEN v_data ? 'term_min' THEN CASE WHEN nullif(v_data->>'term_min', '') IS NULL THEN NULL ELSE (v_data->>'term_min')::integer END ELSE term_min END,
        term_max = CASE WHEN v_data ? 'term_max' THEN CASE WHEN nullif(v_data->>'term_max', '') IS NULL THEN NULL ELSE (v_data->>'term_max')::integer END ELSE term_max END,
        monthly_payment = CASE WHEN v_data ? 'monthly_payment' THEN CASE WHEN nullif(v_data->>'monthly_payment', '') IS NULL THEN NULL ELSE (v_data->>'monthly_payment')::numeric END ELSE monthly_payment END,
        commission = CASE WHEN v_data ? 'commission' THEN nullif(v_data->>'commission', '') ELSE commission END,
        description = CASE WHEN v_data ? 'description' THEN nullif(v_data->>'description', '') ELSE description END,
        conditions = CASE WHEN v_data ? 'conditions' THEN nullif(v_data->>'conditions', '') ELSE conditions END,
        advantages = CASE WHEN v_data ? 'advantages' THEN coalesce(v_data->'advantages', advantages) ELSE advantages END,
        attributes = CASE WHEN v_data ? 'attributes' THEN coalesce(v_data->'attributes', attributes) ELSE attributes END,
        logo_url = CASE WHEN v_data ? 'logo_url' THEN nullif(v_data->>'logo_url', '') ELSE logo_url END,
        link = CASE WHEN v_data ? 'link' THEN nullif(v_data->>'link', '') ELSE link END,
        partner_url = CASE WHEN v_data ? 'link' THEN coalesce(nullif(v_data->>'link', ''), partner_url) ELSE partner_url END,
        active = CASE WHEN v_data ? 'active' THEN coalesce((v_data->>'active')::boolean, active) ELSE active END,
        featured = CASE WHEN v_data ? 'featured' THEN coalesce((v_data->>'featured')::boolean, featured) ELSE featured END,
        status = CASE WHEN v_data ? 'status' THEN coalesce(nullif(v_data->>'status', ''), status) ELSE status END,
        sort_order = CASE WHEN v_data ? 'sort_order' THEN coalesce((v_data->>'sort_order')::integer, sort_order) ELSE sort_order END
      WHERE id = p_id AND deleted_at IS NULL
      RETURNING * INTO rec_product;
      IF rec_product.id IS NULL THEN RAISE EXCEPTION 'NOT_FOUND' USING ERRCODE = 'P0002'; END IF;
      RETURN jsonb_build_object('item', to_jsonb(rec_product));
    ELSIF v_entity = 'banks' THEN
      UPDATE public.banks SET
        slug = CASE WHEN v_data ? 'slug' THEN nullif(trim(v_data->>'slug'), '') ELSE slug END,
        name = CASE WHEN v_data ? 'name' THEN coalesce(nullif(trim(v_data->>'name'), ''), name) ELSE name END,
        logo_url = CASE WHEN v_data ? 'logo_url' THEN nullif(v_data->>'logo_url', '') ELSE logo_url END,
        website_url = CASE WHEN v_data ? 'website_url' THEN nullif(v_data->>'website_url', '') ELSE website_url END,
        status = CASE WHEN v_data ? 'status' THEN coalesce(nullif(v_data->>'status', ''), status) ELSE status END,
        sort_order = CASE WHEN v_data ? 'sort_order' THEN coalesce((v_data->>'sort_order')::integer, sort_order) ELSE sort_order END
      WHERE id = p_id AND deleted_at IS NULL
      RETURNING * INTO rec_bank;
      IF rec_bank.id IS NULL THEN RAISE EXCEPTION 'NOT_FOUND' USING ERRCODE = 'P0002'; END IF;
      RETURN jsonb_build_object('item', to_jsonb(rec_bank));
    ELSE
      IF v_data ? 'formula' AND v_role <> 'SUPERADMIN' THEN
        RAISE EXCEPTION 'FORBIDDEN' USING ERRCODE = '42501';
      END IF;
      UPDATE public.calculator_configs SET
        key = CASE WHEN v_data ? 'key' THEN nullif(trim(v_data->>'key'), '') ELSE key END,
        title = CASE WHEN v_data ? 'title' THEN coalesce(nullif(trim(v_data->>'title'), ''), title) ELSE title END,
        category_id = CASE WHEN v_data ? 'category_id' THEN CASE WHEN nullif(v_data->>'category_id', '') IS NULL THEN NULL ELSE (v_data->>'category_id')::uuid END ELSE category_id END,
        min_amount = CASE WHEN v_data ? 'min_amount' THEN coalesce((v_data->>'min_amount')::numeric, min_amount) ELSE min_amount END,
        max_amount = CASE WHEN v_data ? 'max_amount' THEN coalesce((v_data->>'max_amount')::numeric, max_amount) ELSE max_amount END,
        min_term = CASE WHEN v_data ? 'min_term' THEN coalesce((v_data->>'min_term')::integer, min_term) ELSE min_term END,
        max_term = CASE WHEN v_data ? 'max_term' THEN coalesce((v_data->>'max_term')::integer, max_term) ELSE max_term END,
        rate = CASE WHEN v_data ? 'rate' THEN coalesce((v_data->>'rate')::numeric, rate) ELSE rate END,
        default_amount = CASE WHEN v_data ? 'default_amount' THEN coalesce((v_data->>'default_amount')::numeric, default_amount) ELSE default_amount END,
        default_term = CASE WHEN v_data ? 'default_term' THEN coalesce((v_data->>'default_term')::integer, default_term) ELSE default_term END,
        default_purpose = CASE WHEN v_data ? 'default_purpose' THEN nullif(v_data->>'default_purpose', '') ELSE default_purpose END,
        purposes = CASE WHEN v_data ? 'purposes' THEN coalesce(v_data->'purposes', purposes) ELSE purposes END,
        formula = CASE WHEN v_data ? 'formula' THEN coalesce(nullif(v_data->>'formula', ''), formula) ELSE formula END,
        formula_locked = CASE WHEN v_data ? 'formula_locked' THEN coalesce((v_data->>'formula_locked')::boolean, formula_locked) ELSE formula_locked END,
        status = CASE WHEN v_data ? 'status' THEN coalesce(nullif(v_data->>'status', ''), status) ELSE status END,
        sort_order = CASE WHEN v_data ? 'sort_order' THEN coalesce((v_data->>'sort_order')::integer, sort_order) ELSE sort_order END
      WHERE id = p_id AND deleted_at IS NULL
      RETURNING * INTO rec_calc;
      IF rec_calc.id IS NULL THEN RAISE EXCEPTION 'NOT_FOUND' USING ERRCODE = 'P0002'; END IF;
      RETURN jsonb_build_object('item', to_jsonb(rec_calc));
    END IF;
  END IF;

  IF v_action IN ('delete', 'publish', 'unpublish', 'archive') THEN
    IF p_id IS NULL THEN
      RAISE EXCEPTION 'ID_REQUIRED' USING ERRCODE = '22023';
    END IF;
    IF v_entity = 'products' THEN
      IF v_action = 'delete' THEN
        UPDATE public.financial_products SET deleted_at = timezone('utc', now()) WHERE id = p_id AND deleted_at IS NULL RETURNING * INTO rec_product;
      ELSIF v_action = 'publish' THEN
        UPDATE public.financial_products SET status = 'published', active = true, published_at = coalesce(published_at, timezone('utc', now())) WHERE id = p_id AND deleted_at IS NULL RETURNING * INTO rec_product;
      ELSIF v_action = 'unpublish' THEN
        UPDATE public.financial_products SET status = 'draft' WHERE id = p_id AND deleted_at IS NULL RETURNING * INTO rec_product;
      ELSE
        UPDATE public.financial_products SET status = 'archived' WHERE id = p_id AND deleted_at IS NULL RETURNING * INTO rec_product;
      END IF;
      IF rec_product.id IS NULL THEN RAISE EXCEPTION 'NOT_FOUND' USING ERRCODE = 'P0002'; END IF;
      RETURN jsonb_build_object('item', to_jsonb(rec_product));
    ELSIF v_entity = 'banks' THEN
      IF v_action = 'delete' THEN
        UPDATE public.banks SET deleted_at = timezone('utc', now()) WHERE id = p_id AND deleted_at IS NULL RETURNING * INTO rec_bank;
      ELSIF v_action = 'publish' THEN
        UPDATE public.banks SET status = 'published' WHERE id = p_id AND deleted_at IS NULL RETURNING * INTO rec_bank;
      ELSIF v_action = 'unpublish' THEN
        UPDATE public.banks SET status = 'draft' WHERE id = p_id AND deleted_at IS NULL RETURNING * INTO rec_bank;
      ELSE
        UPDATE public.banks SET status = 'archived' WHERE id = p_id AND deleted_at IS NULL RETURNING * INTO rec_bank;
      END IF;
      IF rec_bank.id IS NULL THEN RAISE EXCEPTION 'NOT_FOUND' USING ERRCODE = 'P0002'; END IF;
      RETURN jsonb_build_object('item', to_jsonb(rec_bank));
    ELSE
      IF v_action = 'delete' THEN
        UPDATE public.calculator_configs SET deleted_at = timezone('utc', now()) WHERE id = p_id AND deleted_at IS NULL RETURNING * INTO rec_calc;
      ELSIF v_action = 'publish' THEN
        UPDATE public.calculator_configs SET status = 'published' WHERE id = p_id AND deleted_at IS NULL RETURNING * INTO rec_calc;
      ELSIF v_action = 'unpublish' THEN
        UPDATE public.calculator_configs SET status = 'draft' WHERE id = p_id AND deleted_at IS NULL RETURNING * INTO rec_calc;
      ELSE
        UPDATE public.calculator_configs SET status = 'archived' WHERE id = p_id AND deleted_at IS NULL RETURNING * INTO rec_calc;
      END IF;
      IF rec_calc.id IS NULL THEN RAISE EXCEPTION 'NOT_FOUND' USING ERRCODE = 'P0002'; END IF;
      RETURN jsonb_build_object('item', to_jsonb(rec_calc));
    END IF;
  END IF;

  RAISE EXCEPTION 'UNKNOWN_ACTION' USING ERRCODE = '22023';
END;
$$;
