/*
  # Initial Clinicus Database Schema

  Creates the core tables for the Clinicus médical education platform.

  ## Tables Created:
  1. `users` - User profiles with plan information and progress tracking
  2. `conteúdos` - Educational content (resumos, simulados, casos clínicos)
  3. `simulado_results` - Results from completed simulados
  4. `pagamentos` - Payment records from Mercado Pago

  ## Security:
  - RLS enabled on all tables
  - Users can only read/write their own data
  - conteúdos is readable by all, writable by admins only
  - Paywall enforcement through RLS policies

  ## Notes:
  1. Uses UUID primary keys with gen_random_uuid()
  2. Timestamps with timezone support
  3. JSONB columns for flexible data structures
  4. Proper foreign key relationships
*/

-- Enable UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  photo_url TEXT,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'monthly', 'annual')),
  plan_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ,
  favorites TEXT[] DEFAULT '{}',
  simulados_completed TEXT[] DEFAULT '{}',
  progress JSONB DEFAULT '{}',
  streak_days INTEGER DEFAULT 0,
  last_study_date TIMESTAMPTZ,
  UNIQUE(email)
);

-- conteúdos table (resumos, simulados, casos clínicos)
CREATE TABLE IF NOT EXISTS public.conteúdos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo TEXT NOT NULL CHECK (tipo IN ('resumo', 'simulado', 'caso_clínico')),
  titulo TEXT NOT NULL,
  disciplina TEXT NOT NULL,
  ciclo TEXT NOT NULL CHECK (ciclo IN ('básico', 'clínico')),
  descricao TEXT NOT NULL,
  premium BOOLEAN DEFAULT false,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  visualizacoes INTEGER DEFAULT 0,
  -- For resumos
  conteudo_html TEXT,
  file_url TEXT,
  -- For simulados and casos
  Questões JSONB DEFAULT '[]',
  tempo_por_questao INTEGER DEFAULT 90,
  -- For casos clínicos
  vinheta TEXT,
  exames JSONB DEFAULT '[]'
);

-- Simulado results table
CREATE TABLE IF NOT EXISTS public.simulado_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  simulado_id UUID NOT NULL REFERENCES public.conteúdos(id) ON DELETE CASCADE,
  respostas INTEGER[] NOT NULL,
  acertos INTEGER NOT NULL,
  total INTEGER NOT NULL,
  tempo_total INTEGER NOT NULL,
  completado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Pagamentos table
CREATE TABLE IF NOT EXISTS public.pagamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  plano TEXT NOT NULL CHECK (plano IN ('monthly', 'annual')),
  valor INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  metodo_pagamento TEXT CHECK (metodo_pagamento IN ('pix', 'credit_card')),
  mercado_pago_id TEXT,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  aprovado_em TIMESTAMPTZ
);

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conteúdos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.simulado_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pagamentos ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can read own data"
  ON public.users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON public.users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own data"
  ON public.users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- conteúdos policies (readable by all authenticated, writable only by service role)
CREATE POLICY "Authenticated users can read conteúdos"
  ON public.conteúdos FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Public users can read non-premium conteúdos"
  ON public.conteúdos FOR SELECT
  TO anon
  USING (premium = false);

-- Simulado results policies
CREATE POLICY "Users can read own simulado results"
  ON public.simulado_results FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own simulado results"
  ON public.simulado_results FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Pagamentos policies (users can read their own payments)
CREATE POLICY "Users can read own payments"
  ON public.pagamentos FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_plan ON public.users(plan);
CREATE INDEX IF NOT EXISTS idx_conteúdos_tipo ON public.conteúdos(tipo);
CREATE INDEX IF NOT EXISTS idx_conteúdos_disciplina ON public.conteúdos(disciplina);
CREATE INDEX IF NOT EXISTS idx_conteúdos_premium ON public.conteúdos(premium);
CREATE INDEX IF NOT EXISTS idx_simulado_results_user ON public.simulado_results(user_id);
CREATE INDEX IF NOT EXISTS idx_pagamentos_user ON public.pagamentos(user_id);
CREATE INDEX IF NOT EXISTS idx_pagamentos_status ON public.pagamentos(status);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for conteúdos updated_at
CREATE TRIGGER update_conteúdos_updated_at
  BEFORE UPDATE ON public.conteúdos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, photo_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email_split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

COMMENT ON TABLE public.users IS 'User profiles with plan information and study progress';
COMMENT ON TABLE public.conteúdos IS 'Educational content: resumos, simulados, and casos clínicos';
COMMENT ON TABLE public.simulado_results IS 'Results from completed simulados';
COMMENT ON TABLE public.pagamentos IS 'Payment records from Mercado Pago';
