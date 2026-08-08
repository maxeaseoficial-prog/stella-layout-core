import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAuthMiddleware } from "@/lib/auth-middleware";
import { assertAdminFiscal } from "@/lib/fiscal.server";

export const importarPlanilhaNCM = createServerFn({ method: "POST" })
  .middleware([supabaseAuthMiddleware])
  .inputValidator((data) => z.array(z.object({
    codigo: z.string(),
    ncm: z.string(),
    nome_amigavel: z.string().optional(),
    descricao_oficial: z.string().optional(),
    unidade_comercial: z.string().optional(),
    unidade_tributavel: z.string().optional(),
    vigencia: z.string().optional(),
    rec_pis: z.union([z.string(), z.number()]).optional(),
    rec_cofins: z.union([z.string(), z.number()]).optional(),
    natureza_receita: z.union([z.string(), z.number()]).optional(),
    tipo_contribuicao: z.string().optional(),
    situacao: z.string().optional(),
  })).parse(data))
  .handler(async ({ data, context }) => {
    await assertAdminFiscal(context.supabase, context.userId);
    
    // Buscar tenant do usuário
    const { data: userData } = await context.supabase
      .from('empresa_usuarios')
      .select('empresa_id')
      .eq('user_id', context.userId)
      .single();

    // Batch upsert no Supabase
    const { error } = await context.supabase
      .from('categorias_fiscais')
      .upsert(data.map(item => ({
        codigo: item.codigo,
        ncm: item.ncm, 
        nome_amigavel: item.nome_amigavel || item.descricao_oficial?.slice(0, 50) || 'NCM ' + item.ncm,
        descricao_oficial: item.descricao_oficial,
        unidade_comercial: item.unidade_comercial || 'UN',
        unidade_tributavel: item.unidade_tributavel || 'UN',
        vigencia: item.vigencia,
        rec_pis: String(item.rec_pis || '0'),
        rec_cofins: String(item.rec_cofins || '0'),
        natureza_receita: String(item.natureza_receita || '0'),
        tipo_contribuicao: item.tipo_contribuicao || 'Sem incidência',
        situacao: item.situacao || 'ativo',
        tenant_id: userData?.empresa_id,
        atualizado_em: new Date().toISOString()
      })), { onConflict: 'codigo,vigencia,tenant_id' });

    if (error) throw new Error(`Erro ao importar NCMs: ${error.message}`);
    return { success: true, count: data.length };
  });

export const searchNCM = createServerFn({ method: "GET" })
  .middleware([supabaseAuthMiddleware])
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

export const getCategoriaFiscalPorId = createServerFn({ method: "GET" })
  .middleware([supabaseAuthMiddleware])
  .inputValidator((data) => z.object({ id: z.string() }).parse(data))
  .handler(async ({ data, context }) => {
    const { data: cat, error } = await context.supabase
      .from('categorias_fiscais')
      .select('*')
      .eq('id', data.id)
      .single();

    if (error) return null;
    return cat;
  });

export const searchCategoriasFiscais = createServerFn({ method: "GET" })
  .middleware([supabaseAuthMiddleware])
  .inputValidator((data) => z.object({ query: z.string().min(1) }).parse(data))
  .handler(async ({ data, context }) => {
    const { data: cats, error } = await context.supabase
      .from('categorias_fiscais')
      .select('*')
      .or(`nome_amigavel.ilike.%${data.query}%,ncm.ilike.%${data.query}%,codigo.ilike.%${data.query}%`)
      .eq('situacao', 'ativo')
      .limit(20);

    if (error) throw new Error(error.message);
    return cats;
  });

export const getCategoriasFiscais = createServerFn({ method: "GET" })
  .middleware([supabaseAuthMiddleware])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from('categorias_fiscais')
      .select('*')
      .order('nome_amigavel');

    if (error) throw new Error(error.message);
    return data;
  });

export const salvarCategoriaFiscal = createServerFn({ method: "POST" })
  .middleware([supabaseAuthMiddleware])
  .inputValidator((data) => z.object({
    id: z.string().optional(),
    codigo: z.string().optional(),
    nome_amigavel: z.string().min(1),
    ncm: z.string().min(8),
    descricao_oficial: z.string().optional(),
    unidade_comercial: z.string().optional(),
    unidade_tributavel: z.string().optional(),
    vigencia: z.string().optional(),
    rec_pis: z.string().optional(),
    rec_cofins: z.string().optional(),
    natureza_receita: z.string().optional(),
    tipo_contribuicao: z.string().optional(),
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
