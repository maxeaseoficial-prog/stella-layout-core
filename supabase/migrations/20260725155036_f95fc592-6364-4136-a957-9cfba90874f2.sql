
-- =========================================================================
-- 1. Enum de papéis
-- =========================================================================
create type public.app_role as enum ('administrador', 'operador_matriz');

-- =========================================================================
-- 2. Empresas (tenants)
-- =========================================================================
create table public.empresas (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  criado_em timestamptz not null default now()
);

grant select on public.empresas to authenticated;
grant all on public.empresas to service_role;
alter table public.empresas enable row level security;

-- Semear a empresa Stella com id fixo (usado como default nas outras tabelas).
insert into public.empresas (id, nome)
values ('11111111-1111-1111-1111-111111111111', 'Stella Espaço dos Uniformes');

-- =========================================================================
-- 3. Vínculo usuário ↔ empresa ↔ papel
-- =========================================================================
create table public.empresa_usuarios (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.empresas(id) on delete cascade,
  user_id uuid not null,
  papel public.app_role not null,
  criado_em timestamptz not null default now(),
  unique (empresa_id, user_id)
);

grant select on public.empresa_usuarios to authenticated;
grant all on public.empresa_usuarios to service_role;
alter table public.empresa_usuarios enable row level security;

-- =========================================================================
-- 4. Funções security definer (evitam recursão em RLS)
-- =========================================================================
create or replace function public.empresa_do_usuario(_user_id uuid)
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select empresa_id
  from public.empresa_usuarios
  where user_id = _user_id
  limit 1
$$;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.empresa_usuarios
    where user_id = _user_id and papel = _role
  )
$$;

create or replace function public.papel_do_usuario(_user_id uuid)
returns public.app_role
language sql
stable
security definer
set search_path = public
as $$
  select papel from public.empresa_usuarios
  where user_id = _user_id
  limit 1
$$;

-- Policies em empresas e empresa_usuarios (leitura só do próprio vínculo)
create policy "membros veem sua empresa"
  on public.empresas for select to authenticated
  using (id = public.empresa_do_usuario(auth.uid()));

create policy "membros veem vinculos da propria empresa"
  on public.empresa_usuarios for select to authenticated
  using (empresa_id = public.empresa_do_usuario(auth.uid()));

-- =========================================================================
-- 5. Trigger utilitário updated_at
-- =========================================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- =========================================================================
-- 6. Tabelas de dados (mesmo formato: id / tenant_id / data / timestamps)
-- =========================================================================
-- Helper macro através de execução dinâmica: criamos cada tabela explicitamente
-- para clareza e para permitir GRANTs individuais.

