import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Create admin client with service role
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
    
    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    // Create user client to get user info
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseUser = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } }
    });
    
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized: ' + (userError?.message || 'No user found'));
    }

    console.log('Processing onboarding for user:', user.id);

    const { businessData, hours, services, aiConfig } = await req.json();

    // Validate required fields
    if (!businessData?.name) {
      throw new Error('Business name is required');
    }

    // 1. Create organization using service role (bypasses RLS)
    const { data: org, error: orgError } = await supabaseAdmin
      .from('organizations')
      .insert({
        name: businessData.name,
        business_type: businessData.type || 'other',
        address: {
          street: businessData.address || '',
          city: businessData.city || '',
          postal_code: businessData.postalCode || '',
        },
        phone: businessData.phone || null,
        website: businessData.website || null,
      })
      .select()
      .single();

    if (orgError) {
      console.error('Failed to create organization:', orgError);
      throw new Error('Failed to create organization: ' + orgError.message);
    }

    console.log('Created organization:', org.id);

    // 2. Create organization settings
    const { error: settingsError } = await supabaseAdmin
      .from('organization_settings')
      .insert({
        organization_id: org.id,
        business_hours: hours || {},
        services: (services || []).map((name: string) => ({ name, duration: 30 })),
        language: aiConfig?.language || 'en-US',
        voice_provider: aiConfig?.voiceProvider || 'azure',
        voice_id: aiConfig?.voice || 'en-US-AriaNeural',
        custom_greeting: aiConfig?.greeting || 'Hello! Thank you for calling. How can I help you today?',
        transcriber_language: (aiConfig?.language || 'en-US').split('-')[0] || 'en',
        ai_config: {
          voice_id: aiConfig?.voice || 'en-US-AriaNeural',
          personality: 'professional',
          greeting: aiConfig?.greeting || 'Hello! Thank you for calling. How can I help you today?',
          language: aiConfig?.language || 'en-US',
          additional_languages: [],
        },
      });

    if (settingsError) {
      console.error('Failed to create settings:', settingsError);
      throw new Error('Failed to create settings: ' + settingsError.message);
    }

    console.log('Created organization settings');

    // 3. Create user role (owner)
    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .insert({
        user_id: user.id,
        organization_id: org.id,
        role: 'owner',
      });

    if (roleError) {
      console.error('Failed to create user role:', roleError);
      throw new Error('Failed to create user role: ' + roleError.message);
    }

    console.log('Created user role');

    // 4. Update profile with organization
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({
        organization_id: org.id,
        onboarding_completed: true,
      })
      .eq('id', user.id);

    if (profileError) {
      console.error('Failed to update profile:', profileError);
      throw new Error('Failed to update profile: ' + profileError.message);
    }

    console.log('Updated profile');

    // 5. Create subscription (trial)
    const { error: subError } = await supabaseAdmin
      .from('subscriptions')
      .insert({
        organization_id: org.id,
        plan: 'starter',
        status: 'trialing',
        minutes_included: 100,
        minutes_used: 0,
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      });

    if (subError) {
      console.error('Failed to create subscription:', subError);
      throw new Error('Failed to create subscription: ' + subError.message);
    }

    console.log('Created subscription');

    // 6. Try to create Vapi assistant (non-blocking)
    let assistantId = null;
    try {
      const vapiResponse = await fetch(`${supabaseUrl}/functions/v1/create-vapi-assistant`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${serviceRoleKey}`,
        },
        body: JSON.stringify({ organizationId: org.id }),
      });
      
      if (vapiResponse.ok) {
        const vapiData = await vapiResponse.json();
        assistantId = vapiData?.assistantId;
        console.log('Created Vapi assistant:', assistantId);
      } else {
        console.error('Vapi assistant creation failed:', await vapiResponse.text());
      }
    } catch (vapiErr) {
      console.error('Failed to create Vapi assistant:', vapiErr);
    }

    console.log('Onboarding completed successfully');

    return new Response(
      JSON.stringify({
        success: true,
        organizationId: org.id,
        assistantId,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An error occurred during onboarding';
    console.error('Onboarding error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
