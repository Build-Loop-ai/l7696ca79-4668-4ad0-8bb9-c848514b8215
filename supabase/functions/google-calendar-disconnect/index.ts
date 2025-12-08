import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { organizationId } = await req.json();
    console.log('Disconnecting Google Calendar for organization:', organizationId);

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Get the current refresh token to revoke it
    const { data: settings, error: fetchError } = await supabase
      .from('organization_settings')
      .select('google_calendar_refresh_token')
      .eq('organization_id', organizationId)
      .single();

    if (fetchError) {
      console.error('Failed to fetch settings:', fetchError);
      throw new Error('Failed to fetch calendar settings');
    }

    // Try to revoke the token with Google (best effort)
    if (settings?.google_calendar_refresh_token) {
      try {
        await fetch(`https://oauth2.googleapis.com/revoke?token=${settings.google_calendar_refresh_token}`, {
          method: 'POST',
        });
        console.log('Token revoked with Google');
      } catch (revokeError) {
        console.warn('Failed to revoke token with Google:', revokeError);
        // Continue anyway - we'll still disconnect locally
      }
    }

    // Clear calendar connection from database
    const { error: updateError } = await supabase
      .from('organization_settings')
      .update({
        google_calendar_refresh_token: null,
        google_calendar_connected: false,
        google_calendar_email: null,
        google_calendar_id: 'primary',
      })
      .eq('organization_id', organizationId);

    if (updateError) {
      console.error('Failed to update settings:', updateError);
      throw new Error('Failed to disconnect calendar');
    }

    console.log('Calendar disconnected successfully');
    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Google Calendar Disconnect Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
