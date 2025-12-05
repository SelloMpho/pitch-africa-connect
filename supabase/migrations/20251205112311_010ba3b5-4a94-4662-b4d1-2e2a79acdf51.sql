-- Create content table for platform content management
CREATE TABLE public.content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'article',
  status TEXT NOT NULL DEFAULT 'draft',
  views INTEGER NOT NULL DEFAULT 0,
  content_body TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.content ENABLE ROW LEVEL SECURITY;

-- Admins can view all content
CREATE POLICY "Admins can view all content"
ON public.content
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Admins can insert content
CREATE POLICY "Admins can insert content"
ON public.content
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Admins can update content
CREATE POLICY "Admins can update content"
ON public.content
FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

-- Admins can delete content
CREATE POLICY "Admins can delete content"
ON public.content
FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- Public can view published content
CREATE POLICY "Public can view published content"
ON public.content
FOR SELECT
USING (status = 'published');

-- Add trigger for updated_at
CREATE TRIGGER update_content_updated_at
BEFORE UPDATE ON public.content
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.content;