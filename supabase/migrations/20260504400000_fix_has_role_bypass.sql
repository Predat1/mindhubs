
-- Update has_role to include super admin bypass for specific email
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email TEXT;
BEGIN
  -- Get user email from auth.users
  SELECT email INTO v_email FROM auth.users WHERE id = _user_id;
  
  -- Super admin bypass
  IF v_email = 'mobifranck94@gmail.com' THEN
    RETURN TRUE;
  END IF;

  -- Standard role check
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
END;
$$;
