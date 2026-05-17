import { useEffect, useState } from 'react';
import { supabase } from '../supabase/client';

export type Conversation = {
  id: string;
  created_at: string;
  updated_at: string;
  other_user?: {
    id: string;
    name: string;
    username: string;
    avatar: string;
  };
  last_message?: {
    content: string;
    created_at: string;
  };
};

export type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  read_at?: string | null;
};

export function useConversations(userId: string | null) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setConversations([]);
      setLoading(false);
      return;
    }

    fetchConversations();

    // Subscribe to conversation updates (or new messages)
    const channel = supabase
      .channel(`user_conversations_${userId}_${Math.random().toString(36).substring(2, 9)}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'messages'
      }, () => {
        fetchConversations();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  async function fetchConversations() {
    if (!userId) return;
    try {
      setLoading(true);
      
      // 1. Get all conversation IDs for this user
      const { data: parts, error: partsError } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', userId);

      if (partsError || !parts || parts.length === 0) {
        setConversations([]);
        setLoading(false);
        return;
      }

      const conversationIds = parts.map(p => p.conversation_id);

      // 2. Fetch conversations with participants and last message
      const { data: convData, error: convError } = await supabase
        .from('conversations')
        .select(`
          id,
          created_at,
          updated_at,
          conversation_participants (
            user_id,
            profiles (
              id,
              full_name,
              username,
              avatar_url
            )
          ),
          messages (
            content,
            created_at
          )
        `)
        .in('id', conversationIds)
        .order('updated_at', { ascending: false });

      if (convError || !convData) {
        console.error('Error fetching conversations:', convError);
        setConversations([]);
        setLoading(false);
        return;
      }

      // Format conversations
      const formatted: Conversation[] = convData.map((conv: any) => {
        // Find the other participant
        const otherPart = conv.conversation_participants?.find((p: any) => p.user_id !== userId);
        const profile = otherPart?.profiles ? (Array.isArray(otherPart.profiles) ? otherPart.profiles[0] : otherPart.profiles) : null;
        
        // Find last message (messages are usually returned in order or we grab the latest)
        let lastMsg = null;
        if (conv.messages && conv.messages.length > 0) {
          // Sort messages by created_at desc to get the latest
          const sortedMsgs = [...conv.messages].sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          lastMsg = sortedMsgs[0];
        }

        return {
          id: conv.id,
          created_at: conv.created_at,
          updated_at: conv.updated_at,
          other_user: profile ? {
            id: profile.id,
            name: profile.full_name || 'Unknown Founder',
            username: profile.username || 'founder',
            avatar: profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.full_name || 'F')}&background=050505&color=fff`
          } : {
            id: 'unknown',
            name: 'Unknown Founder',
            username: 'founder',
            avatar: 'https://ui-avatars.com/api/?name=U&background=050505&color=fff'
          },
          last_message: lastMsg ? {
            content: lastMsg.content,
            created_at: lastMsg.created_at
          } : undefined
        };
      });

      setConversations(formatted);
    } catch (err) {
      console.error('Error in fetchConversations:', err);
    } finally {
      setLoading(false);
    }
  }

  return { conversations, loading, refetch: fetchConversations };
}

export function useChatMessages(conversationId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    fetchMessages();

    const channelId = `chat_${conversationId}_${Math.random().toString(36).substring(2, 9)}`;
    const channel = supabase
      .channel(channelId)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`
      }, (payload) => {
        const newMsg = payload.new as Message;
        setMessages(prev => {
          // Avoid duplicates if sender already added optimistic message
          if (prev.some(m => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  async function fetchMessages() {
    if (!conversationId) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        return;
      }

      if (data) {
        setMessages(data);
      }
    } catch (err) {
      console.error('Error in fetchMessages:', err);
    } finally {
      setLoading(false);
    }
  }

  return { messages, loading, refetch: fetchMessages };
}
