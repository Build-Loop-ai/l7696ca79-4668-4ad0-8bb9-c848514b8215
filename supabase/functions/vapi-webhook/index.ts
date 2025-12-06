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
    const args = JSON.parse(func.arguments || "{}");

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

  console.log("Checking availability for org:", orgId, "date:", date);

  // Return mock availability for now
  // In production, this would check a calendar integration
  const mockSlots = ["9:00 AM", "10:30 AM", "2:00 PM", "3:30 PM"];
  
  return {
    available: true,
    slots: mockSlots,
    message: `I have the following times available on ${date}: ${mockSlots.join(", ")}`,
  };
}

async function bookAppointment(args: any, payload: any, supabase: any) {
  const { patientName, phoneNumber, datetime, service, notes } = args;
  const orgId =
    payload.message?.call?.assistantOverrides?.metadata?.organizationId ||
    payload.message?.assistant?.metadata?.organizationId;
  const callId = payload.message?.call?.id;

  console.log("Booking appointment for org:", orgId, args);

  try {
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
      })
      .select()
      .single();

    if (error) throw error;

    const formattedDate = new Date(datetime).toLocaleString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });

    return {
      success: true,
      appointmentId: appointment.id,
      message: `Great! I've booked your ${service} appointment for ${patientName} on ${formattedDate}. You'll receive a confirmation shortly.`,
    };
  } catch (error) {
    console.error("Booking error:", error);
    return {
      success: false,
      message: "I'm sorry, I couldn't complete the booking. Let me transfer you to our staff.",
    };
  }
}

async function handleEndOfCallReport(payload: any, supabase: any) {
  const call = payload.message?.call;
  const orgId =
    call?.assistantOverrides?.metadata?.organizationId ||
    payload.message?.assistant?.metadata?.organizationId;

  console.log("End of call report for org:", orgId);

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
    direction: call?.type || "inbound",
    started_at: call?.startedAt,
    ended_at: call?.endedAt,
    duration_seconds: call?.duration ? Math.round(call.duration) : null,
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
  }

  // Update minutes used for billing
  if (call?.duration && orgId) {
    const minutes = Math.ceil(call.duration / 60);
    await supabase.rpc("increment_minutes_used", {
      org_id: orgId,
      minutes_to_add: minutes,
    });
  }

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
