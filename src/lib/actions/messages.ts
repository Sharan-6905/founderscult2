'use server';

import { createClient } from '../supabase/server';
import { revalidatePath } from 'next/cache';

export async function getOrCreateConversation(targetUserId: string) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: 'Not authenticated' };
  }

  // Check if a conversation already exists between these two users
  // This is a bit tricky in Supabase without a custom RPC function, but we can do it by finding 
  // conversations where both users are participants.
  
  // 1. Get conversations for current user
  const { data: userConversations, error: ucError } = await supabase
    .from('conversation_participants')
    .select('conversation_id')
    .eq('user_id', user.id);

  if (ucError) {
    console.error('Error fetching user conversations:', ucError);
    return { error: 'Database error' };
  }

  if (userConversations && userConversations.length > 0) {
    const conversationIds = userConversations.map(uc => uc.conversation_id);
    
    // 2. Check if the target user is in any of these conversations
    const { data: sharedConversations, error: scError } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', targetUserId)
      .in('conversation_id', conversationIds);

    if (scError) {
      console.error('Error fetching shared conversations:', scError);
    } else if (sharedConversations && sharedConversations.length > 0) {
      // Return the first shared conversation
      return { conversationId: sharedConversations[0].conversation_id };
    }
  }

  // 3. If no shared conversation exists, create a new one
  const { data: newConversation, error: createError } = await supabase
    .from('conversations')
    .insert({})
    .select('id')
    .single();

  if (createError || !newConversation) {
    console.error('Error creating conversation:', createError);
    return { error: 'Failed to create conversation' };
  }

  // 4. Add both participants
  const { error: partsError } = await supabase
    .from('conversation_participants')
    .insert([
      { conversation_id: newConversation.id, user_id: user.id },
      { conversation_id: newConversation.id, user_id: targetUserId }
    ]);

  if (partsError) {
    console.error('Error adding participants:', partsError);
    // Cleanup if possible, but for MVP just return error
    return { error: 'Failed to add participants' };
  }

  return { conversationId: newConversation.id };
}

export async function sendMessage(conversationId: string, content: string) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: 'Not authenticated' };
  }

  if (!content.trim()) {
    return { error: 'Message cannot be empty' };
  }

  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_id: user.id,
      content: content.trim()
    })
    .select()
    .single();

  if (error) {
    console.error('Error sending message:', error);
    return { error: 'Failed to send message' };
  }

  // Update conversation updated_at timestamp
  await supabase
    .from('conversations')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', conversationId);

  return { data };
}
