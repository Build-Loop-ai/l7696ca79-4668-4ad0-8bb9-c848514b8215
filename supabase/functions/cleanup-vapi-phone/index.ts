import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { requireOrgAccess, unauthorizedResponse } from "../_shared/auth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const VAPI_API_KEY = Deno.env.get("VAPI_API_KEY");

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { vapiPhoneId } = await req.json();

    if (!vapiPhoneId) {
      return new Response(
        JSON.stringify({ error: "vapiPhoneId is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Derive the owning org from the phone record and verify the caller
    // belongs to it before deleting anything from Vapi.
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { data: phoneRecord } = await supabaseAdmin
      .from("phone_numbers")
      .select("organization_id")
      .eq("vapi_phone_id", vapiPhoneId)
      .maybeSingle();

    const access = await requireOrgAccess(req, phoneRecord?.organization_id);
    if (!access.ok) {
      return unauthorizedResponse(access, corsHeaders);
    }

    if (!VAPI_API_KEY) {
      return new Response(
        JSON.stringify({ error: "VAPI_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Deleting Vapi phone number: ${vapiPhoneId}`);

    const response = await fetch(`https://api.vapi.ai/phone-number/${vapiPhoneId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${VAPI_API_KEY}`,
      },
    });

    const responseText = await response.text();
    console.log(`Vapi DELETE response status: ${response.status}`);
    console.log(`Vapi DELETE response: ${responseText}`);

    if (!response.ok) {
      return new Response(
        JSON.stringify({ 
          error: "Failed to delete from Vapi", 
          status: response.status,
          details: responseText 
        }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: `Deleted Vapi phone ${vapiPhoneId}` }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in cleanup-vapi-phone:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
