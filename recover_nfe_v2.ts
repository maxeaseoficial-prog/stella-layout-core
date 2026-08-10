
import { createClient } from "@supabase/supabase-js";
import { 
    consultarNfePedido,
    carregarFiscalConfigServer,
    apiKeyParaAmbiente,
    spedyFetch,
    notaFiscalDeResposta,
    persistirNfeNoBanco,
    assertAdminFiscal
} from "./src/lib/fiscal.server";

// Nota: O arquivo fiscal.functions.ts apenas exporta o serverFn. 
// A lógica real está em fiscal.server.ts ou duplicada/encapsulada.
// Para o teste direto, vou reconstruir a lógica do handler ou importar as helpers.

async function test() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log("--- Teste de Recuperação da NF-e Rejeitada ---");
  
  const integrationId = "PED-2026-000005"; 
  const userId = "00000000-0000-0000-0000-000000000000"; // Placeholder para bypass assert

  try {
    const config = await carregarFiscalConfigServer(supabase);
    console.log("Config carregada, ambiente:", config.ambienteApi);

    const apiKeyInfo = await apiKeyParaAmbiente(supabase, config, config.ambienteApi);
    console.log("API Key obtida de:", apiKeyInfo.source);

    // 1. Localizar por integrationId
    console.log(`Buscando integrationId: ${integrationId}...`);
    const listRes = await spedyFetch(apiKeyInfo, config.ambienteApi, `/product-invoices?integrationId=${integrationId}`);
    
    if (!listRes?.data || listRes.data.length === 0) {
      console.log("Nenhuma NF-e encontrada na Spedy para este integrationId.");
      return;
    }

    const spedyId = listRes.data[0].id;
    console.log("NF-e encontrada! Spedy ID:", spedyId);
    console.log("Status na Spedy:", listRes.data[0].status);

    // 2. Consultar detalhes
    const res = await spedyFetch(apiKeyInfo, config.ambienteApi, `/product-invoices/${spedyId}`);
    const nota = notaFiscalDeResposta(res, config.ambienteApi, integrationId);
    
    console.log("Nota Processada:", JSON.stringify(nota, null, 2));

    // 3. Persistir (isso deve testar o UNIQUE e o onConflict)
    console.log("Persistindo no banco local...");
    
    // Precisamos de um tenant_id válido para o teste
    const { data: empUser } = await supabase
        .from("empresa_usuarios")
        .select("empresa_id")
        .limit(1)
        .single();
    
    if (!empUser) {
        console.log("Erro: Nenhum tenant encontrado para teste.");
        return;
    }

    // Como o persistirNfeNoBanco usa auth.getUser(), precisamos mockar o record diretamente se não quisermos lidar com o client auth
    // Ou simplesmente chamar a função sabendo que vai falhar no getUser() e testar a query manualmente
    
    const record = {
        tenant_id: empUser.empresa_id,
        tipo_emissao: "pedido",
        spedy_id: nota.spedyId,
        ambiente: nota.ambiente,
        status: nota.status,
        numero: nota.numero,
        serie: nota.serie,
        chave_acesso: nota.chaveAcesso,
        protocolo: nota.protocolo,
        valor_total: nota.valor,
        data_emissao: nota.emitidaEm,
        data_autorizacao: nota.autorizadaEm,
        external_id: nota.integrationId,
        mensagem_sefaz: nota.processingDetail?.message,
        updated_at: new Date().toISOString()
    };

    const { error: upsertError } = await supabase
        .from("notas_fiscais")
        .upsert(record, { onConflict: "tenant_id,spedy_id" });

    if (upsertError) {
        console.error("Erro no UPSERT:", upsertError);
    } else {
        console.log("UPSERT realizado com sucesso! Registro sincronizado.");
    }

  } catch (e) {
    console.error("Erro fatal no teste:", e);
  }
}

test();
