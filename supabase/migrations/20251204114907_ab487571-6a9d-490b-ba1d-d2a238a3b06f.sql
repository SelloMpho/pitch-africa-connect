-- Create verifications table
CREATE TABLE public.verifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('company', 'investor')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  documents_count INTEGER NOT NULL DEFAULT 0,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.verifications ENABLE ROW LEVEL SECURITY;

-- Admin can view all verifications
CREATE POLICY "Admins can view all verifications"
ON public.verifications
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Admin can update verifications
CREATE POLICY "Admins can update verifications"
ON public.verifications
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Users can view their own verifications
CREATE POLICY "Users can view own verifications"
ON public.verifications
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own verifications
CREATE POLICY "Users can insert own verifications"
ON public.verifications
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_verifications_updated_at
BEFORE UPDATE ON public.verifications
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.verifications;