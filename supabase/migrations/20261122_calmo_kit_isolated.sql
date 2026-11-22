-- ============================================================================
-- CALMO KIT (www.calmokit.com) — ISOLATED DATABASE SCHEMA
-- ============================================================================
-- IMPORTANT:
-- Designed to coexist safely inside a shared Supabase project (Cuyo Marketing).
-- - All objects are strictly prefixed with `calmo_kit_`.
-- - ZERO references to `auth.users`, login sessions, or Cuyo Marketing tables.
-- - Row Level Security (RLS) is enabled & forced: `anon` cannot SELECT/UPDATE/DELETE
--   any rows, preventing cross-project or customer data exposure.
-- ============================================================================

create table if not exists public.calmo_kit_orders (
  id bigint generated always as identity primary key,
  order_ref text not null unique,
  source_app text not null default 'calmo-kit',
  stripe_session_id text unique,
  status text not null default 'pending' check (status in ('pending', 'paid', 'fulfilled', 'cancelled')),
  currency text not null default 'USD',
  subtotal_cents integer not null check (subtotal_cents >= 0),
  shipping_cents integer not null default 0 check (shipping_cents >= 0),
  total_cents integer not null check (total_cents >= 0),
  customer_name text,
  customer_email text not null,
  shipping_address jsonb not null default '{}'::jsonb,
  items jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_calmo_kit_orders_created_at
  on public.calmo_kit_orders (created_at desc);

create index if not exists idx_calmo_kit_orders_email
  on public.calmo_kit_orders (customer_email);

alter table public.calmo_kit_orders enable row level security;
alter table public.calmo_kit_orders force row level security;

-- Only Edge Functions using the service_role key read/write calmo_kit_orders.
-- No public/anon SELECT, INSERT, UPDATE, or DELETE policies are granted.

create table if not exists public.calmo_kit_leads (
  id bigint generated always as identity primary key,
  source_app text not null default 'calmo-kit',
  lead_type text not null default 'newsletter' check (lead_type in ('newsletter', 'contact', 'custom-kit')),
  name text,
  email text not null,
  lang text not null default 'en',
  message text,
  created_at timestamptz not null default now()
);

create index if not exists idx_calmo_kit_leads_created_at
  on public.calmo_kit_leads (created_at desc);

create index if not exists idx_calmo_kit_leads_email
  on public.calmo_kit_leads (email);

alter table public.calmo_kit_leads enable row level security;
alter table public.calmo_kit_leads force row level security;

-- Strictly isolated: all writes go through `calmo-submit-lead` Edge Function.
