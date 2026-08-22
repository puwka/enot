CREATE OR REPLACE FUNCTION public.apply_bonus_transaction()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM set_config('app.allow_secure_update', 'on', true);

  IF TG_OP = 'INSERT' AND NEW.status = 'credited' THEN
    UPDATE public.users
    SET bonus_balance = bonus_balance + NEW.points,
        updated_at = timezone('utc', now())
    WHERE id = NEW.user_id
      AND deleted_at IS NULL;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status = 'credited' AND NEW.status <> 'credited' THEN
      UPDATE public.users
      SET bonus_balance = GREATEST(0, bonus_balance - OLD.points),
          updated_at = timezone('utc', now())
      WHERE id = NEW.user_id;
    ELSIF OLD.status <> 'credited' AND NEW.status = 'credited' THEN
      UPDATE public.users
      SET bonus_balance = bonus_balance + NEW.points,
          updated_at = timezone('utc', now())
      WHERE id = NEW.user_id
        AND deleted_at IS NULL;
    ELSIF OLD.status = 'credited' AND NEW.status = 'credited' AND OLD.points <> NEW.points THEN
      UPDATE public.users
      SET bonus_balance = GREATEST(0, bonus_balance - OLD.points + NEW.points),
          updated_at = timezone('utc', now())
      WHERE id = NEW.user_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

INSERT INTO public.bonus_rules (action_key, title, points, is_repeatable, cooldown_hours, status, sort_order)
VALUES ('welcome', 'Добро пожаловать', 50, false, NULL, 'published', 5)
ON CONFLICT (action_key) DO NOTHING;

CREATE OR REPLACE FUNCTION public.claim_bonus_action(p_action_key text, p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := p_user_id;
  rule public.bonus_rules%ROWTYPE;
  already boolean;
  today date := timezone('utc', now())::date;
  last_login date;
  tx public.bonus_transactions%ROWTYPE;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  SELECT * INTO rule
  FROM public.bonus_rules
  WHERE action_key = p_action_key
    AND status = 'published'
    AND deleted_at IS NULL
  LIMIT 1;

  IF rule.id IS NULL THEN
    RAISE EXCEPTION 'unknown action';
  END IF;

  IF p_action_key = 'daily-login' THEN
    SELECT last_login_at::date INTO last_login FROM public.users WHERE id = uid;
    IF last_login = today THEN
      RETURN jsonb_build_object('already', true);
    END IF;
    PERFORM set_config('app.allow_secure_update', 'on', true);
    UPDATE public.users
    SET last_login_at = timezone('utc', now())
    WHERE id = uid;
  ELSIF p_action_key = 'invite-friend' THEN
    RAISE EXCEPTION 'invite is awarded automatically';
  ELSIF NOT rule.is_repeatable THEN
    SELECT EXISTS (
      SELECT 1
      FROM public.bonus_transactions
      WHERE user_id = uid
        AND status = 'credited'
        AND meta ->> 'action_key' = p_action_key
    ) INTO already;
    IF already THEN
      RETURN jsonb_build_object('already', true);
    END IF;
  ELSIF rule.cooldown_hours IS NOT NULL THEN
    SELECT EXISTS (
      SELECT 1
      FROM public.bonus_transactions
      WHERE user_id = uid
        AND status = 'credited'
        AND meta ->> 'action_key' = p_action_key
        AND created_at > timezone('utc', now()) - make_interval(hours => rule.cooldown_hours)
    ) INTO already;
    IF already THEN
      RETURN jsonb_build_object('already', true);
    END IF;
  END IF;

  INSERT INTO public.bonus_transactions (user_id, rule_id, title, points, status, meta)
  VALUES (
    uid,
    rule.id,
    rule.title,
    rule.points,
    'credited',
    jsonb_build_object('action_key', p_action_key)
  )
  RETURNING * INTO tx;

  RETURN jsonb_build_object(
    'already', false,
    'points', tx.points,
    'title', tx.title,
    'id', tx.id
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.soft_delete_own_account(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;
  PERFORM set_config('app.allow_secure_update', 'on', true);
  UPDATE public.users
  SET status = 'blocked',
      deleted_at = timezone('utc', now())
  WHERE id = p_user_id;
END;
$$;
