import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { siteConfig as staticConfig } from "@/lib/site-config";

export interface SiteConfig {
  id: string;
  site_name: string;
  tagline: string;
  description: string;
  support_email: string;
  sales_email: string;
  social_twitter: string | null;
  social_linkedin: string | null;
  social_instagram: string | null;
  privacy_url: string | null;
  terms_url: string | null;
  trial_days: number;
  annual_discount: number;
  currency: string;
  currency_symbol: string;
  social_proof_count: string | null;
  social_proof_label: string | null;
  demo_enabled: boolean | null;
  demo_title: string | null;
  demo_subtitle: string | null;
  logo_url: string | null;
}

// Transform database config to match the static config structure
export function transformToStaticFormat(dbConfig: SiteConfig) {
  return {
    name: dbConfig.site_name,
    tagline: dbConfig.tagline,
    description: dbConfig.description,
    supportEmail: dbConfig.support_email,
    salesEmail: dbConfig.sales_email,
    social: {
      twitter: dbConfig.social_twitter || "",
      linkedin: dbConfig.social_linkedin || "",
      instagram: dbConfig.social_instagram || "",
    },
    privacyUrl: dbConfig.privacy_url || "/privacy",
    termsUrl: dbConfig.terms_url || "/terms",
    trialDays: dbConfig.trial_days,
    annualDiscount: dbConfig.annual_discount,
    currency: dbConfig.currency,
    currencySymbol: dbConfig.currency_symbol,
    socialProof: {
      customerCount: dbConfig.social_proof_count || "",
      customerLabel: dbConfig.social_proof_label || "",
    },
    demo: {
      enabled: dbConfig.demo_enabled ?? true,
      title: dbConfig.demo_title || "Hear Your AI Receptionist",
      subtitle: dbConfig.demo_subtitle || "Experience the future of customer service in 30 seconds",
    },
    logoUrl: dbConfig.logo_url || "",
  };
}

export function useSiteConfig() {
  return useQuery({
    queryKey: ["site-config"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_config")
        .select("*")
        .limit(1)
        .single();

      if (error || !data) {
        // Fallback to static config if database fetch fails
        console.warn("Using static site config fallback:", error?.message);
        return null;
      }

      return data as SiteConfig;
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
}

// Hook that returns the transformed config (matching static format)
export function useSiteConfigTransformed() {
  const { data: dbConfig, isLoading, error } = useSiteConfig();

  if (isLoading) {
    return { config: staticConfig, isLoading: true };
  }

  if (!dbConfig || error) {
    return { config: staticConfig, isLoading: false };
  }

  return {
    config: transformToStaticFormat(dbConfig),
    isLoading: false,
  };
}

export function useUpdateSiteConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: Partial<Omit<SiteConfig, "id">>) => {
      // Get current config ID first
      const { data: current } = await supabase
        .from("site_config")
        .select("id")
        .limit(1)
        .single();

      if (!current) {
        throw new Error("No site config found");
      }

      const { data, error } = await supabase
        .from("site_config")
        .update(updates)
        .eq("id", current.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site-config"] });
    },
  });
}
