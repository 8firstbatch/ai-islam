-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    display_name text,
    avatar_url text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT profiles_pkey PRIMARY KEY (id),
    CONSTRAINT profiles_user_id_key UNIQUE (user_id),
    CONSTRAINT profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create user_settings table
CREATE TABLE IF NOT EXISTS public.user_settings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    theme text DEFAULT 'light'::text NOT NULL,
    ai_model text DEFAULT 'google/gemini-2.5-flash'::text NOT NULL,
    ai_response_style text DEFAULT 'balanced'::text NOT NULL,
    is_pro_enabled boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT user_settings_pkey PRIMARY KEY (id),
    CONSTRAINT user_settings_user_id_key UNIQUE (user_id),
    CONSTRAINT user_settings_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
    CONSTRAINT user_settings_ai_response_style_check CHECK ((ai_response_style = ANY (ARRAY['concise'::text, 'balanced'::text, 'detailed'::text]))),
    CONSTRAINT user_settings_theme_check CHECK ((theme = ANY (ARRAY['light'::text, 'dark'::text, 'system'::text])))
);

-- Create conversations table
CREATE TABLE IF NOT EXISTS public.conversations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    title text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT conversations_pkey PRIMARY KEY (id),
    CONSTRAINT conversations_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create messages table
CREATE TABLE IF NOT EXISTS public.messages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    conversation_id uuid NOT NULL,
    role text NOT NULL,
    content text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT messages_pkey PRIMARY KEY (id),
    CONSTRAINT messages_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.conversations(id) ON DELETE CASCADE,
    CONSTRAINT messages_role_check CHECK ((role = ANY (ARRAY['user'::text, 'assistant'::text])))
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY IF NOT EXISTS "Users can view own profile" ON public.profiles FOR SELECT USING ((auth.uid() = user_id));
CREATE POLICY IF NOT EXISTS "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK ((auth.uid() = user_id));
CREATE POLICY IF NOT EXISTS "Users can update own profile" ON public.profiles FOR UPDATE USING ((auth.uid() = user_id));

-- Create RLS policies for user_settings
CREATE POLICY IF NOT EXISTS "Users can view own settings" ON public.user_settings FOR SELECT USING ((auth.uid() = user_id));
CREATE POLICY IF NOT EXISTS "Users can insert own settings" ON public.user_settings FOR INSERT WITH CHECK ((auth.uid() = user_id));
CREATE POLICY IF NOT EXISTS "Users can update own settings" ON public.user_settings FOR UPDATE USING ((auth.uid() = user_id));

-- Create RLS policies for conversations
CREATE POLICY IF NOT EXISTS "Users can view own conversations" ON public.conversations FOR SELECT USING ((auth.uid() = user_id));
CREATE POLICY IF NOT EXISTS "Users can insert own conversations" ON public.conversations FOR INSERT WITH CHECK ((auth.uid() = user_id));
CREATE POLICY IF NOT EXISTS "Users can update own conversations" ON public.conversations FOR UPDATE USING ((auth.uid() = user_id));
CREATE POLICY IF NOT EXISTS "Users can delete own conversations" ON public.conversations FOR DELETE USING ((auth.uid() = user_id));

-- Create RLS policies for messages
CREATE POLICY IF NOT EXISTS "Users can view messages from own conversations" ON public.messages FOR SELECT USING ((EXISTS (SELECT 1 FROM public.conversations WHERE ((conversations.id = messages.conversation_id) AND (conversations.user_id = auth.uid())))));
CREATE POLICY IF NOT EXISTS "Users can insert messages to own conversations" ON public.messages FOR INSERT WITH CHECK ((EXISTS (SELECT 1 FROM public.conversations WHERE ((conversations.id = messages.conversation_id) AND (conversations.user_id = auth.uid())))));
CREATE POLICY IF NOT EXISTS "Users can update messages in own conversations" ON public.messages FOR UPDATE USING ((EXISTS (SELECT 1 FROM public.conversations WHERE ((conversations.id = messages.conversation_id) AND (conversations.user_id = auth.uid())))));
CREATE POLICY IF NOT EXISTS "Users can delete messages from own conversations" ON public.messages FOR DELETE USING ((EXISTS (SELECT 1 FROM public.conversations WHERE ((conversations.id = messages.conversation_id) AND (conversations.user_id = auth.uid())))));

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER IF NOT EXISTS update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER IF NOT EXISTS update_user_settings_updated_at BEFORE UPDATE ON public.user_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER IF NOT EXISTS update_conversations_updated_at BEFORE UPDATE ON public.conversations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, avatar_url)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name'), NEW.raw_user_meta_data ->> 'avatar_url');
  
  INSERT INTO public.user_settings (user_id, is_pro_enabled)
  VALUES (NEW.id, false);
  
  RETURN NEW;
END;
$$ language 'plpgsql' security definer;

-- Create trigger for new user registration
CREATE TRIGGER IF NOT EXISTS on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();