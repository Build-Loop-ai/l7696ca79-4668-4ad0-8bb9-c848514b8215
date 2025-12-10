import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    console.log("Vapi webhook received:", payload.message?.type);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const messageType = payload.message?.type;

    switch (messageType) {
      case "tool-calls":
        return handleToolCalls(payload, supabase);

      case "end-of-call-report":
        return handleEndOfCallReport(payload, supabase);

      case "transfer-destination-request":
        return handleTransferRequest(payload, supabase);

      case "status-update":
        console.log("Call status:", payload.message?.status);
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });

      case "hang":
        console.log("Hang detected in call");
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });

      default:
        console.log("Unhandled message type:", messageType);
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
  } catch (error: unknown) {
    console.error("Vapi webhook error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function handleToolCalls(payload: any, supabase: any) {
  const toolCalls = payload.message?.toolCallList || [];
  const results = [];

  for (const toolCall of toolCalls) {
    const { id, function: func } = toolCall;
    // Handle both string and object arguments (Vapi can send either)
    const args = typeof func.arguments === 'string' 
      ? JSON.parse(func.arguments || "{}") 
      : (func.arguments || {});

    let result;

    switch (func.name) {
      case "checkAvailability":
        result = await checkAvailability(args, payload, supabase);
        break;

      case "bookAppointment":
        result = await bookAppointment(args, payload, supabase);
        break;

      default:
        result = { error: "Unknown function" };
    }

    results.push({
      toolCallId: id,
      result: JSON.stringify(result),
    });
  }

  return new Response(JSON.stringify({ results }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function checkAvailability(args: any, payload: any, supabase: any) {
  const { date } = args;
  const orgId =
    payload.message?.call?.assistantOverrides?.metadata?.organizationId ||
    payload.message?.assistant?.metadata?.organizationId;

  console.log("=== AVAILABILITY CHECK START ===");
  console.log("Input date from AI:", date);
  console.log("Organization ID:", orgId);
  console.log("Current server date:", new Date().toISOString());

  // Check if organization has Google Calendar connected
  const { data: settings } = await supabase
    .from("organization_settings")
    .select("google_calendar_connected, google_calendar_refresh_token, google_calendar_id, business_hours")
    .eq("organization_id", orgId)
    .single();

  console.log("Google Calendar connected:", settings?.google_calendar_connected);
  console.log("Business hours config:", JSON.stringify(settings?.business_hours));

  // Parse the date and get day info
  const parsedDate = new Date(date);
  const dayOfWeek = parsedDate.toLocaleDateString('en-US', { weekday: 'long' });
  const dayOfWeekLower = dayOfWeek.toLowerCase();
  const businessHours = settings?.business_hours || {};
  const dayHours = businessHours[dayOfWeek] || businessHours[dayOfWeekLower];

  console.log("Parsed date:", parsedDate.toISOString());
  console.log("Day of week:", dayOfWeek);
  console.log("Hours for this day:", JSON.stringify(dayHours));

  // If Google Calendar is connected, check real availability
  if (settings?.google_calendar_connected && settings?.google_calendar_refresh_token) {
    try {
      console.log("Using Google Calendar for availability...");
      const slots = await getCalendarAvailability(date, settings, supabase);
      console.log("Calendar slots found:", slots.length);
      console.log("=== AVAILABILITY CHECK END ===");
      
      // Return data only - let AI formulate the response in its configured language
      return {
        available: slots.length > 0,
        date: date,
        dayOfWeek: dayOfWeek,
        slots: slots,
        businessClosed: false,
      };
    } catch (error) {
      console.error("Calendar availability error:", error);
      // Fall back to business hours if calendar check fails
    }
  }

  // Fall back to business hours-based availability
  console.log("Using business hours for availability (no calendar)...");
  
  if (!dayHours?.isOpen) {
    console.log("Business is CLOSED on", dayOfWeek);
    console.log("=== AVAILABILITY CHECK END ===");
    // Return data only - let AI formulate the response in its configured language
    return {
      available: false,
      date: date,
      dayOfWeek: dayOfWeek,
      slots: [],
      businessClosed: true,
    };
  }

  // Generate 30-minute slots based on business hours
  const allSlots = generateTimeSlots(dayHours.open, dayHours.close);
  console.log("Generated slots:", allSlots.length, "from", dayHours.open, "to", dayHours.close);
  console.log("=== AVAILABILITY CHECK END ===");
  
  // Return data only - let AI formulate the response in its configured language
  return {
    available: allSlots.length > 0,
    date: date,
    dayOfWeek: dayOfWeek,
    slots: allSlots,
    businessClosed: false,
  };
}

function generateTimeSlots(openTime: string, closeTime: string): string[] {
  const slots: string[] = [];
  const [openHour, openMin] = openTime.split(':').map(Number);
  const [closeHour, closeMin] = closeTime.split(':').map(Number);
  
  let currentHour = openHour;
  let currentMin = openMin;
  
  while (currentHour < closeHour || (currentHour === closeHour && currentMin < closeMin)) {
    const hour12 = currentHour > 12 ? currentHour - 12 : currentHour;
    const ampm = currentHour >= 12 ? 'PM' : 'AM';
    const minStr = currentMin === 0 ? ':00' : `:${currentMin}`;
    slots.push(`${hour12}${minStr} ${ampm}`);
    
    currentMin += 30;
    if (currentMin >= 60) {
      currentMin = 0;
      currentHour++;
    }
  }
  
  return slots;
}

async function getCalendarAvailability(date: string, settings: any, supabase: any): Promise<string[]> {
  const GOOGLE_CLIENT_ID = Deno.env.get('GOOGLE_CLIENT_ID');
  const GOOGLE_CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET');
  
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    throw new Error('Google OAuth not configured');
  }

  // Refresh access token
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      refresh_token: settings.google_calendar_refresh_token,
      grant_type: 'refresh_token',
    }),
  });

  const tokenData = await tokenResponse.json();
  if (tokenData.error) {
    throw new Error(`Token refresh failed: ${tokenData.error}`);
  }

  const accessToken = tokenData.access_token;
  const calendarId = settings.google_calendar_id || 'primary';
  
  // Get events for the requested date
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const freeBusyResponse = await fetch('https://www.googleapis.com/calendar/v3/freeBusy', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      timeMin: startOfDay.toISOString(),
      timeMax: endOfDay.toISOString(),
      items: [{ id: calendarId }],
    }),
  });

  const freeBusyData = await freeBusyResponse.json();
  const busySlots = freeBusyData.calendars?.[calendarId]?.busy || [];

  // Get business hours for the day (check both capitalized and lowercase keys)
  const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
  const businessHours = settings.business_hours?.[dayOfWeek] || settings.business_hours?.[dayOfWeek.toLowerCase()];
  
  if (!businessHours?.isOpen) {
    return [];
  }

  // Generate available slots excluding busy times
  const allSlots = generateTimeSlots(businessHours.open, businessHours.close);
  
  // Filter out busy slots
  return allSlots.filter(slot => {
    const slotTime = parseSlotTime(date, slot);
    return !busySlots.some((busy: any) => {
      const busyStart = new Date(busy.start);
      const busyEnd = new Date(busy.end);
      return slotTime >= busyStart && slotTime < busyEnd;
    });
  });
}

