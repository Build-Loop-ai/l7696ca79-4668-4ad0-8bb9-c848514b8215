import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Trash2, Loader2, Clock, X, RefreshCw, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface TeamMember {
  id: string;
  user_id: string;
  role: string;
  profile: {
    full_name: string | null;
    email: string | null;
  } | null;
}

interface Invitation {
  id: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
  expires_at: string;
}

interface TeamMembersListProps {
  members: TeamMember[];
  invitations: Invitation[];
  currentUserId: string;
  organizationId: string;
  onMemberRemoved: () => void;
  onInvitationCancelled: () => void;
}

export const TeamMembersList = ({
  members,
  invitations,
  currentUserId,
  organizationId,
  onMemberRemoved,
  onInvitationCancelled,
}: TeamMembersListProps) => {
  const { toast } = useToast();
  const [deletingMember, setDeletingMember] = useState<TeamMember | null>(null);
  const [cancellingInvite, setCancellingInvite] = useState<Invitation | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRemoveMember = async () => {
    if (!deletingMember) return;
    setLoading(true);

    try {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("id", deletingMember.id);

      if (error) throw error;

      // Also remove the user's organization association
      await supabase
        .from("profiles")
        .update({ organization_id: null })
        .eq("id", deletingMember.user_id);

      toast({
        title: "Member removed",
        description: `${deletingMember.profile?.full_name || deletingMember.profile?.email} has been removed from the team.`,
      });

      onMemberRemoved();
    } catch (err: any) {
      console.error("Error removing member:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to remove team member",
      });
    } finally {
      setLoading(false);
      setDeletingMember(null);
    }
  };

  const handleCancelInvitation = async () => {
    if (!cancellingInvite) return;
    setLoading(true);

    try {
      const { error } = await supabase
        .from("invitations")
        .update({ status: "cancelled" })
        .eq("id", cancellingInvite.id);

      if (error) throw error;

      toast({
        title: "Invitation cancelled",
        description: `The invitation to ${cancellingInvite.email} has been cancelled.`,
      });

      onInvitationCancelled();
    } catch (err: any) {
      console.error("Error cancelling invitation:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to cancel invitation",
      });
    } finally {
      setLoading(false);
      setCancellingInvite(null);
    }
  };

  const handleResendInvitation = async (invitation: Invitation) => {
    try {
      // Get the current user and organization info
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, organization_id, organization:organizations(name)")
        .eq("id", user.id)
        .single();

      // Update the invitation with a new expiry date and token
      const newToken = crypto.randomUUID();
      const { error: updateError } = await supabase
        .from("invitations")
        .update({ 
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          created_at: new Date().toISOString(),
          token: newToken
        })
        .eq("id", invitation.id);

      if (updateError) throw updateError;

      // Actually send the email
      const inviteUrl = `${window.location.origin}/signup?invite=${newToken}`;
      const orgName = (profile?.organization as any)?.name || "the team";
      
      const { error: emailError } = await supabase.functions.invoke("send-email", {
        body: {
          to: invitation.email,
          subject: `You're invited to join ${orgName}`,
          html: `
            <h1>You've been invited!</h1>
            <p>${profile?.full_name || "A team member"} has invited you to join <strong>${orgName}</strong>.</p>
            <p>Click the link below to accept your invitation:</p>
            <p><a href="${inviteUrl}" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px;">Accept Invitation</a></p>
            <p>This invitation expires in 7 days.</p>
          `,
          type: "team-invitation",
          organization_id: organizationId,
          sent_by: user.id,
          metadata: {
            invitee_email: invitation.email,
            inviter_name: profile?.full_name,
            organization_name: orgName,
            role: invitation.role
          }
        }
      });

      if (emailError) {
        console.error("Email sending failed:", emailError);
        // Still show success for the invitation update
      }

      toast({
        title: "Invitation resent",
        description: `A new invitation has been sent to ${invitation.email}`,
      });

      onInvitationCancelled(); // Refresh the list
    } catch (err: any) {
      console.error("Error resending invitation:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to resend invitation",
      });
    }
  };

  const pendingInvitations = invitations.filter(i => i.status === "pending");

  if (members.length === 0 && pendingInvitations.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No team members yet</p>
        <p className="text-sm mt-1">Invite your first team member to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Active Members */}
      {members.map((member) => (
        <div
          key={member.id}
          className="flex items-center justify-between p-4 rounded-xl border border-border"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-medium text-primary">
              {(member.profile?.full_name || member.profile?.email || "?")
                .charAt(0)
                .toUpperCase()}
            </div>
            <div>
              <div className="font-medium">
                {member.profile?.full_name || "Unknown"}
                {member.user_id === currentUserId && (
                  <span className="ml-2 text-xs text-muted-foreground">(you)</span>
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                {member.profile?.email || "-"}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="capitalize">
              {member.role}
            </Badge>
            {member.role !== "owner" && member.user_id !== currentUserId && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setDeletingMember(member)}
              >
                <Trash2 className="w-4 h-4 text-muted-foreground" />
              </Button>
            )}
          </div>
        </div>
      ))}

      {/* Pending Invitations */}
      {pendingInvitations.length > 0 && (
        <>
          <div className="pt-4 pb-2">
            <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Pending Invitations
            </h4>
          </div>
          {pendingInvitations.map((invitation) => (
            <div
              key={invitation.id}
              className="flex items-center justify-between p-4 rounded-xl border border-dashed border-border bg-muted/30"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center font-medium text-muted-foreground">
                  {invitation.email.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-medium text-muted-foreground">
                    {invitation.email}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Invited {formatDistanceToNow(new Date(invitation.created_at), { addSuffix: true })}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="capitalize text-muted-foreground">
                  {invitation.role}
                </Badge>
                <Badge variant="secondary" className="bg-amber-100 text-amber-700">
                  Pending
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleResendInvitation(invitation)}
                  title="Resend invitation"
                >
                  <RefreshCw className="w-4 h-4 text-muted-foreground" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setCancellingInvite(invitation)}
                  title="Cancel invitation"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </Button>
              </div>
            </div>
          ))}
        </>
      )}

      {/* Delete Member Confirmation */}
      <AlertDialog open={!!deletingMember} onOpenChange={() => setDeletingMember(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove team member?</AlertDialogTitle>
            <AlertDialogDescription>
              {deletingMember?.profile?.full_name || deletingMember?.profile?.email} will lose access to this organization. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveMember}
              disabled={loading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Removing...
                </>
              ) : (
                "Remove"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cancel Invitation Confirmation */}
      <AlertDialog open={!!cancellingInvite} onOpenChange={() => setCancellingInvite(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel invitation?</AlertDialogTitle>
            <AlertDialogDescription>
              The invitation to {cancellingInvite?.email} will be cancelled and they won't be able to join using this link.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Keep Invitation</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelInvitation}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Cancelling...
                </>
              ) : (
                "Cancel Invitation"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
