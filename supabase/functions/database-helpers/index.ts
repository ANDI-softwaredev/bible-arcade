
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Parse the request body
    const { name, params } = await req.json()

    // Execute the function based on the name
    let result
    if (name === 'upsert_user_badge') {
      const { p_user_id, p_badge_id, p_badge_title, p_badge_description, p_badge_icon } = params
      
      const { data, error } = await supabaseClient
        .from('user_badges')
        .upsert({
          user_id: p_user_id,
          badge_id: p_badge_id,
          badge_title: p_badge_title,
          badge_description: p_badge_description,
          badge_icon: p_badge_icon,
          earned_at: new Date().toISOString()
        }, { onConflict: 'user_id, badge_id' })
      
      result = { data, error }
    } 
    else if (name === 'get_user_badges') {
      const { p_user_id } = params
      
      const { data, error } = await supabaseClient
        .from('user_badges')
        .select('*')
        .eq('user_id', p_user_id)
        .order('earned_at', { ascending: false })
      
      result = { data, error }
    }
    else if (name === 'create_study_goal') {
      const { p_user_id, p_goal_type, p_target_value, p_progress, p_completed } = params
      
      const { data, error } = await supabaseClient
        .from('user_study_goals')
        .insert({
          user_id: p_user_id,
          goal_type: p_goal_type,
          target_value: p_target_value,
          progress: p_progress,
          completed: p_completed
        })
      
      result = { data, error }
    }
    else if (name === 'get_user_study_goals') {
      const { p_user_id } = params
      
      const { data, error } = await supabaseClient
        .from('user_study_goals')
        .select('*')
        .eq('user_id', p_user_id)
        .order('created_at', { ascending: false })
      
      result = { data, error }
    }
    else if (name === 'update_study_goal') {
      const { p_goal_id, p_user_id, p_progress, p_completed, p_target_value } = params
      
      const updateData: any = {};
      if (p_progress !== undefined) updateData.progress = p_progress;
      if (p_completed !== undefined) updateData.completed = p_completed;
      if (p_target_value !== undefined) updateData.target_value = p_target_value;
      updateData.updated_at = new Date().toISOString();
      
      const { data, error } = await supabaseClient
        .from('user_study_goals')
        .update(updateData)
        .eq('id', p_goal_id)
        .eq('user_id', p_user_id)
      
      result = { data, error }
    }
    else {
      throw new Error(`Unknown function: ${name}`)
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
