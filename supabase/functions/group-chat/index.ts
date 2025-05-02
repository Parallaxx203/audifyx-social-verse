
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
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
    const { action, name, memberIds, userId } = await req.json();
    
    if (action === 'create') {
      // Create a group chat
      const { data, error } = await supabaseClient.rpc('create_group_chat', {
        p_name: name,
        p_creator_id: supabaseClient.auth.getUser().then(res => res.data.user?.id) || '',
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
