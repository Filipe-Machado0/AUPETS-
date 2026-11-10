-- ===================================================
-- SCHEMA SUPABASE: AUPETS BANHO & TOSA (LUCAS DO RIO VERDE - MT)
-- ===================================================

-- 1. Tabela de Agendamentos
create table if not exists public.appointments (
  id text primary key,
  client_name text not null,
  client_phone text not null,
  pet_name text not null,
  pet_breed text default 'SRD / Vira-lata',
  pet_size text not null,
  service text not null,
  date date not null,
  time text not null,
  status text not null default 'confirmado',
  notes text default '',
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- 2. Tabela de Horários Bloqueados pela Administração
create table if not exists public.blocked_slots (
  id text primary key,
  date date not null,
  time text not null,
  reason text default 'Horário bloqueado',
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- 3. Habilitar Row Level Security (RLS)
alter table public.appointments enable row level security;
alter table public.blocked_slots enable row level security;

-- 4. Políticas RLS Públicas para o App e Painel
drop policy if exists "Permitir leitura publica agendamentos" on public.appointments;
create policy "Permitir leitura publica agendamentos"
  on public.appointments for select
  using (true);

drop policy if exists "Permitir criacao publica agendamentos" on public.appointments;
create policy "Permitir criacao publica agendamentos"
  on public.appointments for insert
  with check (true);

drop policy if exists "Permitir atualizacao publica agendamentos" on public.appointments;
create policy "Permitir atualizacao publica agendamentos"
  on public.appointments for update
  using (true);

drop policy if exists "Permitir delecao publica agendamentos" on public.appointments;
create policy "Permitir delecao publica agendamentos"
  on public.appointments for delete
  using (true);

-- Políticas para horários bloqueados
drop policy if exists "Permitir leitura publica bloqueios" on public.blocked_slots;
create policy "Permitir leitura publica bloqueios"
  on public.blocked_slots for select
  using (true);

drop policy if exists "Permitir criacao publica bloqueios" on public.blocked_slots;
create policy "Permitir criacao publica bloqueios"
  on public.blocked_slots for insert
  with check (true);

drop policy if exists "Permitir atualizacao publica bloqueios" on public.blocked_slots;
create policy "Permitir atualizacao publica bloqueios"
  on public.blocked_slots for update
  using (true);

drop policy if exists "Permitir delecao publica bloqueios" on public.blocked_slots;
create policy "Permitir delecao publica bloqueios"
  on public.blocked_slots for delete
  using (true);

-- 5. Habilitar sincronização em tempo real (Supabase Realtime)
alter publication supabase_realtime add table public.appointments;
alter publication supabase_realtime add table public.blocked_slots;
