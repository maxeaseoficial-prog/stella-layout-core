import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { assertAdminFiscal } from "./spedy";

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
  .inputValidator((data) => z.object({ query: z.string().min(2) }).parse(data))
  .handler(async ({ data, context }) => {
    const { data: ncms, error } = await context.supabase
      .from('fiscal_ncm')
      .select('codigo, descricao')
      .or(`codigo.ilike.%${data.query}%,descricao.ilike.%${data.query}%`)
      .limit(20);

    if (error) throw new Error(error.message);
    return ncms;
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
    situacao: z.enum(['ativo', 'inativo']).optional()
  }).parse(data))
  .handler(async ({ data, context }) => {
    await assertAdminFiscal(context.supabase, context.userId);
    
    const { data: result, error } = await context.supabase
      .from('categorias_fiscais')
      .upsert({
        ...data,
        atualizado_em: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return result;
  });
