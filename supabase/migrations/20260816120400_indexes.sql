CREATE INDEX roles_slug_idx ON public.roles (slug);

CREATE INDEX media_status_created_idx ON public.media (status, created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX media_uploaded_by_idx ON public.media (uploaded_by) WHERE deleted_at IS NULL;

CREATE INDEX users_role_id_idx ON public.users (role_id) WHERE deleted_at IS NULL;
CREATE INDEX users_status_idx ON public.users (status) WHERE deleted_at IS NULL;
CREATE INDEX users_referral_code_idx ON public.users (referral_code) WHERE deleted_at IS NULL;
CREATE INDEX users_referred_by_idx ON public.users (referred_by) WHERE referred_by IS NOT NULL AND deleted_at IS NULL;
CREATE INDEX users_email_idx ON public.users (email) WHERE deleted_at IS NULL;

CREATE INDEX categories_type_status_sort_idx
  ON public.categories (type, status, sort_order)
  WHERE deleted_at IS NULL;
CREATE INDEX categories_path_idx ON public.categories (path) WHERE path IS NOT NULL AND deleted_at IS NULL;

CREATE INDEX banks_status_sort_idx ON public.banks (status, sort_order) WHERE deleted_at IS NULL;

CREATE INDEX financial_products_category_status_sort_idx
  ON public.financial_products (category_id, status, sort_order)
  WHERE deleted_at IS NULL;
CREATE INDEX financial_products_bank_id_idx
  ON public.financial_products (bank_id)
  WHERE bank_id IS NOT NULL AND deleted_at IS NULL;
CREATE INDEX financial_products_published_at_idx
  ON public.financial_products (published_at DESC)
  WHERE status = 'published' AND deleted_at IS NULL;

CREATE INDEX articles_category_id_idx ON public.articles (category_id) WHERE deleted_at IS NULL;
CREATE INDEX articles_status_sort_idx ON public.articles (status, sort_order) WHERE deleted_at IS NULL;
CREATE INDEX articles_published_at_idx
  ON public.articles (published_at DESC)
  WHERE status = 'published' AND deleted_at IS NULL;

CREATE INDEX news_category_id_idx ON public.news (category_id) WHERE deleted_at IS NULL;
CREATE INDEX news_status_sort_idx ON public.news (status, sort_order) WHERE deleted_at IS NULL;
CREATE INDEX news_published_at_idx
  ON public.news (published_at DESC)
  WHERE status = 'published' AND deleted_at IS NULL;

CREATE INDEX faq_status_sort_idx ON public.faq (status, sort_order) WHERE deleted_at IS NULL;

CREATE INDEX pages_status_sort_idx ON public.pages (status, sort_order) WHERE deleted_at IS NULL;

CREATE INDEX page_blocks_page_status_sort_idx
  ON public.page_blocks (page_id, status, sort_order)
  WHERE deleted_at IS NULL;

CREATE INDEX menus_location_status_sort_idx
  ON public.menus (location, status, sort_order)
  WHERE deleted_at IS NULL;
CREATE INDEX menus_parent_id_idx ON public.menus (parent_id) WHERE parent_id IS NOT NULL AND deleted_at IS NULL;

CREATE INDEX site_settings_status_idx ON public.site_settings (status);

CREATE INDEX bonus_rules_status_sort_idx ON public.bonus_rules (status, sort_order) WHERE deleted_at IS NULL;

CREATE INDEX bonus_transactions_user_created_idx
  ON public.bonus_transactions (user_id, created_at DESC);
CREATE INDEX bonus_transactions_rule_id_idx
  ON public.bonus_transactions (rule_id)
  WHERE rule_id IS NOT NULL;
CREATE INDEX bonus_transactions_status_created_idx
  ON public.bonus_transactions (status, created_at DESC);

CREATE INDEX referrals_referrer_id_idx ON public.referrals (referrer_id) WHERE deleted_at IS NULL;
CREATE INDEX referrals_status_idx ON public.referrals (status) WHERE deleted_at IS NULL;

CREATE INDEX audit_logs_actor_created_idx ON public.audit_logs (actor_id, created_at DESC);
CREATE INDEX audit_logs_entity_idx ON public.audit_logs (entity_type, entity_id, created_at DESC);
CREATE INDEX audit_logs_created_at_idx ON public.audit_logs (created_at DESC);
