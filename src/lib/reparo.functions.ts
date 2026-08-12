import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

import { z } from "zod";

export const repararAcessoUsuario = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])

  .inputValidator((d) => 
    z.object({
      email: z.string().email(),
      localId: z.string(),
      nome: z.string(),
      usuario: z.string(),
      papel: z.enum(["administrador", "operador_matriz", "caixa"]),
      permissoes: z.array(z.string()),
      status: z.enum(["ativo", "inativo"]),
      novaSenha: z.string().optional()
    }).parse(d)
  )
  .handler(async ({ data, context }): Promise<{ ok: boolean; erro?: string; userId?: string }> => {
    const { 
        validarAdmin,
        buscarUserPorEmail, 

        criarUsuarioNoAuth, 
        vincularUsuarioEmpresa,
        atualizarAuthEMetadata,
        redefinirSenhaAuth
    } = await import("./usuarios.server");

    // Validar se o solicitante é administrador
    if (!(await validarAdmin(context.supabase, context.userId))) {
      return { ok: false, erro: "Acesso negado: Somente administradores podem reparar acessos." };
    }


    // 1. Verificar se existe no Auth pelo e-mail
    let authUser = await buscarUserPorEmail(data.email);
    let userId = authUser?.id;

    // CENÁRIO A: Não existe no Auth
    if (!userId) {
        if (!data.novaSenha) return { ok: false, erro: "Senha obrigatória para criar acesso." };
        
        const auth = await criarUsuarioNoAuth({
            email: data.email,
            password: data.novaSenha,
            metadata: {
                nome: data.nome,
                usuario: data.usuario,
                papel: data.papel,
                status: data.status
            }
        });
        
        if (!auth.ok) return auth;
        userId = auth.userId!;
    } else {
        // CENÁRIO D: Existe, mas metadata pode estar errada ou incompleta
        const metadataResult = await atualizarAuthEMetadata(userId, {
            email: data.email,
            nome: data.nome,
            usuario: data.usuario,
            papel: data.papel,
            status: data.status
        });

        if (!metadataResult.ok) {
            return { ok: false, erro: metadataResult.erro };
        }

        // Se mandou senha, redefinir para garantir acesso
        if (data.novaSenha) {
            const senhaResult = await redefinirSenhaAuth(data.email, data.novaSenha);
            if (!senhaResult.ok) {
                return { ok: false, erro: senhaResult.erro };
            }
        }
    }

    // CENÁRIO B: Garantir vínculo na tabela empresa_usuarios
    const vinculo = await vincularUsuarioEmpresa({
        userId,
        papel: data.papel,
        permissoes: data.permissoes
    });

    if (!vinculo.ok) return vinculo;

    // Retorna o userId real do Auth para atualizar o cadastro local (CENÁRIO C)
    return { ok: true, userId: userId as string };
  });
