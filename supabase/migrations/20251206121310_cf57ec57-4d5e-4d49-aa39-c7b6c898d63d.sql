-- Create enum for user roles
create type public.app_role as enum ('owner', 'admin', 'manager', 'viewer');

-- Create enum for business types
create type public.business_type as enum ('dental_clinic', 'medical_practice', 'salon', 'restaurant', 'other');

-- Create enum for call outcomes
create type public.call_outcome as enum ('appointment_booked', 'info_provided', 'transferred', 'voicemail', 'missed', 'completed');

-- Create enum for call directions
create type public.call_direction as enum ('inbound', 'outbound');

-- Create enum for subscription plans
create type public.subscription_plan as enum ('starter', 'growth', 'enterprise');

-- Create enum for subscription status
create type public.subscription_status as enum ('active', 'canceled', 'past_due', 'trialing');

-- Organizations (tenants) table
create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique,
  business_type public.business_type default 'other',
  address jsonb default '{}',
  phone text,
  website text,
  timezone text default 'Europe/Amsterdam',
  logo_url text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Organization settings table
create table public.organization_settings (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete cascade not null unique,
  business_hours jsonb default '{}',
  services jsonb default '[]',
  ai_config jsonb default '{"voice_id": null, "personality": "professional", "greeting": null, "language": "en", "additional_languages": []}',
  vapi_assistant_id text,
  vapi_api_key text,
  transfer_number text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Profiles table (linked to auth.users)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  organization_id uuid references public.organizations(id) on delete set null,
  full_name text,
  email text,
  avatar_url text,
  onboarding_completed boolean default false,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- User roles table (separate for security)
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  organization_id uuid references public.organizations(id) on delete cascade not null,
  role public.app_role not null default 'viewer',
  created_at timestamptz default now() not null,
  unique (user_id, organization_id)
);

-- Phone numbers table
create table public.phone_numbers (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete cascade not null,
  phone_number text not null,
  vapi_phone_id text,
  friendly_name text,
  is_active boolean default true,
  is_forwarding boolean default false,
  forwarding_number text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Call logs table
create table public.call_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete cascade not null,
  phone_number_id uuid references public.phone_numbers(id) on delete set null,
  vapi_call_id text,
  caller_number text,
  direction public.call_direction default 'inbound',
  started_at timestamptz,
  ended_at timestamptz,
  duration_seconds integer default 0,
  transcript text,
  recording_url text,
  outcome public.call_outcome,
  summary text,
  metadata jsonb default '{}',
  created_at timestamptz default now() not null
);

-- Subscriptions table
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete cascade not null unique,
  stripe_customer_id text,
  stripe_subscription_id text,
  plan public.subscription_plan default 'starter',
  status public.subscription_status default 'trialing',
  current_period_start timestamptz,
  current_period_end timestamptz,
  minutes_included integer default 100,
  minutes_used integer default 0,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Create indexes for performance
create index idx_profiles_organization on public.profiles(organization_id);
create index idx_user_roles_user on public.user_roles(user_id);
create index idx_user_roles_org on public.user_roles(organization_id);
create index idx_phone_numbers_org on public.phone_numbers(organization_id);
create index idx_call_logs_org on public.call_logs(organization_id);
create index idx_call_logs_phone on public.call_logs(phone_number_id);
create index idx_call_logs_started on public.call_logs(started_at desc);
create index idx_subscriptions_org on public.subscriptions(organization_id);

-- Create updated_at trigger function
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Apply updated_at triggers
create trigger set_updated_at before update on public.organizations
  for each row execute function public.handle_updated_at();

create trigger set_updated_at before update on public.organization_settings
  for each row execute function public.handle_updated_at();

create trigger set_updated_at before update on public.profiles
  for each row execute function public.handle_updated_at();

create trigger set_updated_at before update on public.phone_numbers
  for each row execute function public.handle_updated_at();

create trigger set_updated_at before update on public.subscriptions
  for each row execute function public.handle_updated_at();

-- Create function to get user's organization_id (avoids RLS recursion)
create or replace function public.get_user_organization_id(_user_id uuid)
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select organization_id from public.profiles where id = _user_id
$$;

-- Create function to check user role
create or replace function public.has_role(_user_id uuid, _organization_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and organization_id = _organization_id
      and role = _role
  )
$$;

-- Create function to check if user has any role in org
create or replace function public.is_org_member(_user_id uuid, _organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and organization_id = _organization_id
  )
$$;

-- Create function to check if user is org admin or owner
create or replace function public.is_org_admin(_user_id uuid, _organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and organization_id = _organization_id
      and role in ('owner', 'admin')
  )
$$;

-- Create handle_new_user function
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.email
  );
  return new;
end;
$$;

-- Trigger to create profile on signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Enable RLS on all tables
alter table public.organizations enable row level security;
alter table public.organization_settings enable row level security;
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.phone_numbers enable row level security;
alter table public.call_logs enable row level security;
alter table public.subscriptions enable row level security;

-- RLS Policies for profiles
create policy "Users can view own profile"
  on public.profiles for select
  using (id = auth.uid());

create policy "Users can update own profile"
  on public.profiles for update
  using (id = auth.uid());

-- RLS Policies for organizations
create policy "Users can view own organization"
  on public.organizations for select
  using (public.is_org_member(auth.uid(), id));

create policy "Users can insert organization"
  on public.organizations for insert
  with check (true);

create policy "Admins can update organization"
  on public.organizations for update
  using (public.is_org_admin(auth.uid(), id));

-- RLS Policies for organization_settings
create policy "Members can view org settings"
  on public.organization_settings for select
  using (public.is_org_member(auth.uid(), organization_id));

create policy "Users can insert org settings"
  on public.organization_settings for insert
  with check (public.is_org_member(auth.uid(), organization_id));

create policy "Admins can update org settings"
  on public.organization_settings for update
  using (public.is_org_admin(auth.uid(), organization_id));

-- RLS Policies for user_roles
create policy "Users can view own roles"
  on public.user_roles for select
  using (user_id = auth.uid());

create policy "Users can insert own role"
  on public.user_roles for insert
  with check (user_id = auth.uid());

create policy "Admins can manage roles"
  on public.user_roles for all
  using (public.is_org_admin(auth.uid(), organization_id));

-- RLS Policies for phone_numbers
create policy "Members can view phone numbers"
  on public.phone_numbers for select
  using (public.is_org_member(auth.uid(), organization_id));

create policy "Admins can manage phone numbers"
  on public.phone_numbers for all
  using (public.is_org_admin(auth.uid(), organization_id));

-- RLS Policies for call_logs
create policy "Members can view call logs"
  on public.call_logs for select
  using (public.is_org_member(auth.uid(), organization_id));

create policy "Service can insert call logs"
  on public.call_logs for insert
  with check (true);

-- RLS Policies for subscriptions
create policy "Members can view subscription"
  on public.subscriptions for select
  using (public.is_org_member(auth.uid(), organization_id));

create policy "Admins can manage subscription"
  on public.subscriptions for all
  using (public.is_org_admin(auth.uid(), organization_id));