CREATE POLICY "No direct access; server only"
ON public.message_rate_limits
AS RESTRICTIVE
FOR ALL
TO anon, authenticated
USING (false)
WITH CHECK (false);