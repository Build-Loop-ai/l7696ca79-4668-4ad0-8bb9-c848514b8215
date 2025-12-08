import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

interface InviteMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId: string;
  onSuccess: () => void;
}

const emailSchema = z.string().email("Please enter a valid email address");

export const InviteMemberDialog = ({
  open,
  onOpenChange,
  organizationId,
  onSuccess,
}: InviteMemberDialogProps) => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"viewer" | "editor" | "admin">("viewer");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate email
    const result = emailSchema.safeParse(email.trim().toLowerCase());
    if (!result.success) {
      setError(result.error.errors[0].message);
      return;
    }

    setLoading(true);

    try {
      // Check if user is already a member
      const { data: existingMember } = await supabase
        .from("user_roles")
        .select("id, role")
        .eq("organization_id", organizationId)
        .eq("user_id", (
          await supabase.from("profiles").select("id").eq("email", email.trim().toLowerCase()).maybeSingle()
        ).data?.id || "00000000-0000-0000-0000-000000000000")
        .maybeSingle();

      if (existingMember) {
        setError("This user is already a member of your team");
        setLoading(false);
        return;
      }

      // Check if there's already a pending invitation
      const { data: existingInvite } = await supabase
        .from("invitations")
        .select("id, status")
        .eq("organization_id", organizationId)
        .eq("email", email.trim().toLowerCase())
        .eq("status", "pending")
        .maybeSingle();

      if (existingInvite) {
        setError("An invitation has already been sent to this email");
        setLoading(false);
        return;
      }

      // Get current user ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError("You must be logged in to send invitations");
        setLoading(false);
        return;
      }

      // Create invitation
      const { error: insertError } = await supabase
        .from("invitations")
        .insert([{
          organization_id: organizationId,
          email: email.trim().toLowerCase(),
          role: role as "admin" | "viewer" | "owner" | "manager",
          invited_by: user.id,
        }]);

      if (insertError) {
        console.error("Invitation error:", insertError);
        throw new Error("Failed to create invitation");
      }

      toast({
        title: "Invitation sent!",
        description: `An invitation has been sent to ${email}`,
      });

      // Reset form and close
      setEmail("");
      setRole("viewer");
      onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      console.error("Error sending invitation:", err);
      setError(err.message || "Failed to send invitation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite Team Member</DialogTitle>
          <DialogDescription>
            Send an invitation to join your team. They'll receive access once they sign up.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              placeholder="colleague@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError(null);
              }}
              disabled={loading}
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select value={role} onValueChange={(v) => setRole(v as typeof role)} disabled={loading}>
              <SelectTrigger id="role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="viewer">
                  <div className="flex flex-col items-start">
                    <span>Viewer</span>
                    <span className="text-xs text-muted-foreground">Can view calls and analytics</span>
                  </div>
                </SelectItem>
                <SelectItem value="editor">
                  <div className="flex flex-col items-start">
                    <span>Editor</span>
                    <span className="text-xs text-muted-foreground">Can edit settings and manage calls</span>
                  </div>
                </SelectItem>
                <SelectItem value="admin">
                  <div className="flex flex-col items-start">
                    <span>Admin</span>
                    <span className="text-xs text-muted-foreground">Full access including team management</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !email.trim()}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Invitation
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
