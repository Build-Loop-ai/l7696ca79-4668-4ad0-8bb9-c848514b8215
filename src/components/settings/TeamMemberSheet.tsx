import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Loader2, Mail, Shield, Calendar, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow, format } from "date-fns";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

interface TeamMember {
  id: string;
  user_id: string;
  role: string;
  created_at?: string;
  profile: {
    full_name: string | null;
    email: string | null;
    created_at?: string;
  } | null;
}

interface TeamMemberSheetProps {
  member: TeamMember | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUserId: string;
  onMemberUpdated: () => void;
}

const roleDescriptions: Record<string, string> = {
  owner: "Full access to all settings, billing, and team management",
  admin: "Can manage settings, team members, and view all data",
  member: "Can view and interact with calls, appointments, and basic settings",
  viewer: "Read-only access to view calls and analytics",
};

export const TeamMemberSheet = ({
  member,
  open,
  onOpenChange,
  currentUserId,
  onMemberUpdated,
}: TeamMemberSheetProps) => {
  const { toast } = useToast();
  const [selectedRole, setSelectedRole] = useState<string>(member?.role || "viewer");
  const [isUpdating, setIsUpdating] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isCurrentUser = member?.user_id === currentUserId;
  const isOwner = member?.role === "owner";
  const canEditRole = !isCurrentUser && !isOwner;
  const canRemove = !isCurrentUser && !isOwner;

  const handleRoleChange = async (newRole: string) => {
    if (!member || newRole === member.role) return;
    
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from("user_roles")
        .update({ role: newRole as AppRole })
        .eq("id", member.id);

      if (error) throw error;

      toast({
        title: "Role updated",
        description: `${member.profile?.full_name || member.profile?.email}'s role has been changed to ${newRole}.`,
      });

      setSelectedRole(newRole);
      onMemberUpdated();
    } catch (err: any) {
      console.error("Error updating role:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update member role",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemoveMember = async () => {
    if (!member) return;
    
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("id", member.id);

      if (error) throw error;

      // Also remove the user's organization association
      await supabase
        .from("profiles")
        .update({ organization_id: null })
        .eq("id", member.user_id);

      toast({
        title: "Member removed",
        description: `${member.profile?.full_name || member.profile?.email} has been removed from the team.`,
      });

      onOpenChange(false);
      onMemberUpdated();
    } catch (err: any) {
      console.error("Error removing member:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to remove team member",
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  // Reset selected role when member changes
  if (member && selectedRole !== member.role && !isUpdating) {
    setSelectedRole(member.role);
  }

  if (!member) return null;

  const displayName = member.profile?.full_name || member.profile?.email?.split("@")[0] || "Unknown";
  const initials = displayName.charAt(0).toUpperCase();

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader className="text-left">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-medium text-primary">
                {initials}
              </div>
              <div>
                <SheetTitle className="text-xl">
                  {displayName}
                  {isCurrentUser && (
                    <Badge variant="outline" className="ml-2 text-xs">You</Badge>
                  )}
                </SheetTitle>
                <SheetDescription className="flex items-center gap-1.5 mt-1">
                  <Mail className="w-3.5 h-3.5" />
                  {member.profile?.email || "No email"}
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          <div className="mt-6 space-y-6">
            {/* Role Section */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <Shield className="w-4 h-4 text-muted-foreground" />
                Role & Permissions
              </Label>
              
              {canEditRole ? (
                <Select
                  value={selectedRole}
                  onValueChange={handleRoleChange}
                  disabled={isUpdating}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="capitalize text-sm py-1 px-3">
                    {member.role}
                  </Badge>
                  {isOwner && (
                    <span className="text-xs text-muted-foreground">Cannot be changed</span>
                  )}
                  {isCurrentUser && !isOwner && (
                    <span className="text-xs text-muted-foreground">You cannot change your own role</span>
                  )}
                </div>
              )}
              
              <p className="text-xs text-muted-foreground">
                {roleDescriptions[selectedRole] || roleDescriptions.viewer}
              </p>
              
              {isUpdating && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Updating role...
                </div>
              )}
            </div>

            <Separator />

            {/* Member Info */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                Member Since
              </Label>
              <p className="text-sm text-muted-foreground">
                {member.created_at 
                  ? `${format(new Date(member.created_at), "MMMM d, yyyy")} (${formatDistanceToNow(new Date(member.created_at), { addSuffix: true })})`
                  : "Unknown"
                }
              </p>
            </div>

            <Separator />

            {/* Danger Zone */}
            {canRemove && (
              <div className="space-y-3 pt-2">
                <Label className="text-sm font-medium text-destructive">Danger Zone</Label>
                <Button
                  variant="outline"
                  className="w-full border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Remove from Team
                </Button>
                <p className="text-xs text-muted-foreground">
                  This will revoke their access to this organization. They can be re-invited later.
                </p>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Remove Member Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove team member?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{member.profile?.full_name || member.profile?.email}</strong> will immediately lose access to this organization. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveMember}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Removing...
                </>
              ) : (
                "Remove Member"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
