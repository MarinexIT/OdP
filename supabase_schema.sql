-- Tabela Zamówień (Orders)
create table public.orders (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  stripe_session_id text, -- ID sesji płatności Stripe
  total_amount numeric,   -- Kwota (np. 35.00)
  currency text default 'EUR',
  status text default 'pending', -- pending, paid, shipped, cancelled
  customer_email text,
  customer_details jsonb, -- adres itp. ze Stripe
  items jsonb not null    -- kopia koszyka (tablica produktów)
);

-- Tabela Zapisanych Projektów (Dla zalogowanych użytkowników)
create table public.saved_projects (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users not null, -- powiązanie z użytkownikiem Supabase Auth
  name text, -- nazwa projektu nadana przez usera (np. "Smycz dla Burka")
  config jsonb not null, -- konfiguracja {length, colors, ...}
  preview_image text -- dataURL lub link do zdjęcia
);

-- Włącz Row Level Security (Bezpieczeństwo)
alter table public.orders enable row level security;
alter table public.saved_projects enable row level security;

-- Polityki (Kto co może widzieć)
-- 1. Każdy może tworzyć zamówienie (publiczny insert dla anonimowych userów, backend/webhook to obsłuży)
create policy "Enable insert for everyone" on public.orders for insert with check (true);

-- 2. Zapisane projekty widzi tylko właściciel
create policy "Users can view own saved projects" on public.saved_projects for select using (auth.uid() = user_id);
create policy "Users can insert own saved projects" on public.saved_projects for insert with check (auth.uid() = user_id);
create policy "Users can delete own saved projects" on public.saved_projects for delete using (auth.uid() = user_id);

