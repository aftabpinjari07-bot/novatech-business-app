CREATE TABLE public.negotiations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  service_id uuid NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  variant_id uuid NOT NULL REFERENCES public.service_variants(id) ON DELETE CASCADE,
  customer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_email text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  agreed_price numeric(12, 2),
  order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT negotiations_status_check
    CHECK (status IN ('pending', 'countered', 'accepted', 'rejected', 'cancelled')),
  CONSTRAINT negotiations_agreed_price_check
    CHECK (agreed_price IS NULL OR agreed_price >= 0)
);

CREATE TABLE public.negotiation_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  negotiation_id uuid NOT NULL REFERENCES public.negotiations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message text,
  proposed_price numeric(12, 2),
  created_at timestamptz DEFAULT now(),
  CONSTRAINT negotiation_messages_proposed_price_check
    CHECK (proposed_price IS NULL OR proposed_price >= 0)
);

CREATE INDEX negotiations_customer_created_at_idx
  ON public.negotiations (customer_id, created_at DESC);

CREATE INDEX negotiations_business_created_at_idx
  ON public.negotiations (business_id, created_at DESC);

CREATE INDEX negotiation_messages_negotiation_created_at_idx
  ON public.negotiation_messages (negotiation_id, created_at);

CREATE FUNCTION public.set_negotiations_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog
AS $$
BEGIN
  NEW.updated_at := pg_catalog.now();
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.set_negotiations_updated_at() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER negotiations_set_updated_at
  BEFORE UPDATE ON public.negotiations
  FOR EACH ROW
  EXECUTE FUNCTION public.set_negotiations_updated_at();

ALTER TABLE public.negotiations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.negotiation_messages ENABLE ROW LEVEL SECURITY;

REVOKE ALL PRIVILEGES ON TABLE public.negotiations, public.negotiation_messages
  FROM PUBLIC, anon, authenticated;

GRANT SELECT ON TABLE public.negotiations TO authenticated;
GRANT INSERT (business_id, service_id, variant_id, customer_id, customer_email)
  ON TABLE public.negotiations TO authenticated;
GRANT UPDATE (status, agreed_price, order_id)
  ON TABLE public.negotiations TO authenticated;
GRANT SELECT ON TABLE public.negotiation_messages TO authenticated;
GRANT INSERT (negotiation_id, sender_id, message, proposed_price)
  ON TABLE public.negotiation_messages TO authenticated;

CREATE POLICY negotiations_customer_select_own
  ON public.negotiations
  FOR SELECT
  TO authenticated
  USING (customer_id = (SELECT auth.uid()));

CREATE POLICY negotiations_customer_insert_own_valid_variant
  ON public.negotiations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    customer_id = (SELECT auth.uid())
    AND customer_email = (SELECT auth.email())
    AND status = 'pending'
    AND agreed_price IS NULL
    AND order_id IS NULL
    AND EXISTS (
      SELECT 1
      FROM public.businesses AS business
      JOIN public.services AS service
        ON service.business_id = business.id
      JOIN public.service_variants AS variant
        ON variant.service_id = service.id
      WHERE business.id = negotiations.business_id
        AND service.id = negotiations.service_id
        AND variant.id = negotiations.variant_id
        AND service.is_active IS TRUE
        AND variant.is_active IS TRUE
        AND variant.is_negotiable IS TRUE
    )
  );

CREATE POLICY negotiations_owner_select_own_business
  ON public.negotiations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.businesses AS business
      WHERE business.id = negotiations.business_id
        AND business.owner_id = (SELECT auth.uid())
    )
  );

CREATE POLICY negotiations_owner_update_own_business
  ON public.negotiations
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.businesses AS business
      WHERE business.id = negotiations.business_id
        AND business.owner_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.businesses AS business
      JOIN public.services AS service
        ON service.business_id = business.id
      JOIN public.service_variants AS variant
        ON variant.service_id = service.id
      WHERE business.id = negotiations.business_id
        AND service.id = negotiations.service_id
        AND variant.id = negotiations.variant_id
        AND business.owner_id = (SELECT auth.uid())
    )
  );

CREATE POLICY negotiation_messages_customer_select_own
  ON public.negotiation_messages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.negotiations AS negotiation
      WHERE negotiation.id = negotiation_messages.negotiation_id
        AND negotiation.customer_id = (SELECT auth.uid())
    )
  );

CREATE POLICY negotiation_messages_owner_select_own_business
  ON public.negotiation_messages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.negotiations AS negotiation
      JOIN public.businesses AS business
        ON business.id = negotiation.business_id
      WHERE negotiation.id = negotiation_messages.negotiation_id
        AND business.owner_id = (SELECT auth.uid())
    )
  );

CREATE POLICY negotiation_messages_customer_insert_own
  ON public.negotiation_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = (SELECT auth.uid())
    AND EXISTS (
      SELECT 1
      FROM public.negotiations AS negotiation
      WHERE negotiation.id = negotiation_messages.negotiation_id
        AND negotiation.customer_id = (SELECT auth.uid())
    )
  );

CREATE POLICY negotiation_messages_owner_insert_own_business
  ON public.negotiation_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = (SELECT auth.uid())
    AND EXISTS (
      SELECT 1
      FROM public.negotiations AS negotiation
      JOIN public.businesses AS business
        ON business.id = negotiation.business_id
      WHERE negotiation.id = negotiation_messages.negotiation_id
        AND business.owner_id = (SELECT auth.uid())
    )
  );

SELECT
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('negotiations', 'negotiation_messages')
ORDER BY table_name, ordinal_position;

SELECT
  table_name,
  constraint_name,
  constraint_type
FROM information_schema.table_constraints
WHERE table_schema = 'public'
  AND table_name IN ('negotiations', 'negotiation_messages')
ORDER BY table_name, constraint_type, constraint_name;

SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('negotiations', 'negotiation_messages')
ORDER BY tablename, policyname;

SELECT
  namespace.nspname AS schema_name,
  relation.relname AS table_name,
  relation.relrowsecurity AS rls_enabled,
  relation.relforcerowsecurity AS rls_forced
FROM pg_class AS relation
JOIN pg_namespace AS namespace
  ON namespace.oid = relation.relnamespace
WHERE namespace.nspname = 'public'
  AND relation.relname IN ('negotiations', 'negotiation_messages')
ORDER BY relation.relname;
