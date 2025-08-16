-- Create team_members table
CREATE TABLE public.team_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  short_bio TEXT NOT NULL,
  full_bio TEXT,
  photo_url TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Allow public read access" 
ON public.team_members 
FOR SELECT 
USING (true);

-- Create policies for admin management
CREATE POLICY "Admins can manage team members" 
ON public.team_members 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM admin_users
  WHERE admin_users.id = auth.uid() AND admin_users.is_active = true
));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_team_members_updated_at
BEFORE UPDATE ON public.team_members
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();