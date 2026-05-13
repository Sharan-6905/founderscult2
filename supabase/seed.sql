-- FoundersCult DB Seed Data

-- Insert Streams
INSERT INTO public.streams (name, slug, description, icon) VALUES
('ai-ml', 'ai-ml', 'Artificial Intelligence and Machine Learning', 'Activity'),
('saas', 'saas', 'Software as a Service businesses', 'Briefcase'),
('fundraising', 'fundraising', 'Pitch decks, VCs, and raising money', 'Users'),
('open-source', 'open-source', 'FOSS projects and community building', 'Code'),
('design', 'design', 'UI/UX, branding, and aesthetics', 'Paintbrush'),
('ship-it', 'ship-it', 'Showcase your launches and updates', 'Rocket'),
('hiring', 'hiring', 'Find co-founders and early employees', 'Users'),
('growth', 'growth', 'Marketing, SEO, and sales strategies', 'Activity'),
('dev-tools', 'dev-tools', 'Tools for developers by developers', 'Wrench'),
('side-projects', 'side-projects', 'Weekend projects and indie hacking', 'Zap')
ON CONFLICT (slug) DO NOTHING;

-- We can't easily seed profiles via raw SQL without UUIDs from auth.users,
-- but users can manually create accounts or the edge function handles it.
-- In a real setup, you would create auth users via the Supabase Admin API,
-- and the trigger would generate the profiles.

-- For the sake of the seed script if ran directly, we will insert mock profiles
-- and mock posts by generating random UUIDs and disabling the foreign key checks temporarily,
-- or just assume the frontend handles the mock data fallback until users sign up.

-- Let's insert a mock user if testing without auth.users constraint
-- Note: This might fail if the foreign key to auth.users is strictly enforced,
-- so typically you'd register via the UI first.

-- The recommended approach for this app is:
-- 1. Sign up a few users via the UI.
-- 2. Create posts via the UI.
-- 3. The UI uses the realtime features to update.
