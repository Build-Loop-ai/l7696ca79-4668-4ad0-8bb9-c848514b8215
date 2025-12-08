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
    // Verify user is a system admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from token
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !userData.user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if user is system admin
    const { data: isAdmin } = await supabase.rpc('is_system_admin', { 
      _user_id: userData.user.id 
    });

    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { metrics } = await req.json();

    // Generate insights using Lovable AI
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      // Return basic insights if AI not configured
      return new Response(JSON.stringify({
        insights: [
          {
            type: "info",
            title: "Platform Status",
            description: `Managing ${metrics.totalOrganizations} organizations with ${metrics.totalUsers} users and ${metrics.totalCalls} total calls processed.`
          }
        ]
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const prompt = `You are an analytics AI for a SaaS platform that provides AI voice receptionists for businesses.

Current platform metrics:
- Total Organizations: ${metrics.totalOrganizations}
- Total Users: ${metrics.totalUsers}
- Total Calls Processed: ${metrics.totalCalls}
- Active Phone Numbers: ${metrics.activePhoneNumbers}

Generate 3-5 actionable insights for the platform admin. Each insight should have:
1. type: "warning" (potential issues), "growth" (positive trends), "opportunity" (upsell/improvement ideas), or "info" (general observations)
2. title: A short, clear title (max 8 words)
3. description: A specific, actionable insight (max 30 words)

Focus on:
- User engagement patterns
- Growth opportunities
- Potential churn risks
- Upsell opportunities
- Operational efficiency

Respond ONLY with a JSON array of insights, no other text.`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are a SaaS analytics AI that generates actionable business insights. Always respond with valid JSON only." },
          { role: "user", content: prompt }
        ],
      }),
    });

    if (!aiResponse.ok) {
      console.error("AI Gateway error:", await aiResponse.text());
      return new Response(JSON.stringify({
        insights: [
          {
            type: "info",
            title: "Platform Overview",
            description: `Currently managing ${metrics.totalOrganizations} organizations with ${metrics.totalUsers} users.`
          }
        ]
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content || "[]";
    
    // Parse the AI response
    let insights;
    try {
      // Extract JSON from the response (in case there's extra text)
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      insights = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError, content);
      insights = [
        {
          type: "info",
          title: "Platform Status",
          description: `Managing ${metrics.totalOrganizations} organizations with ${metrics.totalUsers} users.`
        }
      ];
    }

    return new Response(JSON.stringify({ insights }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Admin AI insights error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
