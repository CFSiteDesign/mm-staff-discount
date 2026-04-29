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

    // Issue a pass automatically and email it (only for newly-added creators
    // to avoid spamming on every resync)
    let passCreated = false;
    if (!existing && fullName) {
      // Check if the creator already has an active pass in staff_passes
      const { data: existingPass } = await supabase
        .from('staff_passes')
        .select('id, status, expires_at')
        .eq('email', email)
        .eq('status', 'active')
        .maybeSingle();

      const stillValid = existingPass && new Date(existingPass.expires_at).getTime() > Date.now();

      if (!stillValid) {
        const firstName = fullName.split(' ')[0].toUpperCase().replace(/[^A-Z]/g, '');
        const domainClean = (email.split('@')[1] || 'CREATOR').split('.')[0].toUpperCase().replace(/[^A-Z]/g, '');
        const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
        const code = `${firstName}-${domainClean}-${rand}`;
        const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
        const id = Date.now().toString();

        const { error: passError } = await supabase.from('staff_passes').insert({
          id,
          full_name: fullName,
          email,
          photo: null,
          photo_url: null,
          code,
          date_issued: new Date().toISOString(),
          expires_at: expiresAt,
          status: 'active',
          revoke_reason: null,
        });

        if (!passError) {
          passCreated = true;
          await supabase.from('activity_log').insert({
            action: 'pass_issued',
            details: `Pass auto-issued to creator ${fullName} (${email})`,
          });

          // Fire approval email (same template as registered users)
          try {
            await supabase.functions.invoke('send-pass-email', {
              body: { fullName, email, code, expiresAt, photo: '' },
            });
          } catch (err) {
            console.error('Failed to send creator approval email:', err);
          }
        } else {
          console.error('Failed to create pass for creator:', passError);
        }
      }
    }

    return new Response(JSON.stringify({
      success: true,
      email,
      created: !existing,
      pass_issued: passCreated,
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