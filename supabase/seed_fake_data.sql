-- SEEDING FAKE DATA FOR FOUNDERSCULT
-- Run this in your Supabase SQL Editor

DO $$
DECLARE
    founder_id UUID;
BEGIN
    -- Get the first available user ID
    SELECT id INTO founder_id FROM auth.users LIMIT 1;

    IF founder_id IS NOT NULL THEN
        -- Insert Global Feed Posts
        INSERT INTO public.posts (author_id, content, stream_slug, likes_count, comments_count)
        VALUES 
        (founder_id, 'Just closed our pre-seed round! The ritual continues. #Global #Founders', 'all', 42, 12),
        (founder_id, 'What is the one metric that actually matters for a day-1 startup? For us, it was user retention over acquisition.', 'all', 28, 5),
        (founder_id, 'Bangalore founders: Who is up for a late-night whiteboard session at Third Wave?', 'all', 15, 8);

        -- Insert SaaS Feed Posts
        INSERT INTO public.posts (author_id, content, stream_slug, likes_count, comments_count)
        VALUES 
        (founder_id, 'SaaS Tip: Don''t offer annual discounts too early. You need the monthly feedback loop more than the upfront cash in the first 6 months.', 'saas', 56, 14),
        (founder_id, 'Our churn dropped by 15% after we added a simple 1-question exit survey. Data is the new oil.', 'saas', 33, 9),
        (founder_id, 'Build in public or build in private? In SaaS, building in public is the best marketing channel for builders.', 'saas', 89, 21);

        RAISE NOTICE 'Fake data injected for user %', founder_id;
    ELSE
        RAISE NOTICE 'No user found. Please sign up at least one user first.';
    END IF;
END $$;
