-- Supabase Schema for InvoicePro (Using Firebase Auth)

-- 1. Create the 'companies' table
CREATE TABLE IF NOT EXISTS public.companies (
    id TEXT PRIMARY KEY,
    owner_id TEXT NOT NULL,
    data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Enable Row Level Security (RLS) on the 'companies' table
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies for 'companies'
-- Since we are using Firebase for Auth, Supabase sees requests as 'anon'.
-- For a production app, you should configure Supabase to verify Firebase JWTs.
-- For now, we allow anon access but filter by owner_id in the application code.

CREATE POLICY "Allow all operations for anon (Firebase Auth handles security)" 
ON public.companies FOR ALL 
USING (true) WITH CHECK (true);

-- 4. Create the 'company-assets' storage bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('company-assets', 'company-assets', true)
ON CONFLICT (id) DO NOTHING;

-- 5. Enable RLS on the 'company-assets' bucket
CREATE POLICY "Allow all operations for anon on company-assets" 
ON storage.objects FOR ALL 
USING (bucket_id = 'company-assets') WITH CHECK (bucket_id = 'company-assets');
