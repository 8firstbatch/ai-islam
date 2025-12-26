-- Add is_pro_enabled column to user_settings table
ALTER TABLE public.user_settings 
ADD COLUMN is_pro_enabled BOOLEAN DEFAULT false NOT NULL;

-- Update the handle_new_user function to include default pro setting
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, avatar_url)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name'), NEW.raw_user_meta_data ->> 'avatar_url');
  
  INSERT INTO public.user_settings (user_id, is_pro_enabled)
  VALUES (NEW.id, false);
  
  RETURN NEW;
END;
$$;