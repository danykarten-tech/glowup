-- Create the trigger to auto-create profiles for new users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert profiles for any existing users that don't have one
INSERT INTO public.profiles (id, full_name)
SELECT u.id, u.raw_user_meta_data ->> 'full_name'
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL;