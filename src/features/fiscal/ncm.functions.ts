import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { assertAdminFiscal } from "@/lib/fiscal.server";

export const importarPlanilhaNCM = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.array(z.object({
    codigo: z.string(),
    descricao: z.string(),
    data_inicio: z.string().optional(),
    data_fim: z.string().optional(),
    ato_legal: z.string().optional(),
    ano: z.number().optional(),
  })).parse(data))
  .handler(async ({ data, context }) => {
    await assertAdminFiscal(context.supabase, context.userId);
    
    // Batch upsert no Supabase
    const { error } = await context.supabase
      .from('fiscal_ncm')
      .upsert(data.map(item => ({
        codigo: item.codigo.replace(/[^0-9]/g, ''), // Normalizar NCM (apenas números)
        descricao: item.descricao,
        data_inicio: item.data_inicio === 'nan' ? null : item.data_inicio,
        data_fim: item.data_fim === 'nan' ? null : item.data_fim,
        ato_legal: item.ato_legal,
        ano: item.ano,
        situacao: 'ativo'
      })), { onConflict: 'codigo' });

    if (error) throw new Error(`Erro ao importar NCMs: ${error.message}`);
    return { success: true, count: data.length };
  });

export const searchNCM = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ query: z.string().min(1) }).parse(data))
  .handler(async ({ data, context }) => {
    // Normalizar a busca: se for número, tirar pontuação
    const cleanQuery = data.query.replace(/[^0-9a-zA-Z]/g, '');
    
    const { data: ncms, error } = await context.supabase
      .from('fiscal_ncm')
      .select('codigo, descricao')
      .or(`codigo.ilike.%${cleanQuery}%,descricao.ilike.%${cleanQuery}%`)
      .limit(20);

    if (error) throw new Error(error.message);
    return ncms;
  });

export const searchCategoriasFiscais = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ query: z.string().min(1) }).parse(data))
  .handler(async ({ data, context }) => {
    const { data: cats, error } = await context.supabase
      .from('categorias_fiscais')
      .select('*')
      .or(`nome_amigavel.ilike.%${data.query}%,ncm.ilike.%${data.query}%`)
      .eq('situacao', 'ativo')
      .limit(20);

    if (error) throw new Error(error.message);
    return cats;
  });

export const getCategoriasFiscais = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from('categorias_fiscais')
      .select('*')
      .order('nome_amigavel');

    if (error) throw new Error(error.message);
    return data;
  });

export const salvarCategoriaFiscal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({
    id: z.string().optional(),
    nome_amigavel: z.string().min(1),
    ncm: z.string().min(8),
    descricao_oficial: z.string().optional(),
    unidade_comercial: z.string().optional(),
    unidade_tributavel: z.string().optional(),
    situacao: z.enum(['ativo', 'inativo']).optional()
  }).parse(data))
  .handler(async ({ data, context }) => {
    await assertAdminFiscal(context.supabase, context.userId);
    
    // Buscar tenant do usuário
    const { data: userData } = await context.supabase
      .from('empresa_usuarios')
      .select('empresa_id')
      .eq('user_id', context.userId)
      .single();

    const { data: result, error } = await context.supabase
      .from('categorias_fiscais')
      .upsert({
        ...data,
        tenant_id: userData?.empresa_id,
        atualizado_em: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return result;
  });
