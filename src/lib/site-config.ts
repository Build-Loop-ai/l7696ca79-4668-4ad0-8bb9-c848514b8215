/**
 * Site Configuration
 * 
 * This file contains all the configurable branding and site settings.
 * Update these values to customize the template for your business.
 */

export const siteConfig = {
  // Brand
  name: "Callisto",
  tagline: "Your AI receptionist, always ready",
  description: "Never miss a call again. AI that answers, books, and delights your customers 24/7.",
  
  // Contact
  supportEmail: "support@callisto.ai",
  salesEmail: "sales@callisto.ai",
  
  // Social (leave empty to hide)
  social: {
    twitter: "https://twitter.com/callisto",
    linkedin: "https://linkedin.com/company/callisto",
    instagram: "",
  },
  
  // Legal
  privacyUrl: "/privacy",
  termsUrl: "/terms",
  
  // Features
  trialDays: 14,
  annualDiscount: 20, // percentage
  
  // Default currency
  currency: "EUR",
  currencySymbol: "€",
  
  // Social proof (set to empty string to hide)
  socialProof: {
    customerCount: "500+",
    customerLabel: "clinics worldwide",
  },
  
  // Demo page
  demo: {
    enabled: true,
    title: "Hear Your AI Receptionist",
    subtitle: "Experience the future of customer service in 30 seconds",
  },
} as const;

export type SiteConfig = typeof siteConfig;
