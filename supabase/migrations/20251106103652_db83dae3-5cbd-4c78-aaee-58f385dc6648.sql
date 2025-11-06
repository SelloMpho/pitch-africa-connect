-- Add additional fields to profiles table for comprehensive user data
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS industry TEXT,
ADD COLUMN IF NOT EXISTS founding_year INTEGER,
ADD COLUMN IF NOT EXISTS funding_stage TEXT,
ADD COLUMN IF NOT EXISTS funding_amount_needed DECIMAL,
ADD COLUMN IF NOT EXISTS pitch_summary TEXT,
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS investment_focus TEXT[],
ADD COLUMN IF NOT EXISTS ticket_size_min DECIMAL,
ADD COLUMN IF NOT EXISTS ticket_size_max DECIMAL,
ADD COLUMN IF NOT EXISTS preferred_stages TEXT[],
ADD COLUMN IF NOT EXISTS portfolio_count INTEGER;