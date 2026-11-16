CREATE TABLE public.listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organizer_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  city text NOT NULL,
  district text NOT NULL DEFAULT '',
  address text NOT NULL,
  lat double precision,
  lng double precision,
  category text NOT NULL,
  audience text NOT NULL,
  ages text[] NOT NULL DEFAULT '{}',
  gender text NOT NULL,
  price numeric NOT NULL,
  short_description text NOT NULL DEFAULT '',
  description text NOT NULL,
  schedule jsonb NOT NULL DEFAULT '[]',
  schedule_flexible boolean NOT NULL DEFAULT false,
  perks text[] NOT NULL DEFAULT '{}',
  website text,
  contact_name text NOT NULL,
  phone text NOT NULL,
  email text NOT NULL,
  photos text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX listings_organizer_id_idx ON public.listings (organizer_id);

GRANT SELECT ON public.listings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.listings TO authenticated;
GRANT ALL ON public.listings TO service_role;

ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view listings" ON public.listings
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Organisers can add their own listings" ON public.listings
  FOR INSERT TO authenticated WITH CHECK (organizer_id = auth.uid());
CREATE POLICY "Organisers can update their own listings" ON public.listings
  FOR UPDATE TO authenticated USING (organizer_id = auth.uid()) WITH CHECK (organizer_id = auth.uid());
CREATE POLICY "Organisers can delete their own listings" ON public.listings
  FOR DELETE TO authenticated USING (organizer_id = auth.uid());

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT '',
  headline text NOT NULL DEFAULT '',
  age text NOT NULL DEFAULT '',
  bio text NOT NULL DEFAULT '',
  photo text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.profiles TO anon;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view profiles" ON public.profiles
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Organisers can create their own profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "Organisers can update their own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER listings_set_updated_at BEFORE UPDATE ON public.listings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER profiles_set_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();