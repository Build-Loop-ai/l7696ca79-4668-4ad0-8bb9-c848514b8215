import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GOOGLE_CLIENT_ID = Deno.env.get('GOOGLE_CLIENT_ID');
const GOOGLE_CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

// Refresh access token using refresh token
async function getAccessToken(refreshToken: string): Promise<string> {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID!,
      client_secret: GOOGLE_CLIENT_SECRET!,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  const data = await response.json();
  if (data.error) {
    throw new Error(`Token refresh failed: ${data.error_description || data.error}`);
  }
  return data.access_token;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, organizationId, date, timeMin, timeMax, event } = await req.json();
    console.log(`Google Calendar Events - Action: ${action}, Org: ${organizationId}`);

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Get organization's calendar settings
    const { data: settings, error: fetchError } = await supabase
      .from('organization_settings')
      .select('google_calendar_refresh_token, google_calendar_id, google_calendar_connected')
      .eq('organization_id', organizationId)
      .single();

    if (fetchError || !settings) {
      throw new Error('Organization settings not found');
    }

    if (!settings.google_calendar_connected || !settings.google_calendar_refresh_token) {
      return new Response(JSON.stringify({ 
        connected: false,
        message: 'Google Calendar not connected' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get fresh access token
    const accessToken = await getAccessToken(settings.google_calendar_refresh_token);
    const calendarId = settings.google_calendar_id || 'primary';

    // Action: check-availability - Get busy times for a date range
    if (action === 'check-availability') {
      console.log(`Checking availability from ${timeMin} to ${timeMax}`);
      
      const freeBusyResponse = await fetch('https://www.googleapis.com/calendar/v3/freeBusy', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          timeMin,
          timeMax,
          items: [{ id: calendarId }],
        }),
      });

      const freeBusyData = await freeBusyResponse.json();
      
      if (freeBusyData.error) {
        console.error('FreeBusy API error:', freeBusyData.error);
        throw new Error(freeBusyData.error.message);
      }

      const busySlots = freeBusyData.calendars?.[calendarId]?.busy || [];
      console.log(`Found ${busySlots.length} busy slots`);

      return new Response(JSON.stringify({ 
        connected: true,
        busySlots 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Action: list-events - Get events for a date range
    if (action === 'list-events') {
      console.log(`Listing events from ${timeMin} to ${timeMax}`);
      
      const eventsUrl = new URL(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`);
      eventsUrl.searchParams.set('timeMin', timeMin);
      eventsUrl.searchParams.set('timeMax', timeMax);
      eventsUrl.searchParams.set('singleEvents', 'true');
      eventsUrl.searchParams.set('orderBy', 'startTime');

      const eventsResponse = await fetch(eventsUrl.toString(), {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });

      const eventsData = await eventsResponse.json();
      
      if (eventsData.error) {
        console.error('Events API error:', eventsData.error);
        throw new Error(eventsData.error.message);
      }

      console.log(`Found ${eventsData.items?.length || 0} events`);
      return new Response(JSON.stringify({ 
        connected: true,
        events: eventsData.items || [] 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Action: create-event - Create a new calendar event
    if (action === 'create-event') {
      console.log('Creating calendar event:', event.summary);
      
      const createResponse = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            summary: event.summary,
            description: event.description,
            start: {
              dateTime: event.startTime,
              timeZone: event.timeZone || 'Europe/Amsterdam',
            },
            end: {
              dateTime: event.endTime,
              timeZone: event.timeZone || 'Europe/Amsterdam',
            },
            attendees: event.attendees?.map((email: string) => ({ email })),
          }),
        }
      );

      const createdEvent = await createResponse.json();
      
      if (createdEvent.error) {
        console.error('Create event error:', createdEvent.error);
        throw new Error(createdEvent.error.message);
      }

      console.log('Event created:', createdEvent.id);
      return new Response(JSON.stringify({ 
        connected: true,
        event: createdEvent 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    throw new Error('Invalid action');
  } catch (error: unknown) {
    console.error('Google Calendar Events Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
