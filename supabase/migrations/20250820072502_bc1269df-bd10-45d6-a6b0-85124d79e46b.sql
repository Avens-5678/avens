-- Add location field to form_submissions table
ALTER TABLE public.form_submissions 
ADD COLUMN location text;

-- Create FAQ table for FAQ management
CREATE TABLE public.faq (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question text NOT NULL,
  answer text NOT NULL,
  category text,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on FAQ table
ALTER TABLE public.faq ENABLE ROW LEVEL SECURITY;

-- Create policy for FAQ access
CREATE POLICY "Allow all access to faq" 
ON public.faq 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Add ecommerce enhancements to rentals table
ALTER TABLE public.rentals 
ADD COLUMN quantity integer DEFAULT 1,
ADD COLUMN size_options text[],
ADD COLUMN rating numeric(2,1) DEFAULT 0.0,
ADD COLUMN categories text[] DEFAULT '{}',
ADD COLUMN search_keywords text;

-- Add trigger for updated_at on FAQ
CREATE TRIGGER update_faq_updated_at
BEFORE UPDATE ON public.faq
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();