
-- Create a function to create the social_room_messages table if it doesn't exist
CREATE OR REPLACE FUNCTION public.create_social_room_messages_table()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- Check if the table exists
  IF NOT EXISTS (
    SELECT FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'social_room_messages'
  ) THEN
    -- Create social room messages table
    CREATE TABLE public.social_room_messages (
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
  END IF;
END;
$$;
