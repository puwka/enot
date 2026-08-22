CREATE TABLE public.bonus_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action_key text NOT NULL UNIQUE,
  title text NOT NULL,
  points integer NOT NULL CHECK (points >= 0),
  is_repeatable boolean NOT NULL DEFAULT false,
  cooldown_hours integer CHECK (cooldown_hours IS NULL OR cooldown_hours >= 0),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  deleted_at timestamptz
);

CREATE TRIGGER bonus_rules_set_updated_at
BEFORE UPDATE ON public.bonus_rules
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.bonus_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  rule_id uuid REFERENCES public.bonus_rules (id) ON DELETE SET NULL,
  title text NOT NULL,
  points integer NOT NULL,
  status text NOT NULL DEFAULT 'credited' CHECK (status IN ('credited', 'pending', 'rejected', 'reversed')),
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE public.referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  invitee_id uuid NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'rejected')),
  bonus_transaction_id uuid REFERENCES public.bonus_transactions (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  deleted_at timestamptz,
  CONSTRAINT referrals_invitee_unique UNIQUE (invitee_id),
  CONSTRAINT referrals_not_self CHECK (referrer_id <> invitee_id)
);

CREATE TRIGGER referrals_set_updated_at
BEFORE UPDATE ON public.referrals
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES public.users (id) ON DELETE SET NULL,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  before_data jsonb,
  after_data jsonb,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE OR REPLACE FUNCTION public.apply_bonus_transaction()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
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

CREATE TRIGGER bonus_transactions_apply_balance
AFTER INSERT OR UPDATE OF status, points ON public.bonus_transactions
FOR EACH ROW
EXECUTE FUNCTION public.apply_bonus_transaction();
