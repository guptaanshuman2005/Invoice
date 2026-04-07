-- Supabase Schema for InvoicePro (Using Supabase Auth)

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
-- This policy ensures that users can only read, update, and delete their own companies.
CREATE POLICY "Users can only access their own companies" 
ON public.companies FOR ALL 
USING (
  owner_id = auth.uid()::text
) 
WITH CHECK (
  owner_id = auth.uid()::text
);

-- 4. Create the 'company-assets' storage bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('company-assets', 'company-assets', true)
ON CONFLICT (id) DO NOTHING;

-- 5. Enable RLS on the 'company-assets' bucket
CREATE POLICY "Allow all operations for authenticated users on company-assets" 
ON storage.objects FOR ALL 
USING (bucket_id = 'company-assets') WITH CHECK (bucket_id = 'company-assets');