function parseSlotTime(date: string, slot: string): Date {
  const match = slot.match(/(\d+):?(\d+)?\s*(AM|PM)/i);
  if (!match) return new Date(date);
  
  let hour = parseInt(match[1]);
  const min = parseInt(match[2] || '0');
  const ampm = match[3].toUpperCase();
  
  if (ampm === 'PM' && hour !== 12) hour += 12;
  if (ampm === 'AM' && hour === 12) hour = 0;
  
  const result = new Date(date);
  result.setHours(hour, min, 0, 0);
  return result;
}

async function bookAppointment(args: any, payload: any, supabase: any) {
  const { patientName, phoneNumber, datetime, service, notes } = args;
  const orgId =
    payload.message?.call?.assistantOverrides?.metadata?.organizationId ||
    payload.message?.assistant?.metadata?.organizationId;

  console.log("Booking appointment for org:", orgId, args);

  // Fetch settings for Google Calendar integration and organization details
  const { data: settings } = await supabase
    .from("organization_settings")
    .select("google_calendar_connected, google_calendar_refresh_token, google_calendar_id")
    .eq("organization_id", orgId)
    .single();

  // Fetch organization timezone
  const { data: org } = await supabase
    .from("organizations")
    .select("timezone")
    .eq("id", orgId)
    .single();
  
  const timezone = org?.timezone || 'UTC';

  try {
    let googleEventId = null;

    // Create Google Calendar event if connected
    if (settings?.google_calendar_connected && settings?.google_calendar_refresh_token) {
      try {
        googleEventId = await createCalendarEvent(datetime, patientName, service, notes, settings, timezone);
        console.log("Created Google Calendar event:", googleEventId);
      } catch (calError) {
        console.error("Failed to create calendar event:", calError);
        // Continue without calendar event
      }
    }

    // Save appointment to database
    const { data: appointment, error } = await supabase
      .from("appointments")
      .insert({
        organization_id: orgId,
        patient_name: patientName,
        phone_number: phoneNumber,
        scheduled_at: datetime,
        service_type: service,
        notes: notes,
        status: "confirmed",
        google_calendar_event_id: googleEventId,
      })
      .select()
      .single();

    if (error) throw error;

    // Return data only - let AI formulate the response in its configured language
    return {
      success: true,
      appointmentId: appointment.id,
      patientName: patientName,
      service: service,
      datetime: datetime,
      calendarEventCreated: !!googleEventId,
    };
  } catch (error) {
    console.error("Booking error:", error);
    // Return data only - let AI formulate the response in its configured language
    return {
      success: false,
      error: "booking_failed",
    };
  }
}

