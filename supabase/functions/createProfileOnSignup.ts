
// This will be implemented as a database trigger
// We'll set up a PostgreSQL trigger to create a profile when a new user signs up

/*
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    username, 
    email,
    role
  ) VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'username',
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'accountType', 'listener')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create a profile when a new user signs up
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
*/

// Note: The above SQL will be implemented as a database trigger in Supabase
// No actual code needs to be executed here
