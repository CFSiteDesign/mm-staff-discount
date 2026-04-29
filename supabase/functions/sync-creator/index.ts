import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const fullName = typeof body.full_name === 'string' ? body.full_name.trim() : '';
    const creatorId = typeof body.creator_id === 'string' ? body.creator_id.trim() : '';

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(JSON.stringify({ error: 'Valid email is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    const { data: existing } = await supabase
      .from('approved_creator_emails')
      .select('id, is_active')
      .eq('email', email)
      .maybeSingle();

    const { error: upsertError } = await supabase
      .from('approved_creator_emails')
      .upsert({
        email,
        full_name: fullName || null,
        creator_id: creatorId || null,
        source: 'creator_hub',
        is_active: true,
        synced_at: new Date().toISOString(),
      }, { onConflict: 'email' });

    if (upsertError) {
      throw new Error(`Database error: ${upsertError.message}`);
    }

    // Log activity
    await supabase.from('activity_log').insert({
      action: existing ? 'creator_resynced' : 'creator_synced',
      details: `Creator ${fullName || email} synced from Creator Hub`,
    });

    return new Response(JSON.stringify({
      success: true,
      email,
      created: !existing,
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('sync-creator error:', error);
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ success: false, error: msg }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});