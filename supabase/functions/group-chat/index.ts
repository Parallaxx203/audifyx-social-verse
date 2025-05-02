
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS, GET, DELETE',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
    })
  }

  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
  )
  
  try {
    const { action, name, memberIds, userId, groupId, messageId, newMembers } = await req.json();
    
    if (action === 'create') {
      // Create a group chat
      const { data, error } = await supabaseClient.rpc('create_group_chat', {
        p_name: name,
        p_creator_id: userId,
        p_member_ids: memberIds
      });
      
      if (error) throw error;
      
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    else if (action === 'list') {
      // List user's group chats
      const { data, error } = await supabaseClient.rpc('get_user_group_chats', {
        p_user_id: userId
      });
      
      if (error) throw error;
      
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    else if (action === 'add_members') {
      // Add members to a group chat
      if (!groupId || !newMembers || newMembers.length === 0) {
        throw new Error("Missing groupId or newMembers");
      }
      
      const insertPromises = newMembers.map(memberId => 
        supabaseClient
          .from('group_chat_members')
          .insert({ group_id: groupId, user_id: memberId })
      );
      
      await Promise.all(insertPromises);
      
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    else if (action === 'remove_member') {
      // Remove a member from a group chat
      if (!groupId || !memberIds || memberIds.length === 0) {
        throw new Error("Missing groupId or memberId");
      }
      
      const { error } = await supabaseClient
        .from('group_chat_members')
        .delete()
        .eq('group_id', groupId)
        .in('user_id', memberIds);
      
      if (error) throw error;
      
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    else if (action === 'delete_message') {
      // Delete a message from a group chat (admin only)
      if (!messageId) {
        throw new Error("Missing messageId");
      }
      
      // First check if user is admin/creator of the group
      const { data: message, error: findError } = await supabaseClient
        .from('group_messages')
        .select('group_id')
        .eq('id', messageId)
        .single();
      
      if (findError) throw findError;
      
      const { data: group, error: groupError } = await supabaseClient
        .from('group_chats')
        .select('creator_id')
        .eq('id', message.group_id)
        .single();
        
      if (groupError) throw groupError;
      
      // Only allow creator to delete messages
      if (group.creator_id !== userId) {
        throw new Error("Not authorized to delete this message");
      }
      
      const { error: deleteError } = await supabaseClient
        .from('group_messages')
        .delete()
        .eq('id', messageId);
        
      if (deleteError) throw deleteError;
      
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Handle other actions as needed
    
    return new Response(JSON.stringify({ success: false, error: 'Invalid action' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
    
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
})
