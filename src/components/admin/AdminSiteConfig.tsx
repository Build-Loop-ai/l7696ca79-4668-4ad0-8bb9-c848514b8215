import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { SaveStatusIndicator } from "@/components/ui/save-status";
import { useSiteConfig, useUpdateSiteConfig, SiteConfig } from "@/hooks/useSiteConfig";
import { useAutoSave } from "@/hooks/useAutoSave";
import { Globe, Mail, Share2, DollarSign, Megaphone, FileText } from "lucide-react";

export default function AdminSiteConfig() {
  const { data: config, isLoading } = useSiteConfig();
  const updateConfig = useUpdateSiteConfig();
  const [formData, setFormData] = useState<Partial<SiteConfig>>({});

  useEffect(() => {
    if (config) {
      setFormData(config);
    }
  }, [config]);

  const { status: saveStatus } = useAutoSave({
    data: formData,
    onSave: async (data) => {
      if (!config?.id) return;
      const { id, ...updates } = data as SiteConfig;
      await updateConfig.mutateAsync(updates);
    },
    debounceMs: 1500,
  });

  const updateField = (field: keyof SiteConfig, value: string | number | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-[200px] w-full" />
        <Skeleton className="h-[200px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Site Configuration</h2>
          <p className="text-muted-foreground">
            Manage branding, social links, and site-wide settings
          </p>
        </div>
        <SaveStatusIndicator status={saveStatus} />
      </div>

      {/* Branding */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            <CardTitle>Branding</CardTitle>
          </div>
          <CardDescription>Your site name and main messaging</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="site_name">Site Name</Label>
              <Input
                id="site_name"
                value={formData.site_name || ""}
                onChange={(e) => updateField("site_name", e.target.value)}
                placeholder="Your AI Receptionist"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tagline">Tagline</Label>
              <Input
                id="tagline"
                value={formData.tagline || ""}
                onChange={(e) => updateField("tagline", e.target.value)}
                placeholder="Your AI receptionist, always ready"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description || ""}
              onChange={(e) => updateField("description", e.target.value)}
              placeholder="Brief description for SEO and marketing"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Contact Emails */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            <CardTitle>Contact Emails</CardTitle>
          </div>
          <CardDescription>Email addresses shown on the site</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="support_email">Support Email</Label>
              <Input
                id="support_email"
                type="email"
                value={formData.support_email || ""}
                onChange={(e) => updateField("support_email", e.target.value)}
                placeholder="support@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sales_email">Sales Email</Label>
              <Input
                id="sales_email"
                type="email"
                value={formData.sales_email || ""}
                onChange={(e) => updateField("sales_email", e.target.value)}
                placeholder="sales@example.com"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Social Links */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-primary" />
            <CardTitle>Social Links</CardTitle>
          </div>
          <CardDescription>Leave empty to hide from footer</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="social_twitter">Twitter/X</Label>
              <Input
                id="social_twitter"
                value={formData.social_twitter || ""}
                onChange={(e) => updateField("social_twitter", e.target.value)}
                placeholder="https://twitter.com/..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="social_linkedin">LinkedIn</Label>
              <Input
                id="social_linkedin"
                value={formData.social_linkedin || ""}
                onChange={(e) => updateField("social_linkedin", e.target.value)}
                placeholder="https://linkedin.com/company/..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="social_instagram">Instagram</Label>
              <Input
                id="social_instagram"
                value={formData.social_instagram || ""}
                onChange={(e) => updateField("social_instagram", e.target.value)}
                placeholder="https://instagram.com/..."
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pricing & Features */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            <CardTitle>Pricing & Features</CardTitle>
          </div>
          <CardDescription>Trial period and discount settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="trial_days">Trial Days</Label>
              <Input
                id="trial_days"
                type="number"
                value={formData.trial_days || 14}
                onChange={(e) => updateField("trial_days", parseInt(e.target.value) || 14)}
                min={0}
                max={90}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="annual_discount">Annual Discount (%)</Label>
              <Input
                id="annual_discount"
                type="number"
                value={formData.annual_discount || 20}
                onChange={(e) => updateField("annual_discount", parseInt(e.target.value) || 0)}
                min={0}
                max={100}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Currency Code</Label>
              <Input
                id="currency"
                value={formData.currency || "EUR"}
                onChange={(e) => updateField("currency", e.target.value.toUpperCase())}
                placeholder="EUR"
                maxLength={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency_symbol">Currency Symbol</Label>
              <Input
                id="currency_symbol"
                value={formData.currency_symbol || "€"}
                onChange={(e) => updateField("currency_symbol", e.target.value)}
                placeholder="€"
                maxLength={3}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Social Proof */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-primary" />
            <CardTitle>Social Proof</CardTitle>
          </div>
          <CardDescription>Customer count shown on landing page</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="social_proof_count">Customer Count</Label>
              <Input
                id="social_proof_count"
                value={formData.social_proof_count || ""}
                onChange={(e) => updateField("social_proof_count", e.target.value)}
                placeholder="500+"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="social_proof_label">Customer Label</Label>
              <Input
                id="social_proof_label"
                value={formData.social_proof_label || ""}
                onChange={(e) => updateField("social_proof_label", e.target.value)}
                placeholder="businesses worldwide"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Demo Page */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <CardTitle>Demo Page</CardTitle>
          </div>
          <CardDescription>Configuration for the public demo page</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Demo Page Enabled</Label>
              <p className="text-sm text-muted-foreground">Show the public demo page at /demo</p>
            </div>
            <Switch
              checked={formData.demo_enabled ?? true}
              onCheckedChange={(checked) => updateField("demo_enabled", checked)}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="demo_title">Demo Title</Label>
              <Input
                id="demo_title"
                value={formData.demo_title || ""}
                onChange={(e) => updateField("demo_title", e.target.value)}
                placeholder="Hear Your AI Receptionist"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="demo_subtitle">Demo Subtitle</Label>
              <Input
                id="demo_subtitle"
                value={formData.demo_subtitle || ""}
                onChange={(e) => updateField("demo_subtitle", e.target.value)}
                placeholder="Experience the future..."
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Legal URLs */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <CardTitle>Legal Pages</CardTitle>
          </div>
          <CardDescription>URLs for privacy policy and terms of service</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="privacy_url">Privacy Policy URL</Label>
              <Input
                id="privacy_url"
                value={formData.privacy_url || ""}
                onChange={(e) => updateField("privacy_url", e.target.value)}
                placeholder="/privacy"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="terms_url">Terms of Service URL</Label>
              <Input
                id="terms_url"
                value={formData.terms_url || ""}
                onChange={(e) => updateField("terms_url", e.target.value)}
                placeholder="/terms"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
