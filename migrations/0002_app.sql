-- InstantQuote app tables (per-user profiles + documents)
create table if not exists profiles (
  user_id text primary key,
  display_name text not null default '',
  currency text not null default 'USD',
  locale text not null default 'en-US',
  business text not null default '{}',
  payment text not null default '{}',
  is_premium boolean not null default false,
  trial_ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists documents (
  id text primary key,
  user_id text not null,
  payload text not null,
  status text not null default 'draft',
  total text not null default '0',
  currency text not null default 'USD',
  client_name text not null default '',
  doc_type text not null default 'estimate',
  doc_number text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists documents_user_id_idx on documents (user_id);
create index if not exists documents_user_updated_idx on documents (user_id, updated_at desc);

create table if not exists waitlist (
  email text primary key,
  user_id text,
  created_at timestamptz not null default now()
);
