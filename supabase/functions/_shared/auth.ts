/**
 * Shared authorization helpers for edge functions.
 *
 * Two trusted caller types:
 * 1. Internal calls between edge functions, authenticated with the service role key.
 * 2. End users, authenticated with their Supabase JWT — these must additionally
 *    be a member (or admin) of the organization they are acting on.
 */
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

export interface OrgAccessResult {
  ok: boolean;
  status: number;
  error: string | null;
  isServiceRole: boolean;
  userId: string | null;
}

function deny(status: number, error: string): OrgAccessResult {
  return { ok: false, status, error, isServiceRole: false, userId: null };
}

/**
 * Verifies that the request is allowed to act on the given organization.
 * Accepts either the service role key or a user JWT belonging to an org member.
 * Pass `requireAdmin: true` to additionally require the admin/owner role.
 */
export async function requireOrgAccess(
  req: Request,
  organizationId: string | undefined,
  options: { requireAdmin?: boolean } = {},
): Promise<OrgAccessResult> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return deny(401, "Missing authorization header");
  }

  const token = authHeader.slice("Bearer ".length);
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  if (token === serviceRoleKey) {
    return { ok: true, status: 200, error: null, isServiceRole: true, userId: null };
  }

  if (!organizationId) {
    return deny(400, "organizationId is required");
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } },
  );

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return deny(401, "Unauthorized");
  }

  const admin = createAdminClient();
  const { data: role } = await admin
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (!role) {
    return deny(403, "You are not a member of this organization");
  }
  if (options.requireAdmin && !["owner", "admin"].includes(role.role)) {
    return deny(403, "This action requires an admin role");
  }

  return { ok: true, status: 200, error: null, isServiceRole: false, userId: user.id };
}

/**
 * Verifies the request comes from any authenticated user (or the service role).
 * Used for endpoints that don't act on a specific organization.
 */
export async function requireAuthenticated(req: Request): Promise<OrgAccessResult> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return deny(401, "Missing authorization header");
  }

  const token = authHeader.slice("Bearer ".length);
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  if (token === serviceRoleKey) {
    return { ok: true, status: 200, error: null, isServiceRole: true, userId: null };
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } },
  );
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    return deny(401, "Unauthorized");
  }
  return { ok: true, status: 200, error: null, isServiceRole: false, userId: user.id };
}

export function createAdminClient(): SupabaseClient {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
}

export function unauthorizedResponse(
  result: OrgAccessResult,
  corsHeaders: Record<string, string>,
): Response {
  return new Response(JSON.stringify({ error: result.error }), {
    status: result.status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