async function createCalendarEvent(
  datetime: string, 
  patientName: string, 
  service: string, 
  notes: string,
  settings: any,
  timezone: string = 'UTC'
): Promise<string | null> {
  const GOOGLE_CLIENT_ID = Deno.env.get('GOOGLE_CLIENT_ID');
  const GOOGLE_CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET');
  
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    throw new Error('Google OAuth not configured');
  }

  // Refresh access token
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      refresh_token: settings.google_calendar_refresh_token,
      grant_type: 'refresh_token',
    }),
  });

  const tokenData = await tokenResponse.json();
  if (tokenData.error) {
    throw new Error(`Token refresh failed: ${tokenData.error}`);
  }

  const accessToken = tokenData.access_token;
  const calendarId = settings.google_calendar_id || 'primary';

  // Calculate end time (assume 30 min appointment)
  const startTime = new Date(datetime);
  const endTime = new Date(startTime.getTime() + 30 * 60 * 1000);

  const createResponse = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        summary: `${service} - ${patientName}`,
        description: notes || `Appointment booked via AI receptionist for ${patientName}`,
        start: {
          dateTime: startTime.toISOString(),
          timeZone: timezone,
        },
        end: {
          dateTime: endTime.toISOString(),
          timeZone: timezone,
        },
      }),
    }
  );

  const createdEvent = await createResponse.json();
  
  if (createdEvent.error) {
    throw new Error(createdEvent.error.message);
  }

  return createdEvent.id;
}

// Normalize Vapi call types to valid database enum values
function normalizeCallDirection(vapiType: string | undefined): 'inbound' | 'outbound' {
  if (vapiType === 'outbound' || vapiType === 'outboundPhoneCall') {
    return 'outbound';
  }
  // All other types (inbound, webCall, inboundPhoneCall, etc.) treated as inbound
  return 'inbound';
}

