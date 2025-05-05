
-- Create social room messages table
CREATE TABLE IF NOT EXISTS public.social_room_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.social_room_messages ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view social room messages"
  ON public.social_room_messages
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert messages"
  ON public.social_room_messages
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own messages" 
  ON public.social_room_messages
  FOR DELETE
  USING (auth.uid() = user_id);

-- Enable real-time functionality
ALTER PUBLICATION supabase_realtime ADD TABLE social_room_messages;
