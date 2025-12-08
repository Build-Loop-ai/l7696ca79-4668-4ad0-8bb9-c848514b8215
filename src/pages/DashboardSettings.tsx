import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Building,
  Bot,
  Phone,
  Link,
  Users,
  CreditCard,
  Copy,
  Trash2,
  Plus,
  Loader2,
  PhoneForwarded,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { BusinessSettings } from "@/components/settings/BusinessSettings";
import { AIAssistantSettings } from "@/components/settings/AIAssistantSettings";
import { GoogleCalendarIntegration } from "@/components/settings/GoogleCalendarIntegration";
import { PhoneNumberDialog } from "@/components/dashboard/PhoneNumberDialog";
import { InviteMemberDialog } from "@/components/settings/InviteMemberDialog";
import { TeamMembersList } from "@/components/settings/TeamMembersList";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO } from "date-fns";

interface Organization {
  id: string;
  name: string;
  business_type: string | null;
  phone: string | null;
  timezone: string | null;
  address: unknown;
}

interface PhoneNumber {
  id: string;
  phone_number: string;
  friendly_name: string | null;
  is_active: boolean | null;
  country_code: string | null;
  status: string | null;
}

interface Subscription {
  id: string;
  plan: string | null;
  status: string | null;
  minutes_used: number | null;
  minutes_included: number | null;
  current_period_end: string | null;
}

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

const DashboardSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);

  // Dialogs
  const [showPhoneDialog, setShowPhoneDialog] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);

  // Form state for editing
  const [formData, setFormData] = useState({
    name: "",
    business_type: "",
    phone: "",
    timezone: "",
    address: "",
  });

  const fetchTeamData = useCallback(async (orgId: string) => {
    try {
      // Fetch team members
      const { data: rolesRes } = await supabase
        .from("user_roles")
        .select("id, user_id, role")
        .eq("organization_id", orgId);

      if (rolesRes && rolesRes.length > 0) {
        const userIds = rolesRes.map((r) => r.user_id);
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name, email")
          .in("id", userIds);

        const membersWithProfiles = rolesRes.map((role) => ({
          ...role,
          profile: profiles?.find((p) => p.id === role.user_id) || null,
        }));
        setTeamMembers(membersWithProfiles);
      } else {
        setTeamMembers([]);
      }

      // Fetch invitations
      const { data: invitesRes } = await supabase
        .from("invitations")
        .select("id, email, role, status, created_at, expires_at")
        .eq("organization_id", orgId)
        .in("status", ["pending"]);

      setInvitations(invitesRes || []);
    } catch (error) {
      console.error("Error fetching team data:", error);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;

      try {
        // Get profile and org ID
        const { data: profile } = await supabase
          .from("profiles")
          .select("organization_id")
          .eq("id", user.id)
          .maybeSingle();

        if (!profile?.organization_id) {
          setLoading(false);
          return;
        }

        setOrganizationId(profile.organization_id);

        // Fetch all data in parallel
        const [orgRes, phonesRes, subRes, rolesRes] = await Promise.all([
          supabase
            .from("organizations")
            .select("*")
            .eq("id", profile.organization_id)
            .single(),
          supabase
            .from("phone_numbers")
            .select("id, phone_number, friendly_name, is_active, country_code, status")
            .eq("organization_id", profile.organization_id)
            .eq("status", "active"),
          supabase
            .from("subscriptions")
            .select("*")
            .eq("organization_id", profile.organization_id)
            .maybeSingle(),
          supabase
            .from("user_roles")
            .select("id, user_id, role")
            .eq("organization_id", profile.organization_id),
        ]);

        if (orgRes.data) {
          const org = orgRes.data;
          setOrganization(org);
          setFormData({
            name: org.name || "",
            business_type: org.business_type || "",
            phone: org.phone || "",
            timezone: org.timezone || "Europe/Amsterdam",
            address: org.address
              ? `${(org.address as any).street || ""}, ${(org.address as any).postal_code || ""} ${(org.address as any).city || ""}`
              : "",
          });
        }

        if (phonesRes.data) {
          setPhoneNumbers(phonesRes.data);
        }

        if (subRes.data) {
          setSubscription(subRes.data);
        }

        // Fetch team data including invitations
        await fetchTeamData(profile.organization_id);
      } catch (error) {
        console.error("Error fetching settings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.id, fetchTeamData]);

  const handleSaveGeneral = async () => {
    if (!organizationId) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("organizations")
        .update({
          name: formData.name,
          business_type: formData.business_type as any,
          phone: formData.phone,
          timezone: formData.timezone,
        })
        .eq("id", organizationId);

      if (error) throw error;

      toast({
        title: "Settings saved",
        description: "Your business information has been updated.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error saving",
        description: error.message,
      });
    } finally {
      setSaving(false);
    }
  };

  const minutesUsed = subscription?.minutes_used || 0;
  const minutesIncluded = subscription?.minutes_included || 100;
  const usagePercentage = Math.round((minutesUsed / minutesIncluded) * 100);

  const planLabels: Record<string, string> = {
    starter: "Starter Plan",
    growth: "Growth Plan",
    enterprise: "Enterprise Plan",
  };

  const planPrices: Record<string, string> = {
    starter: "€97/month",
    growth: "€197/month",
    enterprise: "€497/month",
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-full max-w-md" />
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-serif text-foreground">Settings</h1>
        <p className="text-muted-foreground">
          Manage your business settings and AI configuration.
        </p>
      </div>

      <Tabs defaultValue="business" className="space-y-6">
        <TabsList className="bg-muted/50 flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="business" className="gap-2">
            <Building className="w-4 h-4" />
            My Business
          </TabsTrigger>
          <TabsTrigger value="ai" className="gap-2">
            <Bot className="w-4 h-4" />
            AI Assistant
          </TabsTrigger>
          <TabsTrigger value="phone" className="gap-2">
            <Phone className="w-4 h-4" />
            Phone Numbers
          </TabsTrigger>
          <TabsTrigger value="integrations" className="gap-2">
            <Link className="w-4 h-4" />
            Integrations
          </TabsTrigger>
          <TabsTrigger value="team" className="gap-2">
            <Users className="w-4 h-4" />
            Team
          </TabsTrigger>
          <TabsTrigger value="billing" className="gap-2">
            <CreditCard className="w-4 h-4" />
            Billing
          </TabsTrigger>
        </TabsList>

        {/* Business Tab */}
        <TabsContent value="business" className="space-y-6">
          {organizationId && <BusinessSettings organizationId={organizationId} />}
        </TabsContent>

        {/* AI Assistant Tab */}
        <TabsContent value="ai" className="space-y-6">
          <AIAssistantSettings organizationId={organizationId || undefined} />
        </TabsContent>

        {/* Phone Numbers Tab */}
        <TabsContent value="phone" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Phone Numbers</CardTitle>
                <CardDescription>
                  Manage your AI receptionist phone numbers.
                </CardDescription>
              </div>
              <Button className="gap-2" onClick={() => setShowPhoneDialog(true)}>
                <Plus className="w-4 h-4" />
                Add Number
              </Button>
            </CardHeader>
            <CardContent>
              {phoneNumbers.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Phone className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No phone numbers configured</p>
                  <p className="text-sm mt-1 mb-4">
                    Add a phone number to start receiving AI-powered calls
                  </p>
                  <Button onClick={() => setShowPhoneDialog(true)}>
                    Get Phone Number
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {phoneNumbers.map((phone) => (
                    <div
                      key={phone.id}
                      className="flex items-center justify-between p-4 rounded-xl border border-border"
                    >
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Phone className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium">
                            {/* Check if it's a real phone number or a SIP/web endpoint */}
                            {phone.phone_number.match(/^\+?[\d\s\-()]+$/) 
                              ? phone.phone_number 
                              : "Web Call Endpoint"}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {phone.friendly_name || "Main Line"}
                            {!phone.phone_number.match(/^\+?[\d\s\-()]+$/) && (
                              <span className="ml-2 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                                Browser calls only
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge
                          variant="secondary"
                          className={
                            phone.is_active
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-700"
                          }
                        >
                          {phone.is_active ? "Active" : "Inactive"}
                        </Badge>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="w-4 h-4 text-muted-foreground" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Call Forwarding Instructions */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <PhoneForwarded className="w-5 h-5 text-primary" />
                <CardTitle>Forward Your Existing Number</CardTitle>
              </div>
              <CardDescription>
                Keep your current business number and forward calls to your AI
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-xl bg-muted/50 space-y-3">
                <p className="font-medium text-foreground">How to set up call forwarding:</p>
                <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                  <li>Contact your phone provider or access your phone settings</li>
                  <li>Set up "No Answer" or "Busy" call forwarding</li>
                  <li>Enter your AI phone number as the forwarding destination</li>
                  <li>Save the settings - calls will now route to your AI when you can't answer</li>
                </ol>
              </div>

              {phoneNumbers.length > 0 && phoneNumbers[0]?.phone_number.match(/^\+?[\d\s\-()]+$/) && (
                <div className="p-4 rounded-xl border border-primary/20 bg-primary/5">
                  <p className="text-sm text-muted-foreground mb-2">Forward calls to:</p>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-mono font-medium text-foreground">
                      {phoneNumbers[0]?.phone_number}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => {
                        navigator.clipboard.writeText(phoneNumbers[0]?.phone_number || "");
                        toast({ title: "Copied to clipboard" });
                      }}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
              
              {phoneNumbers.length > 0 && !phoneNumbers[0]?.phone_number.match(/^\+?[\d\s\-()]+$/) && (
                <div className="p-4 rounded-xl border border-amber-200 bg-amber-50">
                  <p className="text-sm text-amber-800 font-medium mb-1">Web-only endpoint active</p>
                  <p className="text-sm text-amber-700">
                    Your current setup allows browser-based calls only. To receive real phone calls, 
                    you'll need to connect a Twilio account in Settings → Integrations.
                  </p>
                </div>
              )}

              <div className="text-sm text-muted-foreground">
                <p className="font-medium text-foreground mb-2">Common provider instructions:</p>
                <ul className="space-y-1">
                  <li>• <strong>iPhone:</strong> Settings → Phone → Call Forwarding</li>
                  <li>• <strong>Android:</strong> Phone app → Settings → Call forwarding</li>
                  <li>• <strong>Landline/VoIP:</strong> Contact your provider for setup codes</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations Tab */}
        <TabsContent value="integrations" className="space-y-6">
          {organizationId && (
            <GoogleCalendarIntegration organizationId={organizationId} />
          )}

        </TabsContent>

        {/* Team Tab */}
        <TabsContent value="team" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Team Members</CardTitle>
                <CardDescription>Invite and manage team members.</CardDescription>
              </div>
              <Button className="gap-2" onClick={() => setShowInviteDialog(true)}>
                <Plus className="w-4 h-4" />
                Invite Member
              </Button>
            </CardHeader>
            <CardContent>
              {organizationId && user && (
                <TeamMembersList
                  members={teamMembers}
                  invitations={invitations}
                  currentUserId={user.id}
                  organizationId={organizationId}
                  onMemberRemoved={() => fetchTeamData(organizationId)}
                  onInvitationCancelled={() => fetchTeamData(organizationId)}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Current Plan</CardTitle>
              <CardDescription>
                Manage your subscription and billing.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-xl bg-primary/5 border border-primary/20">
                <div>
                  <div className="text-lg font-serif font-medium text-primary">
                    {planLabels[subscription?.plan || "starter"] || "Starter Plan"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {planPrices[subscription?.plan || "starter"] || "€97/month"}
                    {subscription?.current_period_end && (
                      <>
                        {" · Renews on "}
                        {format(
                          parseISO(subscription.current_period_end),
                          "MMMM d, yyyy"
                        )}
                      </>
                    )}
                  </div>
                </div>
                <Button variant="outline">Upgrade Plan</Button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Minutes Usage</div>
                    <div className="text-sm text-muted-foreground">
                      {minutesUsed} of {minutesIncluded} minutes used
                    </div>
                  </div>
                  <span className="text-sm font-medium">{usagePercentage}%</span>
                </div>
                <Progress value={usagePercentage} />
              </div>

              <div className="flex gap-4">
                <Button variant="outline">Manage Payment</Button>
                <Button variant="outline">View Invoices</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Phone Number Dialog */}
      {organizationId && (
        <PhoneNumberDialog
          open={showPhoneDialog}
          onOpenChange={setShowPhoneDialog}
          organizationId={organizationId}
          onSuccess={(phoneNumber) => {
            setPhoneNumbers((prev) => [
              ...prev,
              {
                id: crypto.randomUUID(),
                phone_number: phoneNumber,
                friendly_name: "Main Line",
                is_active: true,
                country_code: null,
                status: "active",
              },
            ]);
            setShowPhoneDialog(false);
          }}
        />
      )}

      {/* Invite Member Dialog */}
      {organizationId && (
        <InviteMemberDialog
          open={showInviteDialog}
          onOpenChange={setShowInviteDialog}
          organizationId={organizationId}
          onSuccess={() => fetchTeamData(organizationId)}
        />
      )}
    </div>
  );
};

export default DashboardSettings;
