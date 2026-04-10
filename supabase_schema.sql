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
CREATE POLICY "Allow users to upload to their own folder" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'company-assets' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Allow users to update their own folder" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'company-assets' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Allow users to delete their own folder" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'company-assets' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Allow public read access" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'company-assets');

-- 6. Create the 'feedback' table for bug reports and support
CREATE TABLE IF NOT EXISTS public.feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    type TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'open',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 7. Enable RLS on the 'feedback' table
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- 8. Create RLS Policies for 'feedback'
CREATE POLICY "Users can insert their own feedback" 
ON public.feedback FOR INSERT 
WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can view their own feedback" 
ON public.feedback FOR SELECT 
USING (user_id = auth.uid()::text);
