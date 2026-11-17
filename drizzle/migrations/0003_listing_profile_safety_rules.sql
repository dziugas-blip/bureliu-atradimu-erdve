ALTER TABLE public.listings
  ADD CONSTRAINT listings_title_length CHECK (char_length(title) BETWEEN 3 AND 100),
  ADD CONSTRAINT listings_description_length CHECK (char_length(description) BETWEEN 30 AND 3000),
  ADD CONSTRAINT listings_address_length CHECK (char_length(address) BETWEEN 3 AND 150),
  ADD CONSTRAINT listings_price_range CHECK (price >= 0 AND price <= 10000),
  ADD CONSTRAINT listings_photos_max CHECK (cardinality(photos) <= 5),
  ADD CONSTRAINT listings_ages_min CHECK (cardinality(ages) >= 1),
  ADD CONSTRAINT listings_category_valid CHECK (category IN ('Šokiai','Sportas','Menai','IT ir robotika','Muzika','Kalbos')),
  ADD CONSTRAINT listings_audience_valid CHECK (audience IN ('Vaikams','Suaugusiems','Visiems')),
  ADD CONSTRAINT listings_gender_valid CHECK (gender IN ('Berniukams','Mergaitėms','Visiems')),
  ADD CONSTRAINT listings_perks_valid CHECK (perks <@ ARRAY['nvs','trial']::text[]),
  ADD CONSTRAINT listings_website_http CHECK (website IS NULL OR website ~* '^https?://');

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_name_length CHECK (char_length(name) <= 100),
  ADD CONSTRAINT profiles_headline_length CHECK (char_length(headline) <= 120),
  ADD CONSTRAINT profiles_bio_length CHECK (char_length(bio) <= 2000),
  ADD CONSTRAINT profiles_age_format CHECK (age = '' OR age ~ '^[0-9]{1,2}$');

-- At most 20 new listings per organiser in any rolling 24 hours.
CREATE OR REPLACE FUNCTION public.enforce_listing_daily_limit()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  recent integer;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext('listing_limit:' || NEW.organizer_id::text));
  SELECT count(*) INTO recent
    FROM public.listings
    WHERE organizer_id = NEW.organizer_id
      AND created_at > now() - interval '24 hours';
  IF recent >= 20 THEN
    RAISE EXCEPTION 'listing_daily_limit: at most 20 listings per 24 hours'
      USING ERRCODE = 'P0001';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER listings_daily_limit
  BEFORE INSERT ON public.listings
  FOR EACH ROW EXECUTE FUNCTION public.enforce_listing_daily_limit();

-- The owner and creation time of a listing never change.
CREATE OR REPLACE FUNCTION public.protect_listing_immutable_columns()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.organizer_id IS DISTINCT FROM OLD.organizer_id THEN
    RAISE EXCEPTION 'organizer_id cannot be changed' USING ERRCODE = 'P0001';
  END IF;
  IF NEW.created_at IS DISTINCT FROM OLD.created_at THEN
    RAISE EXCEPTION 'created_at cannot be changed' USING ERRCODE = 'P0001';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER listings_immutable_columns
  BEFORE UPDATE ON public.listings
  FOR EACH ROW EXECUTE FUNCTION public.protect_listing_immutable_columns();

REVOKE ALL ON FUNCTION public.enforce_listing_daily_limit() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.protect_listing_immutable_columns() FROM PUBLIC, anon, authenticated;

CREATE INDEX IF NOT EXISTS listings_created_at_desc_idx ON public.listings (created_at DESC);
CREATE INDEX IF NOT EXISTS listings_city_idx ON public.listings (city);