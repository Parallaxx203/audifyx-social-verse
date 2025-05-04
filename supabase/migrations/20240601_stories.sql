
-- Create stories table
CREATE TABLE IF NOT EXISTS public.stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  media_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('image', 'video')),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '24 hours') NOT NULL
);

-- Set RLS
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can view stories" 
  ON public.stories 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can insert their own stories" 
  ON public.stories 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own stories" 
  ON public.stories 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own stories" 
  ON public.stories 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create a function to automatically delete expired stories
CREATE OR REPLACE FUNCTION delete_expired_stories()
RETURNS trigger AS $$
BEGIN
  DELETE FROM public.stories WHERE expires_at < NOW();
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to run the function periodically
CREATE TRIGGER trigger_delete_expired_stories
AFTER INSERT ON public.stories
EXECUTE FUNCTION delete_expired_stories();