async function handleEndOfCallReport(payload: any, supabase: any) {
  const call = payload.message?.call;
  const orgId =
    call?.assistantOverrides?.metadata?.organizationId ||
    payload.message?.assistant?.metadata?.organizationId;

  console.log("=== END OF CALL REPORT ===");
  console.log("Organization ID:", orgId);
  console.log("Call object keys:", call ? Object.keys(call) : "null");
  console.log("Call duration field:", call?.duration);
  console.log("Call durationMs field:", call?.durationMs);
  console.log("Call durationSeconds field:", call?.durationSeconds);
  console.log("Call startedAt:", call?.startedAt);
  console.log("Call endedAt:", call?.endedAt);

  // Calculate duration with multiple fallbacks
  let durationSeconds: number | null = null;
  
  if (typeof call?.duration === 'number' && call.duration > 0) {
    // Duration in seconds (most common)
    durationSeconds = Math.round(call.duration);
    console.log("Using call.duration:", durationSeconds);
  } else if (typeof call?.durationSeconds === 'number' && call.durationSeconds > 0) {
    durationSeconds = Math.round(call.durationSeconds);
    console.log("Using call.durationSeconds:", durationSeconds);
  } else if (typeof call?.durationMs === 'number' && call.durationMs > 0) {
    // Duration in milliseconds
    durationSeconds = Math.round(call.durationMs / 1000);
    console.log("Using call.durationMs converted:", durationSeconds);
  } else if (call?.startedAt && call?.endedAt) {
    // Calculate from start/end times
    const startTime = new Date(call.startedAt).getTime();
    const endTime = new Date(call.endedAt).getTime();
    if (!isNaN(startTime) && !isNaN(endTime) && endTime > startTime) {
      durationSeconds = Math.round((endTime - startTime) / 1000);
      console.log("Calculated from start/end times:", durationSeconds);
    }
  }
  
  console.log("Final duration_seconds:", durationSeconds);

  // Determine call outcome
  let outcome = "info_provided";
  if (call?.endedReason === "assistant-ended-call") outcome = "completed";
  if (call?.endedReason === "customer-ended-call") outcome = "completed";
  if (call?.endedReason === "assistant-forwarded-call") outcome = "transferred";
  if (
    payload.message?.artifact?.messages?.some((m: any) =>
      m.toolCalls?.some((t: any) => t.function?.name === "bookAppointment")
    )
  ) {
    outcome = "appointment_booked";
  }

  // Save call log
  const { error } = await supabase.from("call_logs").insert({
    organization_id: orgId,
    vapi_call_id: call?.id,
    caller_number: call?.customer?.number,
    direction: normalizeCallDirection(call?.type),
    started_at: call?.startedAt,
    ended_at: call?.endedAt,
    duration_seconds: durationSeconds,
    transcript: payload.message?.artifact?.transcript,
    recording_url: payload.message?.artifact?.recordingUrl,
    outcome: outcome,
    summary: payload.message?.artifact?.summary || payload.message?.analysis?.summary,
    metadata: {
      endedReason: call?.endedReason,
      cost: call?.cost,
    },
  });

  if (error) {
    console.error("Error saving call log:", error);
  } else {
    console.log("Call log saved successfully with duration:", durationSeconds);
  }

  // Update minutes used for billing
  if (durationSeconds && durationSeconds > 0 && orgId) {
    const minutes = Math.ceil(durationSeconds / 60);
    console.log("Incrementing minutes used:", minutes, "for org:", orgId);
    const { error: rpcError } = await supabase.rpc("increment_minutes_used", {
      org_id: orgId,
      minutes_to_add: minutes,
    });
    if (rpcError) {
      console.error("Error incrementing minutes:", rpcError);
    } else {
      console.log("Minutes incremented successfully");
    }
  } else {
    console.log("Skipping minutes increment - no valid duration or orgId");
  }

  console.log("=== END OF CALL REPORT COMPLETE ===");

  return new Response(JSON.stringify({ success: true }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function handleTransferRequest(payload: any, supabase: any) {
  const orgId =
    payload.message?.call?.assistantOverrides?.metadata?.organizationId ||
    payload.message?.assistant?.metadata?.organizationId;

  console.log("Transfer request for org:", orgId);

  // Get transfer number from settings
  const { data: settings } = await supabase
    .from("organization_settings")
    .select("transfer_number")
    .eq("organization_id", orgId)
    .single();

  return new Response(
    JSON.stringify({
      destination: {
        type: "number",
        number: settings?.transfer_number || "+31612345678",
        message: "I'm transferring you to our staff now. Please hold.",
      },
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}
