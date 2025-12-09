import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ContactReplyRequest {
  contactRequestId: string;
  guidance: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");
    if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY is not configured");

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    const { contactRequestId, guidance }: ContactReplyRequest = await req.json();

    // Fetch the contact request
    const { data: contactRequest, error: fetchError } = await supabase
      .from("contact_requests")
      .select("*")
      .eq("id", contactRequestId)
      .single();

    if (fetchError || !contactRequest) {
      throw new Error("Contact request not found");
    }

    // Fetch email config for sender details
    const { data: emailConfig } = await supabase
      .from("email_config")
      .select("*")
      .single();

    const fromName = emailConfig?.from_name || "Callisto";
    const fromEmail = emailConfig?.from_email || "notifications@resend.dev";
    const replyTo = emailConfig?.reply_to_email || fromEmail;

    // Generate email using Lovable AI
    console.log("Generating email with AI...");
    
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are a professional email copywriter for Callisto, an AI receptionist platform for healthcare and service businesses. 
Write warm, professional, and helpful email responses to contact requests.
Keep emails concise (2-4 paragraphs max), friendly, and action-oriented.
Use simple, clear language. Avoid jargon.
Always address the person by their first name.
Sign off with "Best regards" followed by "The Callisto Team".
Output ONLY the email body text, no subject line or headers.`
          },
          {
            role: "user",
            content: `Write a professional email response to this contact request:

CONTACT DETAILS:
- Name: ${contactRequest.name}
- Email: ${contactRequest.email}
- Company: ${contactRequest.company || "Not provided"}
- Phone: ${contactRequest.phone || "Not provided"}
- Their message: "${contactRequest.message}"

GUIDANCE FROM ADMIN (incorporate these points):
${guidance}

Write a warm, professional email response.`
          }
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI API error:", aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("Failed to generate email with AI");
    }

    const aiData = await aiResponse.json();
    const generatedEmail = aiData.choices?.[0]?.message?.content;

    if (!generatedEmail) {
      throw new Error("AI did not generate email content");
    }

    console.log("Email generated successfully, sending via Resend...");

    // Send the email via Resend API
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `${fromName} <${fromEmail}>`,
        to: [contactRequest.email],
        reply_to: replyTo,
        subject: `Re: Your inquiry to Callisto`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            ${generatedEmail.split('\n').map((p: string) => p.trim() ? `<p style="margin: 0 0 16px 0; line-height: 1.6; color: #333;">${p}</p>` : '').join('')}
          </div>
        `,
      }),
    });

    const emailResult = await emailResponse.json();
    console.log("Email sent:", emailResult);

    if (!emailResponse.ok) {
      throw new Error(emailResult.message || "Failed to send email");
    }

    // Update contact request status
    await supabase
      .from("contact_requests")
      .update({ 
        status: "responded", 
        responded_at: new Date().toISOString(),
        notes: `AI-generated response sent. Guidance: ${guidance}`
      })
      .eq("id", contactRequestId);

    // Log the email
    await supabase.from("email_logs").insert({
      email_type: "contact_reply",
      recipient_email: contactRequest.email,
      subject: "Re: Your inquiry to Callisto",
      status: "sent",
      resend_id: emailResult.id,
      metadata: { 
        contact_request_id: contactRequestId,
        ai_generated: true,
        guidance 
      },
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        generatedEmail,
        emailId: emailResult.id 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in ai-contact-reply:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
