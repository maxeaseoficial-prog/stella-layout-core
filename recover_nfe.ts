import { emitirNfePedido, consultarNfePedido } from "./src/lib/fiscal.functions.ts";
import { createClient } from "@supabase/supabase-js";

async function test() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log("--- Teste de Recuperação da NF-e Rejeitada ---");
  
  // Tentar consultar pelo spedyId da rejeitada (se conhecido) ou pelo integrationId do pedido PED-2026-000005
  // Vou usar o integrationId do pedido que falhou na persistência
  const integrationId = "PED-2026-000005"; 
  
  // Mock do context para simular a chamada da server function
  const context = {
    supabase,
    userId: "00000000-0000-0000-0000-000000000000", // Simular um admin
  };

  try {
    const res = await (consultarNfePedido.handler as any)({ 
      data: { integrationId },
      context
    });
    
    console.log("Resultado da Consulta:", JSON.stringify(res, null, 2));
    
    if (res.ok) {
        console.log("NF-e recuperada e sincronizada com sucesso!");
    } else {
        console.log("Falha na recuperação:", res.mensagem);
    }
  } catch (e) {
    console.error("Erro fatal no teste:", e);
  }
}

test();