-- clientes
create table public.clientes (
  id uuid primary key,
  tenant_id uuid not null references public.empresas(id) on delete cascade,
  data jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.clientes to authenticated;
grant all on public.clientes to service_role;
alter table public.clientes enable row level security;
create index on public.clientes (tenant_id);
create trigger clientes_updated before update on public.clientes
  for each row execute function public.set_updated_at();

-- produtos
create table public.produtos (
  id uuid primary key,
  tenant_id uuid not null references public.empresas(id) on delete cascade,
  data jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.produtos to authenticated;
grant all on public.produtos to service_role;
alter table public.produtos enable row level security;
create index on public.produtos (tenant_id);
create trigger produtos_updated before update on public.produtos
  for each row execute function public.set_updated_at();

-- adicionais
create table public.adicionais (
  id uuid primary key,
  tenant_id uuid not null references public.empresas(id) on delete cascade,
  data jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.adicionais to authenticated;
grant all on public.adicionais to service_role;
alter table public.adicionais enable row level security;
create index on public.adicionais (tenant_id);
create trigger adicionais_updated before update on public.adicionais
  for each row execute function public.set_updated_at();

-- categorias
create table public.categorias (
  id uuid primary key,
  tenant_id uuid not null references public.empresas(id) on delete cascade,
  data jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.categorias to authenticated;
grant all on public.categorias to service_role;
alter table public.categorias enable row level security;
create index on public.categorias (tenant_id);
create trigger categorias_updated before update on public.categorias
  for each row execute function public.set_updated_at();

-- fornecedores
create table public.fornecedores (
  id uuid primary key,
  tenant_id uuid not null references public.empresas(id) on delete cascade,
  data jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.fornecedores to authenticated;
grant all on public.fornecedores to service_role;
alter table public.fornecedores enable row level security;
create index on public.fornecedores (tenant_id);
create trigger fornecedores_updated before update on public.fornecedores
  for each row execute function public.set_updated_at();

-- itens_estoque
create table public.itens_estoque (
  id uuid primary key,
  tenant_id uuid not null references public.empresas(id) on delete cascade,
  data jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.itens_estoque to authenticated;
grant all on public.itens_estoque to service_role;
alter table public.itens_estoque enable row level security;
create index on public.itens_estoque (tenant_id);
create trigger itens_estoque_updated before update on public.itens_estoque
  for each row execute function public.set_updated_at();

-- movimentacoes_estoque
create table public.movimentacoes_estoque (
  id uuid primary key,
  tenant_id uuid not null references public.empresas(id) on delete cascade,
  data jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.movimentacoes_estoque to authenticated;
grant all on public.movimentacoes_estoque to service_role;
alter table public.movimentacoes_estoque enable row level security;
create index on public.movimentacoes_estoque (tenant_id);
create trigger movimentacoes_estoque_updated before update on public.movimentacoes_estoque
  for each row execute function public.set_updated_at();

-- arquivos (matrizes e logos)
create table public.arquivos (
  id uuid primary key,
  tenant_id uuid not null references public.empresas(id) on delete cascade,
  data jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.arquivos to authenticated;
grant all on public.arquivos to service_role;
alter table public.arquivos enable row level security;
create index on public.arquivos (tenant_id);
create trigger arquivos_updated before update on public.arquivos
  for each row execute function public.set_updated_at();

-- pedidos
create table public.pedidos (
  id uuid primary key,
  tenant_id uuid not null references public.empresas(id) on delete cascade,
  data jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.pedidos to authenticated;
grant all on public.pedidos to service_role;
alter table public.pedidos enable row level security;
create index on public.pedidos (tenant_id);
create trigger pedidos_updated before update on public.pedidos
  for each row execute function public.set_updated_at();

-- caixa_movimentacoes
create table public.caixa_movimentacoes (
  id uuid primary key,
  tenant_id uuid not null references public.empresas(id) on delete cascade,
  data jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.caixa_movimentacoes to authenticated;
grant all on public.caixa_movimentacoes to service_role;
alter table public.caixa_movimentacoes enable row level security;
create index on public.caixa_movimentacoes (tenant_id);
create trigger caixa_movimentacoes_updated before update on public.caixa_movimentacoes
  for each row execute function public.set_updated_at();

-- caixa_fechamentos
create table public.caixa_fechamentos (
  id uuid primary key,
  tenant_id uuid not null references public.empresas(id) on delete cascade,
  data jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.caixa_fechamentos to authenticated;
grant all on public.caixa_fechamentos to service_role;
alter table public.caixa_fechamentos enable row level security;
create index on public.caixa_fechamentos (tenant_id);
create trigger caixa_fechamentos_updated before update on public.caixa_fechamentos
  for each row execute function public.set_updated_at();

-- configuracoes (1 linha por empresa: id = tenant_id)
create table public.configuracoes (
  id uuid primary key,
  tenant_id uuid not null references public.empresas(id) on delete cascade,
  data jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.configuracoes to authenticated;
grant all on public.configuracoes to service_role;
alter table public.configuracoes enable row level security;
create index on public.configuracoes (tenant_id);
create trigger configuracoes_updated before update on public.configuracoes
  for each row execute function public.set_updated_at();

-- =========================================================================
-- 7. Policies uniformes: qualquer membro autenticado da mesma empresa
--    pode ler e escrever qualquer linha do tenant.
-- =========================================================================
do $$
declare
  t text;
  tables text[] := array[
    'clientes','produtos','adicionais','categorias','fornecedores',
    'itens_estoque','movimentacoes_estoque','arquivos','pedidos',
    'caixa_movimentacoes','caixa_fechamentos','configuracoes'
  ];
begin
  foreach t in array tables loop
    execute format($f$
      create policy "tenant_select_%1$s" on public.%1$s
        for select to authenticated
        using (tenant_id = public.empresa_do_usuario(auth.uid()));
      create policy "tenant_insert_%1$s" on public.%1$s
        for insert to authenticated
        with check (tenant_id = public.empresa_do_usuario(auth.uid()));
      create policy "tenant_update_%1$s" on public.%1$s
        for update to authenticated
        using (tenant_id = public.empresa_do_usuario(auth.uid()))
        with check (tenant_id = public.empresa_do_usuario(auth.uid()));
      create policy "tenant_delete_%1$s" on public.%1$s
        for delete to authenticated
        using (tenant_id = public.empresa_do_usuario(auth.uid()));
    $f$, t);
  end loop;
end$$;

-- =========================================================================
-- 8. Realtime em todas as tabelas de dados
-- =========================================================================
alter publication supabase_realtime add table
  public.clientes,
  public.produtos,
  public.adicionais,
  public.categorias,
  public.fornecedores,
  public.itens_estoque,
  public.movimentacoes_estoque,
  public.arquivos,
  public.pedidos,
  public.caixa_movimentacoes,
  public.caixa_fechamentos,
  public.configuracoes,
  public.empresa_usuarios;

alter table public.clientes replica identity full;
alter table public.produtos replica identity full;
alter table public.adicionais replica identity full;
alter table public.categorias replica identity full;
alter table public.fornecedores replica identity full;
alter table public.itens_estoque replica identity full;
alter table public.movimentacoes_estoque replica identity full;
alter table public.arquivos replica identity full;
alter table public.pedidos replica identity full;
alter table public.caixa_movimentacoes replica identity full;
alter table public.caixa_fechamentos replica identity full;
alter table public.configuracoes replica identity full;
alter table public.empresa_usuarios replica identity full;
