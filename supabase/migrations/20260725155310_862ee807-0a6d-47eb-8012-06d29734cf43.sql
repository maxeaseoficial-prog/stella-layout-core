
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
    execute format('alter table public.%I alter column id type text using id::text', t);
  end loop;
end$$;
