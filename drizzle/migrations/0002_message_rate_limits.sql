CREATE TABLE public.message_rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.message_rate_limits TO service_role;

ALTER TABLE public.message_rate_limits ENABLE ROW LEVEL SECURITY;

CREATE INDEX message_rate_limits_ip_hash_created_at_idx
  ON public.message_rate_limits (ip_hash, created_at);

-- Records one message attempt for a sender and says whether it is allowed.
-- Forgets attempts older than the window, so nothing is kept longer than an hour.
CREATE OR REPLACE FUNCTION public.take_message_slot(_ip_hash text, _max integer, _window_seconds integer)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  recent integer;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext(_ip_hash));
  DELETE FROM public.message_rate_limits
    WHERE created_at < now() - make_interval(secs => _window_seconds);
  SELECT count(*) INTO recent FROM public.message_rate_limits WHERE ip_hash = _ip_hash;
  IF recent >= _max THEN
    RETURN false;
  END IF;
  INSERT INTO public.message_rate_limits (ip_hash) VALUES (_ip_hash);
  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.take_message_slot(text, integer, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.take_message_slot(text, integer, integer) TO service_role;