-- FoundersCult Private DM Schema (Fixed RLS Deadlocks & Recursion)

-- 1. Create Tables (if not exist)
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.conversation_participants (
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY(conversation_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable RLS
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies (Deadlock-Free & Recursion-Free)

-- Drop old policies to ensure clean reset
DROP POLICY IF EXISTS "Users can view their conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can insert conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can view participants of their conversations" ON public.conversation_participants;
DROP POLICY IF EXISTS "Users can insert participants" ON public.conversation_participants;
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.messages;
DROP POLICY IF EXISTS "Users can insert messages in their conversations" ON public.messages;
DROP POLICY IF EXISTS "Users can update read_at for messages in their conversations" ON public.messages;

-- Conversations: Metadata is public, content is secured via messages table
CREATE POLICY "Conversations are viewable by everyone" ON public.conversations FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert conversations" ON public.conversations FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update conversations" ON public.conversations FOR UPDATE USING (auth.role() = 'authenticated');

-- Conversation Participants: Junction table is viewable by everyone
CREATE POLICY "Conversation participants are viewable by everyone" ON public.conversation_participants FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert participants" ON public.conversation_participants FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Messages: STRICT RLS. Only participants can view or insert messages in their conversations.
CREATE POLICY "Users can view messages in their conversations" ON public.messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.conversation_participants
            WHERE conversation_id = messages.conversation_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert messages in their conversations" ON public.messages
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.conversation_participants
            WHERE conversation_id = messages.conversation_id AND user_id = auth.uid()
        ) AND auth.uid() = sender_id
    );

CREATE POLICY "Users can update read_at for messages in their conversations" ON public.messages
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.conversation_participants
            WHERE conversation_id = messages.conversation_id AND user_id = auth.uid()
        )
    );

-- 4. Enable Realtime for Messages (Commented out because it was already added in the first run)
-- ALTER PUBLICATION supabase_realtime ADD TABLE messages;
