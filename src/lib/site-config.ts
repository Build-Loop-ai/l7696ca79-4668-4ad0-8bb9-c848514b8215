/**
 * Site Configuration - Fallback Defaults
 * 
 * These values are used as fallbacks when the database config is unavailable.
 * The actual site configuration is managed in the admin panel (Site Config section)
 * and stored in the site_config database table.
 * 
 * IMPORTANT: After deploying, update these values in the Admin Panel → Site Config
 * to customize your brand without code changes.
 */

export const siteConfig = {
  // Brand - Update these in Admin Panel → Site Config
  name: "AI Receptionist",
  tagline: "Your AI receptionist, always ready",
  logoUrl: "", // Logo for dark backgrounds (light logo) - upload in Admin Panel
  logoUrlDark: "", // Logo for light backgrounds (dark logo) - upload in Admin Panel
  description: "Never miss a call again. AI that answers, books, and delights your customers 24/7.",
  
  // Contact - Update in Admin Panel → Site Config
  supportEmail: "support@example.com",
  salesEmail: "sales@example.com",
  
  // Social links - Leave empty to hide, configure in Admin Panel
  social: {
    twitter: "",
    linkedin: "",
    instagram: "",
  },
  
  // Legal pages
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
    customerLabel: "businesses worldwide",
  },
  
  // Demo page
  demo: {
    enabled: true,
    title: "Hear Your AI Receptionist",
    subtitle: "Experience the future of customer service in 30 seconds",
  },
} as const;

export type SiteConfig = typeof siteConfig;