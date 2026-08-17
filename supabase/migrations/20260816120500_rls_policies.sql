ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faq ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bonus_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bonus_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY roles_select_authenticated
ON public.roles
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY roles_admin_all
ON public.roles
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY media_select_ready_public
ON public.media
FOR SELECT
TO anon, authenticated
USING (deleted_at IS NULL AND status = 'ready');

CREATE POLICY media_select_own
ON public.media
FOR SELECT
TO authenticated
USING (uploaded_by = auth.uid());

CREATE POLICY media_insert_own
ON public.media
FOR INSERT
TO authenticated
WITH CHECK (uploaded_by = auth.uid() OR public.is_admin());

CREATE POLICY media_admin_all
ON public.media
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY users_select_own
ON public.users
FOR SELECT
TO authenticated
USING (id = auth.uid() OR public.is_admin());

CREATE POLICY users_update_own
ON public.users
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

CREATE POLICY users_admin_all
ON public.users
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY categories_select_published
ON public.categories
FOR SELECT
TO anon, authenticated
USING (deleted_at IS NULL AND status = 'published');

CREATE POLICY categories_admin_all
ON public.categories
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY banks_select_published
ON public.banks
FOR SELECT
TO anon, authenticated
USING (deleted_at IS NULL AND status = 'published');

CREATE POLICY banks_admin_all
ON public.banks
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY financial_products_select_published
ON public.financial_products
FOR SELECT
TO anon, authenticated
USING (deleted_at IS NULL AND status = 'published');

CREATE POLICY financial_products_admin_all
ON public.financial_products
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY articles_select_published
ON public.articles
FOR SELECT
TO anon, authenticated
USING (deleted_at IS NULL AND status = 'published');

CREATE POLICY articles_admin_all
ON public.articles
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY news_select_published
ON public.news
FOR SELECT
TO anon, authenticated
USING (deleted_at IS NULL AND status = 'published');

CREATE POLICY news_admin_all
ON public.news
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY faq_select_published
ON public.faq
FOR SELECT
TO anon, authenticated
USING (deleted_at IS NULL AND status = 'published');

CREATE POLICY faq_admin_all
ON public.faq
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY pages_select_published
ON public.pages
FOR SELECT
TO anon, authenticated
USING (deleted_at IS NULL AND status = 'published');

CREATE POLICY pages_admin_all
ON public.pages
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY page_blocks_select_published
ON public.page_blocks
FOR SELECT
TO anon, authenticated
USING (
  deleted_at IS NULL
  AND status = 'published'
  AND EXISTS (
    SELECT 1
    FROM public.pages p
    WHERE p.id = page_blocks.page_id
      AND p.deleted_at IS NULL
      AND p.status = 'published'
  )
);

CREATE POLICY page_blocks_admin_all
ON public.page_blocks
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY menus_select_published
ON public.menus
FOR SELECT
TO anon, authenticated
USING (deleted_at IS NULL AND status = 'published');

CREATE POLICY menus_admin_all
ON public.menus
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY site_settings_select_published
ON public.site_settings
FOR SELECT
TO anon, authenticated
USING (status = 'published');

CREATE POLICY site_settings_admin_all
ON public.site_settings
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY bonus_rules_select_published
ON public.bonus_rules
FOR SELECT
TO anon, authenticated
USING (deleted_at IS NULL AND status = 'published');

CREATE POLICY bonus_rules_admin_all
ON public.bonus_rules
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY bonus_transactions_select_own
ON public.bonus_transactions
FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY bonus_transactions_admin_insert
ON public.bonus_transactions
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

CREATE POLICY bonus_transactions_admin_update
ON public.bonus_transactions
FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY referrals_select_own
ON public.referrals
FOR SELECT
TO authenticated
USING (referrer_id = auth.uid() OR invitee_id = auth.uid() OR public.is_admin());

CREATE POLICY referrals_admin_all
ON public.referrals
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY audit_logs_select_admin
ON public.audit_logs
FOR SELECT
TO authenticated
USING (public.is_admin());

CREATE POLICY audit_logs_insert_admin
ON public.audit_logs
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());
