-- Tabela oficial de NCMs
create table public.fiscal_ncm (
    id uuid primary key default gen_random_uuid(),
    codigo text not null unique,
    descricao text not null,
    data_inicio date,
    data_fim date,
    ato_legal text,
    ano integer,
    situacao text default 'ativo',
    criado_em timestamptz default now()
);

grant select on public.fiscal_ncm to authenticated;
grant all on public.fiscal_ncm to service_role;
alter table public.fiscal_ncm enable row level security;
create policy "Qualquer um logado pode ver NCMs" on public.fiscal_ncm for select to authenticated using (true);

-- Categorias Fiscais (mapeamento amigável)
create table public.categorias_fiscais (
    id uuid primary key default gen_random_uuid(),
    nome_amigavel text not null,
    ncm text not null,
    descricao_oficial text,
    situacao text default 'ativo',
    criado_em timestamptz default now(),
    atualizado_em timestamptz default now()
);

grant select, insert, update, delete on public.categorias_fiscais to authenticated;
grant all on public.categorias_fiscais to service_role;
alter table public.categorias_fiscais enable row level security;
create policy "Qualquer um logado pode ver categorias fiscais" on public.categorias_fiscais for select to authenticated using (true);
create policy "Admins podem gerenciar categorias fiscais" on public.categorias_fiscais for all to authenticated using (public.has_role(auth.uid(), 'administrador'));

-- Migration para atualizar a tabela de produtos
alter table public.produtos add column if not exists categoria_fiscal_id uuid references public.categorias_fiscais(id);
alter table public.produtos add column if not exists ncm_oficial text;
alter table public.produtos add column if not exists descricao_fiscal text;
