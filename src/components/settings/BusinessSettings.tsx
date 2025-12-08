import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
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
import { Loader2, Building, Clock, Briefcase, Save } from "lucide-react";
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

  // Organization data (no AI-related fields)
  const [formData, setFormData] = useState({
    name: "",
    business_type: "",
    phone: "",
    timezone: "",
    description: "",
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
            description: org.description || "",
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
      // Update organization (no special_instructions - moved to AI tab)
      const { error: orgError } = await supabase
        .from("organizations")
        .update({
          name: formData.name,
          business_type: formData.business_type as any,
          phone: formData.phone,
          timezone: formData.timezone,
          description: formData.description,
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

      // Sync to AI assistant automatically
      await supabase.functions.invoke("create-vapi-assistant", {
        body: { organizationId },
      });

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
      <Accordion type="multiple" defaultValue={["info", "hours", "services"]} className="space-y-4">
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
                  This helps the AI understand your business and answer questions accurately.
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
      </Accordion>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          <Save className="w-4 h-4 mr-2" />
          {saving ? "Saving..." : "Save Business Info"}
        </Button>
      </div>
    </div>
  );
}
