import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const repararAcessoUsuario = createServerFn({ method: "POST" })
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
  .handler(async ({ data }): Promise<{ ok: boolean; erro?: string; userId?: string }> => {
    const { buscarUserPorEmail, criarUsuarioNoAuth, vincularUsuarioEmpresa, atualizarAuthEMetadata, redefinirSenhaAuth } = await import("./usuarios.server");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");


    // 1. Verificar se existe no Auth
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
        // CENÁRIO D: Existe, mas metadata pode estar errada
        await atualizarAuthEMetadata(userId, {
            email: data.email,
            nome: data.nome,
            usuario: data.usuario,
            papel: data.papel,
            status: data.status
        });

        // Se mandou senha, redefinir para garantir acesso
        if (data.novaSenha) {
            await redefinirSenhaAuth(data.email, data.novaSenha);
        }
    }

    // CENÁRIO B: Garantir vínculo
    const vinculo = await vincularUsuarioEmpresa({
        userId,
        papel: data.papel,
        permissoes: data.permissoes
    });

    if (!vinculo.ok) return vinculo;

    return { ok: true, userId: userId as string };
  });

