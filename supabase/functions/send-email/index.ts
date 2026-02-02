import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type EmailType = "team-invitation" | "welcome" | "missed-call-alert";

interface EmailRequest {
  type: EmailType;
  to: string;
  data: Record<string, any>;
  organization_id?: string;
  sent_by?: string;
}

// Get the site name from database for email footers
async function getSiteName(supabase: any): Promise<string> {
  try {
    const { data, error } = await supabase
      .from('site_config')
      .select('site_name')
      .limit(1)
      .single();

    if (error || !data) {
      return 'AI Receptionist';
    }

    return data.site_name || 'AI Receptionist';
  } catch (err) {
    console.error('Error fetching site name:', err);
    return 'AI Receptionist';
  }
}

// HTML Email Templates
function getTeamInvitationHtml(data: any, siteName: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="background-color: #f6f9fc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 40px 20px;">
      <div style="background-color: #ffffff; margin: 0 auto; padding: 40px 30px; border-radius: 12px; max-width: 480px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
        <h1 style="color: #1a1a1a; font-size: 28px; font-weight: 700; margin: 0 0 24px; text-align: center;">You're Invited! 🎉</h1>
        <p style="color: #4a4a4a; font-size: 16px; line-height: 26px; margin: 16px 0;">
          <strong>${data.inviterName}</strong> has invited you to join <strong>${data.organizationName}</strong> as a <strong>${data.role}</strong>.
        </p>
        <p style="color: #4a4a4a; font-size: 16px; line-height: 26px; margin: 16px 0;">
          Join the team to help manage AI receptionist calls, view analytics, and collaborate with your colleagues.
        </p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${data.signupUrl}" style="background-color: #0f172a; border-radius: 8px; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; display: inline-block; padding: 14px 32px;">Accept Invitation</a>
        </div>
        <hr style="border: none; border-top: 1px solid #e6ebf1; margin: 32px 0;">
        <p style="color: #8898aa; font-size: 13px; text-align: center; margin: 8px 0;">
          This invitation will expire in 7 days. If you didn't expect this invitation, you can safely ignore this email.
        </p>
        <p style="color: #8898aa; font-size: 13px; text-align: center; margin: 8px 0;">
          © ${new Date().getFullYear()} ${siteName}. All rights reserved.
        </p>
      </div>
    </body>
    </html>
  `;
}

function getWelcomeHtml(data: any, siteName: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="background-color: #f6f9fc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 40px 20px;">
      <div style="background-color: #ffffff; margin: 0 auto; padding: 40px 30px; border-radius: 12px; max-width: 480px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
        <h1 style="color: #1a1a1a; font-size: 28px; font-weight: 700; margin: 0 0 24px; text-align: center;">Welcome aboard! 👋</h1>
        <p style="color: #4a4a4a; font-size: 16px; line-height: 26px; margin: 16px 0;">Hi ${data.userName},</p>
        <p style="color: #4a4a4a; font-size: 16px; line-height: 26px; margin: 16px 0;">
          Congratulations! Your AI receptionist for <strong>${data.organizationName}</strong> is now ready to handle calls.
        </p>
        <p style="color: #4a4a4a; font-size: 16px; line-height: 26px; margin: 16px 0;">Here's what you can do next:</p>
        <div style="margin: 24px 0; padding: 0 16px;">
          <p style="color: #4a4a4a; font-size: 15px; margin: 12px 0;">📞 <strong>Make a test call</strong> - Try calling your AI number</p>
          <p style="color: #4a4a4a; font-size: 15px; margin: 12px 0;">⚙️ <strong>Customize your greeting</strong> - Personalize what your AI says</p>
          <p style="color: #4a4a4a; font-size: 15px; margin: 12px 0;">📅 <strong>Connect your calendar</strong> - Enable real-time booking</p>
          <p style="color: #4a4a4a; font-size: 15px; margin: 12px 0;">👥 <strong>Invite your team</strong> - Collaborate with colleagues</p>
        </div>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${data.dashboardUrl}" style="background-color: #0f172a; border-radius: 8px; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; display: inline-block; padding: 14px 32px;">Go to Dashboard</a>
        </div>
        <hr style="border: none; border-top: 1px solid #e6ebf1; margin: 32px 0;">
        <p style="color: #8898aa; font-size: 13px; text-align: center; margin: 8px 0;">
          Need help? Just reply to this email and we'll get back to you.
        </p>
        <p style="color: #8898aa; font-size: 13px; text-align: center; margin: 8px 0;">
          © ${new Date().getFullYear()} ${siteName}. All rights reserved.
        </p>
      </div>
    </body>
    </html>
  `;
}

