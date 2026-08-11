import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAuthMiddleware } from "@/lib/auth-middleware";
import { assertAdminFiscal } from "@/lib/fiscal.server";
import { CATEGORIAS_FISCAIS_MASTER } from "./data/categorias-fiscais-master";
import { CategoriaFiscal } from "./types";

export const seedCategoriasFiscais = createServerFn({ method: "POST" })
  .middleware([supabaseAuthMiddleware])
  .handler(async ({ context }) => {
    await assertAdminFiscal(context.supabase, context.userId);
    
    const { data: userData } = await context.supabase
      .from('empresa_usuarios')
      .select('empresa_id')
      .eq('user_id', context.userId)
      .single();

    if (!userData?.empresa_id) throw new Error("Tenant não encontrado.");
    const tenantId = userData.empresa_id;

    // Relatório
    const relatorio = {
      esperados: CATEGORIAS_FISCAIS_MASTER.length,
      processados: 0,
      inseridos: 0,
      atualizados: 0,
      corretos: 0,
      servicosSemNcm: 0,
      comObservacao: 0,
      duplicidades: 0,
      erros: 0
    };

    // Buscar categorias atuais para evitar duplicação e preservar IDs
    const { data: atuais } = await context.supabase
      .from('categorias_fiscais')
      .select('id, codigo')
      .eq('tenant_id', tenantId);

    const mapaAtuais = new Map(atuais?.map(a => [a.codigo, a.id]) || []);

    const upserts: any[] = [];
    const codigosVistos = new Set();

    for (const master of CATEGORIAS_FISCAIS_MASTER) {
      if (codigosVistos.has(master.codigo)) {
        relatorio.duplicidades++;
        continue;
      }
      codigosVistos.add(master.codigo);
      relatorio.processados++;

      if (master.tipo === 'servico') relatorio.servicosSemNcm++;
      if (master.observacao) relatorio.comObservacao++;

      const idExistente = mapaAtuais.get(master.codigo);
      
      const payload: any = {
        codigo: master.codigo,
        nome_amigavel: master.nome_amigavel,
        ncm: master.ncm,
        vigencia: master.vigencia,
        situacao: master.ativo ? 'ativo' : 'inativo',
        tenant_id: tenantId,
        atualizado_em: new Date().toISOString()
      };

      // Campos estendidos se a tabela suportar ou via meta
      // Por enquanto usamos o que temos na migration anterior
      if (idExistente) {
        payload.id = idExistente;
        relatorio.atualizados++;
      } else {
        relatorio.inseridos++;
      }

      upserts.push(payload);
    }

    // Upsert em chunks para segurança
    const chunkSize = 50;
    for (let i = 0; i < upserts.length; i += chunkSize) {
      const chunk = upserts.slice(i, i + chunkSize);
      const { error } = await context.supabase
        .from('categorias_fiscais')
        .upsert(chunk);
      
      if (error) {
        relatorio.erros++;
        console.error("Erro no chunk:", error);
      }
    }

    return { success: true, relatorio };
  });

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
    
    const { data: userData } = await context.supabase
      .from('empresa_usuarios')
      .select('empresa_id')
      .eq('user_id', context.userId)
      .single();

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
      })), { onConflict: 'codigo,tenant_id' }); // Simplificado para codigo+tenant

    if (error) throw new Error(`Erro ao importar NCMs: ${error.message}`);
    return { success: true, count: data.length };
  });

export const searchNCM = createServerFn({ method: "GET" })
  .middleware([supabaseAuthMiddleware])
  .inputValidator((data) => z.object({ query: z.string().min(1) }).parse(data))
  .handler(async ({ data, context }) => {
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
      .order('codigo', { ascending: true }); // Ordenar por código conforme solicitado

    if (error) throw new Error(error.message);
    return data;
  });

export const salvarCategoriaFiscal = createServerFn({ method: "POST" })
  .middleware([supabaseAuthMiddleware])
  .inputValidator((data) => z.object({
    id: z.string().optional(),
    codigo: z.string().optional(),
    nome_amigavel: z.string().min(1),
    ncm: z.string().nullable(),
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
    
    const { data: userData } = await context.supabase
      .from('empresa_usuarios')
      .select('empresa_id')
      .eq('user_id', context.userId)
      .single();

    const { data: result, error } = await context.supabase
      .from('categorias_fiscais')
      .upsert({
        ...data,
        ncm: data.ncm || '', // Garantir string para evitar erro TS/DB
        tenant_id: userData?.empresa_id,
        atualizado_em: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return result;
  });

export const excluirCategoriaFiscal = createServerFn({ method: "POST" })
  .middleware([supabaseAuthMiddleware])
  .inputValidator((data) => z.object({ id: z.string() }).parse(data))
  .handler(async ({ data, context }) => {
    await assertAdminFiscal(context.supabase, context.userId);
    
    const { data: userData } = await context.supabase
      .from('empresa_usuarios')
      .select('empresa_id')
      .eq('user_id', context.userId)
      .single();

    if (!userData?.empresa_id) throw new Error("Tenant não encontrado.");

    const { error } = await context.supabase
      .from('categorias_fiscais')
      .delete()
      .eq('id', data.id)
      .eq('tenant_id', userData.empresa_id);

    if (error) throw new Error(error.message);
    return { success: true };
  });
