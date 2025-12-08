import { useState, useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Loader2, Building, Clock, Briefcase, MessageSquare, RefreshCw } from "lucide-react";
import { BusinessHoursEditor } from "./BusinessHoursEditor";
import { ServicesEditor } from "./ServicesEditor";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Json } from "@/integrations/supabase/types";

interface BusinessSettingsProps {
  organizationId: string;
}

interface Service {
  name: string;
  duration?: number;
  description?: string;
}

interface DayHours {
  isOpen: boolean;
  open: string;
  close: string;
}

interface BusinessHours {
  [day: string]: DayHours;
}

export function BusinessSettings({ organizationId }: BusinessSettingsProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [recreatingAssistant, setRecreatingAssistant] = useState(false);

  // Organization data
  const [formData, setFormData] = useState({
    name: "",
    business_type: "",
    phone: "",
    timezone: "",
    description: "",
    special_instructions: "",
    address: {
      street: "",
      city: "",
      postal_code: "",
    },
  });

  // Settings data
  const [businessHours, setBusinessHours] = useState<BusinessHours>({});
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch organization and settings in parallel
        const [orgRes, settingsRes] = await Promise.all([
          supabase
            .from("organizations")
            .select("*")
            .eq("id", organizationId)
            .single(),
          supabase
            .from("organization_settings")
            .select("business_hours, services")
            .eq("organization_id", organizationId)
            .maybeSingle(),
        ]);

        if (orgRes.data) {
          const org = orgRes.data;
          const addr = (org.address as any) || {};
          setFormData({
            name: org.name || "",
            business_type: org.business_type || "",
            phone: org.phone || "",
            timezone: org.timezone || "Europe/Amsterdam",
            description: (org as any).description || "",
            special_instructions: (org as any).special_instructions || "",
            address: {
              street: addr.street || "",
              city: addr.city || "",
              postal_code: addr.postal_code || "",
            },
          });
        }

        if (settingsRes.data) {
          setBusinessHours((settingsRes.data.business_hours as unknown as BusinessHours) || {});
          setServices((settingsRes.data.services as unknown as Service[]) || []);
        }
      } catch (error) {
        console.error("Error fetching business data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (organizationId) {
      fetchData();
    }
  }, [organizationId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Update organization
      const { error: orgError } = await supabase
        .from("organizations")
        .update({
          name: formData.name,
          business_type: formData.business_type as any,
          phone: formData.phone,
          timezone: formData.timezone,
          description: formData.description,
          special_instructions: formData.special_instructions,
          address: formData.address as unknown as Json,
        })
        .eq("id", organizationId);

      if (orgError) throw orgError;

      // Update settings
      const { error: settingsError } = await supabase
        .from("organization_settings")
        .update({
          business_hours: businessHours as unknown as Json,
          services: services as unknown as Json,
        })
        .eq("organization_id", organizationId);

      if (settingsError) throw settingsError;

      toast({
        title: "Settings saved",
        description: "Your business configuration has been updated.",
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

  const handleRecreateAssistant = async () => {
    setRecreatingAssistant(true);
    try {
      // Save current settings first
      await handleSave();

      // Call create-vapi-assistant to recreate with latest settings
      const { data, error } = await supabase.functions.invoke("create-vapi-assistant", {
        body: { organizationId },
      });

      if (error) throw error;

      toast({
        title: "AI Assistant recreated",
        description: "Your AI assistant has been updated with the latest business settings.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error recreating assistant",
        description: error.message,
      });
    } finally {
      setRecreatingAssistant(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Accordion type="multiple" defaultValue={["info", "hours", "services", "ai"]} className="space-y-4">
        {/* Basic Information */}
        <AccordionItem value="info" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3">
              <Building className="w-5 h-5 text-primary" />
              <div className="text-left">
                <div className="font-medium">Basic Information</div>
                <div className="text-sm text-muted-foreground font-normal">
                  Name, address, and contact details
                </div>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-4 pb-6">
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Business Name</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Business Type</Label>
                  <Select
                    value={formData.business_type}
                    onValueChange={(value) => setFormData({ ...formData, business_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dental_clinic">Dental Clinic</SelectItem>
                      <SelectItem value="medical_practice">Medical Practice</SelectItem>
                      <SelectItem value="salon">Salon</SelectItem>
                      <SelectItem value="restaurant">Restaurant</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Business Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe what your business does, your specialties, etc."
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  This will help the AI understand your business and answer questions.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Street Address</Label>
                  <Input
                    value={formData.address.street}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        address: { ...formData.address, street: e.target.value },
                      })
                    }
                    placeholder="123 Main Street"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Postal Code</Label>
                  <Input
                    value={formData.address.postal_code}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        address: { ...formData.address, postal_code: e.target.value },
                      })
                    }
                    placeholder="1234 AB"
                  />
                </div>
                <div className="space-y-2">
                  <Label>City</Label>
                  <Input
                    value={formData.address.city}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        address: { ...formData.address, city: e.target.value },
                      })
                    }
                    placeholder="Amsterdam"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Contact Phone</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+31 20 123 4567"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Timezone</Label>
                  <Select
                    value={formData.timezone}
                    onValueChange={(value) => setFormData({ ...formData, timezone: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Europe/Amsterdam">Europe/Amsterdam (CET)</SelectItem>
                      <SelectItem value="Europe/London">Europe/London (GMT)</SelectItem>
                      <SelectItem value="Europe/Paris">Europe/Paris (CET)</SelectItem>
                      <SelectItem value="Europe/Berlin">Europe/Berlin (CET)</SelectItem>
                      <SelectItem value="America/New_York">America/New_York (EST)</SelectItem>
                      <SelectItem value="America/Los_Angeles">America/Los_Angeles (PST)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Business Hours */}
        <AccordionItem value="hours" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-primary" />
              <div className="text-left">
                <div className="font-medium">Business Hours</div>
                <div className="text-sm text-muted-foreground font-normal">
                  When your business is open
                </div>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-4 pb-6">
            <BusinessHoursEditor value={businessHours} onChange={setBusinessHours} />
          </AccordionContent>
        </AccordionItem>

        {/* Services */}
        <AccordionItem value="services" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3">
              <Briefcase className="w-5 h-5 text-primary" />
              <div className="text-left">
                <div className="font-medium">Services</div>
                <div className="text-sm text-muted-foreground font-normal">
                  Services you offer and their durations
                </div>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-4 pb-6">
            <ServicesEditor value={services} onChange={setServices} />
          </AccordionContent>
        </AccordionItem>

        {/* AI Instructions */}
        <AccordionItem value="ai" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-5 h-5 text-primary" />
              <div className="text-left">
                <div className="font-medium">AI Instructions</div>
                <div className="text-sm text-muted-foreground font-normal">
                  Special instructions for your AI receptionist
                </div>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-4 pb-6">
            <div className="space-y-4">
              <Textarea
                value={formData.special_instructions}
                onChange={(e) =>
                  setFormData({ ...formData, special_instructions: e.target.value })
                }
                placeholder="Examples:
- Always ask for the patient's date of birth for verification
- Never discuss pricing over the phone, ask them to visit our website
- For emergencies, immediately transfer to the main line
- We don't accept new patients on Mondays"
                rows={6}
              />
              <p className="text-xs text-muted-foreground">
                These instructions will be included in the AI's prompt to customize its behavior.
              </p>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="flex items-center gap-4">
        <Button onClick={handleSave} disabled={saving}>
          {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Save Business Settings
        </Button>
        <Button
          variant="outline"
          onClick={handleRecreateAssistant}
          disabled={recreatingAssistant}
        >
          {recreatingAssistant ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4 mr-2" />
          )}
          Sync to AI Assistant
        </Button>
      </div>
    </div>
  );
}
