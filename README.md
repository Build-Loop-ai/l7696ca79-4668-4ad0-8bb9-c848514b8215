# AI Voice Receptionist SaaS Template

A production-ready, white-label AI voice receptionist platform built with React, Supabase, and Vapi.ai. Perfect for businesses offering AI receptionist services to dental clinics, medical practices, salons, and other local service businesses.

![AI Receptionist](https://images.unsplash.com/photo-1596524430615-b46475ddff6e?w=1200&h=600&fit=crop)

## ✨ Features

### For End Users (Businesses)
- **AI Voice Receptionist** - Natural, conversational AI that handles incoming calls
- **Appointment Booking** - Intelligent scheduling with Google Calendar integration
- **Multi-Language Support** - 22+ languages with native-sounding voices
- **Custom Greeting & Personality** - Fully configurable AI behavior
- **Call Transcripts & Recordings** - Complete call history with searchable transcripts
- **Real-Time Dashboard** - Live call monitoring and analytics
- **Team Management** - Invite team members with role-based access

### For Platform Operators
- **Multi-Tenant Architecture** - Secure data isolation per organization
- **Subscription Management** - Stripe integration with usage-based billing
- **Admin Dashboard** - Platform-wide analytics and user management
- **AI-Powered Contact Replies** - Automated lead response system
- **Configurable Pricing Plans** - Dynamic pricing from database
- **White-Label Ready** - Fully brandable for your business

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Supabase (PostgreSQL, Auth, Edge Functions, Realtime)
- **Voice AI**: Vapi.ai (Voice Processing, Speech Recognition)
- **Phone Numbers**: Twilio (Number Provisioning, Call Routing)
- **Voice Synthesis**: ElevenLabs (Premium AI Voices)
- **Payments**: Stripe (Subscriptions, Checkout, Webhooks)
- **Email**: Resend (Transactional Emails)
- **Calendar**: Google Calendar API

## 📋 Prerequisites

Before deploying this template, you'll need accounts for:

1. **Vapi.ai** - Voice AI platform ([Sign up](https://vapi.ai))
2. **Twilio** - Phone number provisioning ([Sign up](https://twilio.com))
3. **ElevenLabs** - Voice synthesis ([Sign up](https://elevenlabs.io))
4. **Stripe** - Payment processing ([Sign up](https://stripe.com))
5. **Resend** - Email delivery ([Sign up](https://resend.com))
6. **Google Cloud** - Calendar integration ([Console](https://console.cloud.google.com))

## 🚀 Quick Start

### 1. Deploy to Lovable

Click "Use Template" to create your own copy of this project in Lovable.

### 2. Configure Secrets

In your Lovable project, go to **Settings → Backend → Secrets** and add:

| Secret Name | Description | Where to Get |
|-------------|-------------|--------------|
| `VAPI_API_KEY` | Vapi.ai secret API key | [Vapi Dashboard](https://dashboard.vapi.ai) → Settings → API Keys |
| `VAPI_PUBLIC_KEY` | Vapi.ai public key (for browser calls) | Same as above |
| `TWILIO_ACCOUNT_SID` | Twilio Account SID | [Twilio Console](https://console.twilio.com) |
| `TWILIO_AUTH_TOKEN` | Twilio Auth Token | Twilio Console → Account Info |
| `TWILIO_API_KEY` | Twilio API Key SID | Twilio Console → Account → API Keys → Create new |
| `TWILIO_API_SECRET` | Twilio API Secret | Created with API Key (shown once, save it!) |
| `ELEVENLABS_API_KEY` | ElevenLabs API key | [ElevenLabs](https://elevenlabs.io) → Profile → API Keys |
| `STRIPE_SECRET_KEY` | Stripe secret key | [Stripe Dashboard](https://dashboard.stripe.com/apikeys) |
| `RESEND_API_KEY` | Resend API key | [Resend](https://resend.com) → API Keys |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | Google Cloud Console (see below) |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | Google Cloud Console (see below) |

### 3. Google Calendar Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable the **Google Calendar API**
4. Go to **APIs & Services → Credentials**
5. Create an **OAuth 2.0 Client ID** (Web application)
6. Add authorized redirect URI: `https://[your-project-id].supabase.co/functions/v1/google-calendar-auth`
7. Copy the Client ID and Client Secret to your secrets

### 4. Stripe Setup

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Get your **Secret Key** from Developers → API Keys
3. Create your pricing plans in Stripe (or use the admin panel to sync)
4. Set up webhooks:
   - Endpoint: `https://[your-project-id].supabase.co/functions/v1/stripe-webhook`
   - Events to listen for:
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_failed`

### 5. First Steps After Remix

After remixing this template, complete these steps to make it your own:

#### A. Customize SEO & Branding (index.html)
Edit `index.html` to update:
- `<title>` - Your brand name and tagline
- `<meta name="description">` - Your business description
- `og:title` and `og:description` - Social sharing text
- `og:image` and `twitter:image` - Your OG image URL (1200x630px recommended)

#### B. Set Up Your First Admin User
After your first user signs up, run this SQL in the Supabase SQL Editor:

```sql
-- Replace with your user's ID (found in auth.users table)
INSERT INTO public.system_roles (user_id, role)
VALUES ('your-user-uuid-here', 'super_admin');
```

#### C. Configure Your Brand in Admin Panel
1. Sign in as the admin user
2. Go to `/admin`
3. Navigate to the **Site Config** tab
4. Update:
   - Site Name
   - Tagline
   - Support/Sales emails
   - Upload your logo (light and dark versions)

#### D. Configure Pricing Plans
1. In the admin panel, go to the **Plans** tab
2. Create your pricing plans with Stripe price IDs
3. Click "Sync to Stripe" to create products in your Stripe account

### 6. Optional: Update Static Fallbacks

Edit `src/lib/site-config.ts` to change the fallback values used when the database is unavailable:

```typescript
export const siteConfig = {
  name: "Your Brand Name",
  tagline: "Your tagline here",
  supportEmail: "support@yourdomain.com",
  // ... more options
};
```

## 📁 Project Structure

```
src/
├── components/
│   ├── admin/          # Admin dashboard components
│   ├── dashboard/      # User dashboard components
│   ├── landing/        # Public landing page
│   ├── settings/       # Settings page components
│   └── ui/             # Reusable UI components (shadcn)
├── hooks/              # Custom React hooks
├── layouts/            # Page layouts
├── lib/                # Utilities and configurations
├── pages/              # Route pages
└── integrations/       # Supabase client & types

supabase/
├── functions/          # Edge functions
│   ├── buy-phone-number/
│   ├── create-vapi-assistant/
│   ├── google-calendar-auth/
│   ├── stripe-checkout/
│   ├── stripe-webhook/
│   ├── vapi-webhook/
│   └── ... more
└── migrations/         # Database migrations
```

## 🔧 Key Configuration Files

| File | Purpose |
|------|---------|
| `src/lib/site-config.ts` | Fallback brand name, tagline, contact info |
| `src/lib/voice-config.ts` | Available voices and languages |
| `src/lib/phone-countries.ts` | Supported countries for phone numbers |
| `tailwind.config.ts` | Theme colors and design tokens |
| `src/index.css` | CSS variables and global styles |
| `index.html` | SEO meta tags (customize for your brand) |

## 🔐 Security Features

- **Row-Level Security (RLS)** - All tables protected with organization-scoped policies
- **Role-Based Access Control** - Owner, Admin, Member, Viewer roles
- **Secure API Keys** - All secrets stored in Supabase Vault
- **CORS Protection** - Edge functions configured for your domain only

## 📊 Database Schema

Key tables:
- `organizations` - Multi-tenant business accounts
- `profiles` - User profiles linked to auth
- `user_roles` - Organization-level permissions
- `system_roles` - Platform-level admin access
- `subscriptions` - Stripe subscription data
- `plans` - Configurable pricing plans
- `call_logs` - Call history and transcripts
- `phone_numbers` - Provisioned Twilio numbers
- `appointments` - Booked appointments
- `organization_settings` - AI and business configuration
- `site_config` - Platform branding and settings

## 🎨 Customization

### Favicon
Replace the default favicon with your own:
1. Create your favicon (recommended: 32x32 PNG or ICO)
2. Replace `public/favicon.ico` with your file
3. Optionally add additional sizes in `index.html` meta tags

### Branding
1. Update brand settings in Admin Panel → Site Config
2. Upload logos (light for dark backgrounds, dark for light backgrounds)
3. Customize colors in `tailwind.config.ts` and `src/index.css`

### Pricing
Plans are fully dynamic from the database. Use the admin panel to:
- Create/edit plans
- Set pricing (monthly/annual)
- Configure features and limits
- Sync to Stripe

### Voices & Languages
Edit `src/lib/voice-config.ts` to customize available voices and languages.

## ❓ Troubleshooting

### Common Issues

**"No phone numbers available"**
- Ensure your Twilio account has funds
- Check that the country is enabled in your Twilio settings

**"Google Calendar not connecting"**
- Verify OAuth redirect URI matches exactly
- Check that Google Calendar API is enabled

**"Stripe webhooks failing"**
- Confirm webhook endpoint URL is correct
- Verify webhook secret is set in Supabase secrets

**"Voice test not working"**
- Ensure VAPI_PUBLIC_KEY is set (different from VAPI_API_KEY)
- Check browser permissions for microphone

## 📞 Support

- **Documentation**: Check the `/docs` folder for detailed guides
- **Issues**: Open an issue in this repository
- **Community**: Join the Lovable Discord

## 📄 License

This template is provided under the MIT License. See LICENSE for details.

---

Built with ❤️ using [Lovable](https://lovable.dev)