import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { Skeleton } from "@/components/ui/skeleton";
import { SaveStatusIndicator } from "@/components/ui/save-status";
import { Button } from "@/components/ui/button";
import { useSiteConfig, useUpdateSiteConfig, SiteConfig } from "@/hooks/useSiteConfig";
import { useAutoSave } from "@/hooks/useAutoSave";
import { Globe, Mail, Share2, FileText, Image, Upload, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function AdminSiteConfig() {
  const { data: config, isLoading } = useSiteConfig();
  const updateConfig = useUpdateSiteConfig();
  const [formData, setFormData] = useState<Partial<SiteConfig>>({});
  const [uploadingLight, setUploadingLight] = useState(false);
  const [uploadingDark, setUploadingDark] = useState(false);
  const lightLogoInputRef = useRef<HTMLInputElement>(null);
  const darkLogoInputRef = useRef<HTMLInputElement>(null);

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

  const updateField = (field: keyof SiteConfig, value: string | number | boolean | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleLogoUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "light" | "dark"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be less than 2MB");
      return;
    }

    const setUploading = type === "light" ? setUploadingLight : setUploadingDark;
    const field = type === "light" ? "logo_url" : "logo_url_dark";

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `site-logo-${type}-${Date.now()}.${fileExt}`;
      const filePath = `public/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("site-assets")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("site-assets")
        .getPublicUrl(filePath);

      updateField(field, publicUrl);
      toast.success(`${type === "light" ? "Light" : "Dark"} logo uploaded successfully`);
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || "Failed to upload logo");
    } finally {
      setUploading(false);
    }
  };

  const removeLogo = (type: "light" | "dark") => {
    updateField(type === "light" ? "logo_url" : "logo_url_dark", null);
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

      {/* Logos */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Image className="h-5 w-5 text-primary" />
            <CardTitle>Logos</CardTitle>
          </div>
          <CardDescription>Upload both light and dark versions of your logo for optimal display</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Light Logo (for dark backgrounds) */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Light Logo (for dark backgrounds)</Label>
            <p className="text-xs text-muted-foreground">Used on the landing page navbar and admin panel</p>
            <div className="flex items-start gap-6">
              <div className="relative flex h-20 w-40 items-center justify-center rounded-lg bg-slate-900 p-3">
                {formData.logo_url ? (
                  <>
                    <img
                      src={formData.logo_url}
                      alt="Light logo"
                      className="h-full w-auto max-w-full object-contain"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6"
                      onClick={() => removeLogo("light")}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </>
                ) : (
                  <Image className="h-8 w-8 text-slate-600" />
                )}
              </div>
              <div className="space-y-2">
                <input
                  ref={lightLogoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleLogoUpload(e, "light")}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  onClick={() => lightLogoInputRef.current?.click()}
                  disabled={uploadingLight}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {uploadingLight ? "Uploading..." : "Upload Light Logo"}
                </Button>
                <p className="text-xs text-muted-foreground">
                  PNG or SVG with transparent background, max 2MB
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="logo_url">Or enter URL directly</Label>
              <Input
                id="logo_url"
                value={formData.logo_url || ""}
                onChange={(e) => updateField("logo_url", e.target.value)}
                placeholder="https://example.com/logo-light.png"
              />
            </div>
          </div>

          <div className="border-t border-border" />

          {/* Dark Logo (for light backgrounds) */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Dark Logo (for light backgrounds)</Label>
            <p className="text-xs text-muted-foreground">Used on the dashboard sidebar</p>
            <div className="flex items-start gap-6">
              <div className="relative flex h-20 w-40 items-center justify-center rounded-lg bg-white border border-border p-3">
                {formData.logo_url_dark ? (
                  <>
                    <img
                      src={formData.logo_url_dark}
                      alt="Dark logo"
                      className="h-full w-auto max-w-full object-contain"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6"
                      onClick={() => removeLogo("dark")}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </>
                ) : (
                  <Image className="h-8 w-8 text-slate-300" />
                )}
              </div>
              <div className="space-y-2">
                <input
                  ref={darkLogoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleLogoUpload(e, "dark")}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  onClick={() => darkLogoInputRef.current?.click()}
                  disabled={uploadingDark}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {uploadingDark ? "Uploading..." : "Upload Dark Logo"}
                </Button>
                <p className="text-xs text-muted-foreground">
                  PNG or SVG with transparent background, max 2MB
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="logo_url_dark">Or enter URL directly</Label>
              <Input
                id="logo_url_dark"
                value={formData.logo_url_dark || ""}
                onChange={(e) => updateField("logo_url_dark", e.target.value)}
                placeholder="https://example.com/logo-dark.png"
              />
            </div>
          </div>
        </CardContent>
      </Card>

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
