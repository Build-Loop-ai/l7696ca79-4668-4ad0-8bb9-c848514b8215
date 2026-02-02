/**
 * Shared utility for validating required secrets in edge functions.
 * Provides user-friendly error messages with instructions.
 */

export interface SecretValidationResult {
  valid: boolean;
  missing: string[];
  errorMessage: string | null;
}

const SECRET_DESCRIPTIONS: Record<string, string> = {
  // Vapi
  VAPI_API_KEY: "Vapi.ai API key for voice AI",
  VAPI_PUBLIC_KEY: "Vapi.ai public key for browser calls",
  
  // Twilio
  TWILIO_ACCOUNT_SID: "Twilio Account SID",
  TWILIO_AUTH_TOKEN: "Twilio Auth Token",
  TWILIO_API_KEY: "Twilio API Key SID (for Vapi integration)",
  TWILIO_API_SECRET: "Twilio API Secret (for Vapi integration)",
  
  // Stripe
  STRIPE_SECRET_KEY: "Stripe secret API key",
  STRIPE_WEBHOOK_SECRET: "Stripe webhook signing secret",
  
  // Google
  GOOGLE_CLIENT_ID: "Google OAuth client ID",
  GOOGLE_CLIENT_SECRET: "Google OAuth client secret",
  
  // Resend
  RESEND_API_KEY: "Resend API key for email delivery",
  
  // ElevenLabs
  ELEVENLABS_API_KEY: "ElevenLabs API key for voice synthesis",
  
  // Supabase (usually auto-configured)
  SUPABASE_URL: "Supabase project URL",
  SUPABASE_ANON_KEY: "Supabase anonymous key",
  SUPABASE_SERVICE_ROLE_KEY: "Supabase service role key",
};

/**
 * Validates that all required secrets are configured.
 * Returns a user-friendly error message if any are missing.
 */
export function validateSecrets(required: string[]): SecretValidationResult {
  const missing = required.filter(name => !Deno.env.get(name));
  
  if (missing.length === 0) {
    return { valid: true, missing: [], errorMessage: null };
  }
  
  const descriptions = missing.map(name => {
    const desc = SECRET_DESCRIPTIONS[name] || name;
    return `• ${name}: ${desc}`;
  });
  
  const errorMessage = `Missing configuration:\n${descriptions.join('\n')}\n\nPlease add these secrets in your project settings:\nSettings → Backend → Secrets`;
  
  return { valid: false, missing, errorMessage };
}

/**
 * Creates a standardized error response for missing secrets.
 */
export function createMissingSecretsResponse(
  validation: SecretValidationResult,
  corsHeaders: Record<string, string>
): Response {
  return new Response(
    JSON.stringify({
      error: "Configuration required",
      details: validation.errorMessage,
      missing: validation.missing,
    }),
    {
      status: 503,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
}
