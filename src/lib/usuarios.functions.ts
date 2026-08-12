import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

import { z } from "zod";

export const criarUsuarioSistema = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])

  .inputValidator((d) =>
    z
      .object({
        nome: z.string().min(2),
        usuario: z.string().min(3),
        email: z.string().email(),
        senha: z.string().min(6),
        papel: z.enum(["administrador", "operador_matriz", "caixa"]),
        permissoesAbas: z.array(z.string()),
        status: z.enum(["ativo", "inativo"]),
      })
      .parse(d)
  )
  .handler(async ({ data, context }) => {
    const { 
      validarAdmin,

      criarUsuarioNoAuth, 
      vincularUsuarioEmpresa, 
      verificarDuplicidade 
    } = await import("./usuarios.server");

    // Validar se o solicitante é administrador
    if (!(await validarAdmin(context.supabase, context.userId))) {
      return { ok: false, erro: "Acesso negado: Somente administradores podem criar usuários." };
    }


    // 1. Verificar duplicidade (username e email) no Auth
    const duplicado = await verificarDuplicidade(data.usuario, data.email);
    if (duplicado.existe) {
      return { ok: false, erro: duplicado.erro };
    }

    // 2. Criar no Supabase Auth via Admin API
    const authResult = await criarUsuarioNoAuth({
      email: data.email,
      password: data.senha,
      metadata: {
        nome: data.nome,
        usuario: data.usuario,
        papel: data.papel,
      },
    });

    if (!authResult.ok) {
      return { ok: false, erro: authResult.erro };
    }

    const userId = authResult.userId!;

    // 3. Vincular em empresa_usuarios
    const vinculo = await vincularUsuarioEmpresa({
      userId,
      papel: data.papel,
      permissoes: data.permissoesAbas,
    });

    if (!vinculo.ok) {
      // Idealmente aqui faríamos rollback do Auth, mas como o foco é sync, vamos reportar o erro
      return { ok: false, erro: "Usuário criado no Auth, mas falha crítica ao vincular à empresa: " + vinculo.erro };
    }


    return { ok: true, userId };
  });

export const resolverEmailDeLogin = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ identificador: z.string() }).parse(d))
  .handler(async ({ data }) => {
    const { buscarEmailPorUsername } = await import("./usuarios.server");
    
    if (data.identificador.includes("@")) {
      return { email: data.identificador.toLowerCase() };
    }

    const email = await buscarEmailPorUsername(data.identificador);
    // Retorna null se não encontrar, conforme solicitado (regra 9)
    return { email: email || null };
  });


export const redefinirSenhaSistema = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])

  .inputValidator((d) => 
    z.object({ 
      email: z.string().email(), 
      novaSenha: z.string().min(6) 
    }).parse(d)
  )
  .handler(async ({ data, context }) => {
    const { redefinirSenhaAuth, validarAdmin } = await import("./usuarios.server");
    
    // Validar se o solicitante é administrador
    if (!(await validarAdmin(context.supabase, context.userId))) {
      return { ok: false, erro: "Acesso negado: Somente administradores podem redefinir senhas." };
    }

    return await redefinirSenhaAuth(data.email, data.novaSenha);
  });

export const sincronizarUsuarioLocal = createServerFn({ method: "POST" })
  .inputValidator((d) => 
    z.object({
      email: z.string().email(),
      nome: z.string(),
      usuario: z.string(),
      papel: z.enum(["administrador", "operador_matriz", "caixa"]),
      permissoes: z.array(z.string()),
      senhaTemporaria: z.string().optional()
    }).parse(d)
  )
  .handler(async ({ data }) => {
    const { 
      verificarDuplicidade, 
      criarUsuarioNoAuth, 
      vincularUsuarioEmpresa,
      buscarUserPorEmail 
    } = await import("./usuarios.server");

    // 1. Verificar se existe no Auth
    const existing = await buscarUserPorEmail(data.email);
    
    let userId = existing?.id;

    if (!userId) {
      if (!data.senhaTemporaria) {
        return { ok: false, precisaSenha: true, erro: "Usuário não existe no Auth. Defina uma senha para sincronizar." };
      }
      
      const auth = await criarUsuarioNoAuth({
        email: data.email,
        password: data.senhaTemporaria,
        metadata: {
          nome: data.nome,
          usuario: data.usuario,
          papel: data.papel,
        }
      });
      
      if (!auth.ok) return { ok: false, erro: auth.erro };
      userId = auth.userId!;
    }

    // 2. Garantir vínculo
    const vinculo = await vincularUsuarioEmpresa({
      userId,
      papel: data.papel,
      permissoes: data.permissoes
    });

    if (!vinculo.ok) return vinculo;


    return { ok: true, userId };
  });

export const atualizarUsuarioSistema = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])

  .inputValidator((d) => 
    z.object({
      userId: z.string(),
      email: z.string().email(),
      nome: z.string(),
      usuario: z.string(),
      papel: z.enum(["administrador", "operador_matriz", "caixa"]),
      permissoes: z.array(z.string()),
      status: z.enum(["ativo", "inativo"]),
      novaSenha: z.string().min(6).optional(),
      emailOriginal: z.string().optional(),
      usuarioOriginal: z.string().optional(),
    }).parse(d)
  )
  .handler(async ({ data, context }) => {
    const { atualizarAuthEMetadata, vincularUsuarioEmpresa, validarAdmin } = await import("./usuarios.server");
    
    // Validar se o solicitante é administrador
    if (!(await validarAdmin(context.supabase, context.userId))) {
      return { ok: false, erro: "Acesso negado: Somente administradores podem atualizar usuários." };
    }

    
    // Atualizar Auth
    const auth = await atualizarAuthEMetadata(data.userId, {
      email: data.email,
      nome: data.nome,
      usuario: data.usuario,
      papel: data.papel,
      status: data.status,
      novaSenha: data.novaSenha,
      emailOriginal: data.emailOriginal,
      usuarioOriginal: data.usuarioOriginal
    });
    
    if (!auth.ok) return auth;
    
    const realUserId = (auth as any).userId;

    // Atualizar vínculo
    const vinculo = await vincularUsuarioEmpresa({
      userId: realUserId,
      papel: data.papel,
      permissoes: data.permissoes
    });
    
    if (!vinculo.ok) return vinculo;
    
    return { ok: true, userId: realUserId };
  });


export const alternarStatusSistema = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])

  .inputValidator((d) => 
    z.object({
      userId: z.string(),
      status: z.enum(["ativo", "inativo"])
    }).parse(d)
  )
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { atualizarAuthEMetadata, resolverAuthUser, validarAdmin } = await import("./usuarios.server");
    
    // Validar se o solicitante é administrador
    if (!(await validarAdmin(context.supabase, context.userId))) {
      return { ok: false, erro: "Acesso negado: Somente administradores podem alterar status." };
    }

    
    const realId = await resolverAuthUser(data.userId);
    if (!realId) return { ok: false, erro: "Usuário não localizado no Auth." };

    const { data: user } = await supabaseAdmin.auth.admin.getUserById(realId);
    if (!user.user) return { ok: false, erro: "Usuário não encontrado." };

    return await atualizarAuthEMetadata(realId, {
      ...user.user.user_metadata,
      status: data.status
    });
  });

