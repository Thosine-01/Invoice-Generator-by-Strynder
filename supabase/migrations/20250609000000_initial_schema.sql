-- Invoice Generator by Strynder — initial schema

CREATE TABLE business_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  owner_name text,
  business_name text,
  logo_url text,
  address text,
  phone text,
  email text,
  slogan text,
  default_currency text NOT NULL DEFAULT 'NGN',
  default_header_color text NOT NULL DEFAULT '#1e3a5f',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE payment_details (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  bank_name text,
  account_name text,
  account_number text,
  additional_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invoice_number text NOT NULL,
  issue_date date NOT NULL,
  due_date date,
  currency text NOT NULL DEFAULT 'NGN',
  client_name text NOT NULL,
  client_address text,
  client_email text,
  client_phone text,
  vat_enabled boolean NOT NULL DEFAULT false,
  vat_rate numeric NOT NULL DEFAULT 7.5,
  subtotal numeric NOT NULL DEFAULT 0,
  vat_amount numeric NOT NULL DEFAULT 0,
  grand_total numeric NOT NULL DEFAULT 0,
  header_color text NOT NULL DEFAULT '#1e3a5f',
  profile_snapshot jsonb NOT NULL DEFAULT '{}',
  payment_details text,
  notes text,
  status text NOT NULL DEFAULT 'finalized',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE line_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  sort_order int NOT NULL,
  description text NOT NULL,
  quantity numeric NOT NULL,
  unit_price numeric NOT NULL,
  line_total numeric NOT NULL
);

CREATE INDEX invoices_user_id_idx ON invoices(user_id);
CREATE INDEX invoices_created_at_idx ON invoices(created_at DESC);
CREATE INDEX line_items_invoice_id_idx ON line_items(invoice_id);

-- RLS
ALTER TABLE business_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE line_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own profile" ON business_profiles
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own payment details" ON payment_details
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own invoices" ON invoices
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own line items" ON line_items
  FOR ALL USING (
    auth.uid() = (SELECT user_id FROM invoices WHERE id = invoice_id)
  ) WITH CHECK (
    auth.uid() = (SELECT user_id FROM invoices WHERE id = invoice_id)
  );

-- Auto-create profile rows on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.business_profiles (user_id) VALUES (NEW.id);
  INSERT INTO public.payment_details (user_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Storage bucket for logos
INSERT INTO storage.buckets (id, name, public)
VALUES ('logos', 'logos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users upload own logos" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'logos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users update own logos" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'logos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users delete own logos" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'logos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Public read logos" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'logos');