function getMissedCallAlertHtml(data: any, siteName: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="background-color: #f6f9fc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 40px 20px;">
      <div style="background-color: #ffffff; margin: 0 auto; padding: 40px 30px; border-radius: 12px; max-width: 480px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
        <div style="text-align: center; margin-bottom: 16px;">
          <span style="background-color: #fef2f2; color: #dc2626; font-size: 14px; font-weight: 600; padding: 8px 16px; border-radius: 20px; display: inline-block;">📞 Missed Call</span>
        </div>
        <h1 style="color: #1a1a1a; font-size: 28px; font-weight: 700; margin: 0 0 24px; text-align: center;">You missed a call</h1>
        <p style="color: #4a4a4a; font-size: 16px; line-height: 26px; margin: 16px 0;">
          Your AI receptionist at <strong>${data.organizationName}</strong> received a call that wasn't completed.
        </p>
        <div style="background-color: #f8fafc; border-radius: 8px; padding: 20px; margin: 24px 0;">
          <p style="color: #64748b; font-size: 12px; font-weight: 600; text-transform: uppercase; margin: 0 0 4px; letter-spacing: 0.5px;">Caller</p>
          <p style="color: #1a1a1a; font-size: 18px; font-weight: 600; margin: 0 0 16px;">${data.callerNumber}</p>
          <p style="color: #64748b; font-size: 12px; font-weight: 600; text-transform: uppercase; margin: 0 0 4px; letter-spacing: 0.5px;">Time</p>
          <p style="color: #1a1a1a; font-size: 18px; font-weight: 600; margin: 0;">${data.callTime}</p>
        </div>
        <p style="color: #4a4a4a; font-size: 16px; line-height: 26px; margin: 16px 0;">
          Consider calling them back to ensure you don't miss any opportunities.
        </p>
        <div style="text-align: center; margin: 16px 0;">
          <a href="${data.dashboardUrl}" style="background-color: #0f172a; border-radius: 8px; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; display: inline-block; padding: 14px 32px;">View Call Details</a>
        </div>
        <div style="text-align: center; margin: 16px 0;">
          <a href="tel:${data.callerNumber}" style="background-color: #ffffff; border: 2px solid #0f172a; border-radius: 8px; color: #0f172a; font-size: 16px; font-weight: 600; text-decoration: none; display: inline-block; padding: 12px 32px;">Call Back Now</a>
        </div>
        <hr style="border: none; border-top: 1px solid #e6ebf1; margin: 32px 0;">
        <p style="color: #8898aa; font-size: 13px; text-align: center; margin: 8px 0;">
          You're receiving this because missed call alerts are enabled for ${data.organizationName}.
        </p>
        <p style="color: #8898aa; font-size: 13px; text-align: center; margin: 8px 0;">
          © ${new Date().getFullYear()} ${siteName}. All rights reserved.
        </p>
      </div>
    </body>
    </html>
  `;
}

async function logEmail(
  supabase: any,
  emailType: EmailType,
  recipientEmail: string,
  subject: string,
  organizationId: string | null,
  sentBy: string | null,
  resendId: string | null,
  status: 'sent' | 'failed',
  metadata: Record<string, any>,
  errorMessage: string | null
) {
  try {
    await supabase.from('email_logs').insert({
      email_type: emailType,
      recipient_email: recipientEmail,
      subject,
      organization_id: organizationId,
      sent_by: sentBy,
      resend_id: resendId,
      status,
      metadata,
      error_message: errorMessage,
    });
    console.log(`Email log saved: ${emailType} to ${recipientEmail} - ${status}`);
  } catch (err) {
    console.error('Failed to log email:', err);
  }
}

async function sendEmail(
  to: string, 
  subject: string, 
  html: string,
  fromEmail: string,
  fromName: string,
  replyTo?: string
) {
  const emailPayload: any = {
    from: `${fromName} <${fromEmail}>`,
    to: [to],
    subject,
    html,
  };

  if (replyTo) {
    emailPayload.reply_to = replyTo;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(emailPayload),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to send email");
  }

  return response.json();
}

async function getEmailConfig(supabase: any) {
  try {
    const { data, error } = await supabase
      .from('email_config')
      .select('from_email, from_name, reply_to_email')
      .limit(1)
      .single();

    if (error || !data) {
      return {
        from_email: 'notifications@resend.dev',
        from_name: 'AI Receptionist',
        reply_to_email: null,
      };
    }

    return data;
  } catch (err) {
    console.error('Error fetching email config:', err);
    return {
      from_email: 'notifications@resend.dev',
      from_name: 'AI Receptionist',
      reply_to_email: null,
    };
  }
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Validate required secrets
  if (!RESEND_API_KEY) {
    console.error("RESEND_API_KEY not configured");
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: "Email service not configured. Add RESEND_API_KEY in Settings → Backend → Secrets." 
      }),
      { status: 503, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
  
  // Get email configuration and site name
  const [emailConfig, siteName] = await Promise.all([
    getEmailConfig(supabase),
    getSiteName(supabase)
  ]);
  console.log(`Using email config: ${emailConfig.from_name} <${emailConfig.from_email}>, site: ${siteName}`);

  try {
    const { type, to, data, organization_id, sent_by }: EmailRequest = await req.json();

    console.log(`Sending ${type} email to ${to}`, data);

    let html: string;
    let subject: string;

    switch (type) {
      case "team-invitation":
        subject = `You're invited to join ${data.organizationName}`;
        html = getTeamInvitationHtml(data, siteName);
        break;

      case "welcome":
        subject = `Welcome to ${siteName} - You're all set!`;
        html = getWelcomeHtml(data, siteName);
        break;

      case "missed-call-alert":
        subject = `Missed call from ${data.callerNumber}`;
        html = getMissedCallAlertHtml(data, siteName);
        break;

      default:
        throw new Error(`Unknown email type: ${type}`);
    }

    try {
      const emailResponse = await sendEmail(
        to, 
        subject, 
        html, 
        emailConfig.from_email, 
        emailConfig.from_name,
        emailConfig.reply_to_email || undefined
      );
      console.log("Email sent successfully:", emailResponse);

      // Log successful email
      await logEmail(
        supabase,
        type,
        to,
        subject,
        organization_id || null,
        sent_by || null,
        emailResponse.id || null,
        'sent',
        data,
        null
      );

      return new Response(JSON.stringify({ success: true, data: emailResponse }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    } catch (emailError: any) {
      console.error("Error sending email:", emailError);

      // Log failed email
      await logEmail(
        supabase,
        type,
        to,
        subject,
        organization_id || null,
        sent_by || null,
        null,
        'failed',
        data,
        emailError.message
      );

      throw emailError;
    }
  } catch (error: any) {
    console.error("Error in send-email function:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);