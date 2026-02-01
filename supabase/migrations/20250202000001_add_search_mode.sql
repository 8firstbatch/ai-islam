-- Add search_mode column to user_settings table
ALTER TABLE public.user_settings 
ADD COLUMN search_mode BOOLEAN DEFAULT false NOT NULL;

-- Update the handle_new_user function to include default search_mode setting
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, avatar_url)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name'), NEW.raw_user_meta_data ->> 'avatar_url');
  
  INSERT INTO public.user_settings (user_id, is_pro_enabled, search_mode)
  VALUES (NEW.id, false, false);
  
  RETURN NEW;
END;
$$;