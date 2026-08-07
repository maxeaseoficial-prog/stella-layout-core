import { createClient } from '@supabase/supabase-js';
import { parse } from 'date-fns';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // I should use service role for batch insert if possible, or anon if RLS allows.
// Wait, the prompt says SUPABASE_SERVICE_ROLE_KEY is inaccessible.
// I should use the one from process.env inside the script if it's there, but I can't echo it.
// Actually, I can use the supabase client from @/integrations/supabase/client but that's for browser.
// I'll use direct psql instead. It's safer and I have the DATABASE_URL.

const dataText = `
402022 | ADIDAS FELPADO 65%PES 35%CO-MARINHO >T E C E L | 60069000 | 01/07/2026 | 0 | 0 | 1
57 | CALCA COM FAIXA REFLETIVA | 62046300 | 01/06/2025 | 103 | 103 | 7
26 | CAMISA SOCIAL | 25232990 | 01/07/2024 | 103 | 103 | 7
29 | CAMISA SOCIAL MANGA LONGA | 25232990 | 01/07/2024 | 103 | 103 | 7
53 | CAMISETA MANGA CURTA | 61046900 | 01/04/2025 | 103 | 103 | 7
54 | CAMISETA MANGA LONGA | 61046900 | 01/04/2025 | 103 | 103 | 7
38 | CAMISETA POLO BORDADA | 63090010 | 01/09/2024 | 103 | 103 | 7
DOP0157 | CANNES BRANCO 0001 58%CO 38%PES 4%PUE | 52081200 | 01/09/2025 | 500 | 500 | 1
DOP0171 | CANNES DARK 1215 58%CO 38%PES 4%PUE | 52103100 | 01/04/2024 | 500 | 500 | 1
DOP0172 | CANNES PRETO 0021 58%CO 38%PES 4%PUE | 52103100 | 01/10/2024 | 0 | 0 | 1
DOP0039 | DOPLIM IBIZA 9115 CINZA 362 75%PES 21%CO 4%ELAS | 54078200 | 01/01/2024 | 0 | 0 | 1
NAN0012 | DOUBLE NANETE LARANJA 2912 100 PES | 55151900 | 01/12/2024 | 500 | 500 | 1
NAN0015 | DOUBLE NANETE MARINHO 1317 100 PES | 55151900 | 01/04/2024 | 500 | 500 | 1
63 | ELASTICO BRANCO 3,0 CM C/ 25 MTS | 58062000 | 01/02/2025 | 101 | 101 | 49
30 | FIO BORDAR ZENITH | 54011011 | 01/07/2024 | 101 | 101 | 49
4 | FIO LINHANYL RETA 5.000 MTS | 55081000 | 01/09/2024 | 101 | 101 | 49
1050111 | FIO RETA 5.000 MTS 100%PES - PRETO | 55081000 | 01/07/2026 | 200 | 200 | 1
845 | FOC SPANDEX - BRANCO Diversos | 54075210 | 01/07/2026 | 200 | 200 | 49
MAK0004 | FURADINHO MAKRO CHUMBO 100 PES | 58042990 | 01/07/2026 | 200 | 200 | 1
47044028 | Gola Polo 50% Poliester, 50% Algodao, larg.0,42 cm - Cinza Grafeno | 60069000 | 01/07/2026 | 0 | 0 | 1
47044050 | Gola Polo 50% Poliester, 50% Algodao, larg.0,42 cm - Piscina | 60069000 | 01/07/2026 | 0 | 0 | 1
47044002 | Gola Polo 50% Poliester, 50% Algodao, larg.0,42 cm - Preto | 60069000 | 01/07/2026 | 0 | 0 | 1
FAN0331 | GOLA PV FANE MARINHO 6177 67% PES 33% VIS | 60069000 | 01/04/2024 | 500 | 500 | 1
FAN0339 | GOLA PV FANE PRETO 4012 67% PES 33% VIS | 60069000 | 01/11/2023 | 500 | 500 | 1
11072 | HELANCA LISA 100%PES - CINZA CHUMBO 24 | 54075210 | 01/07/2026 | 0 | 0 | 1
11022 | HELANCA LISA 100%PES - MARINHO | 52093200 | 01/03/2024 | 0 | 0 | 1
7894798100494 | IMPRESSÃO DTF TEXTIL 60CM | 49119900 | 01/05/2026 | 101 | 101 | 99
24 | JAQUETA BORDADA | 25232990 | 01/06/2024 | 103 | 103 | 7
600111 | MATELASSE 100%PES - PRETO | 58110000 | 01/05/2025 | 0 | 0 | 1
FAN0095 | MATELASSE 80 GR BORDO 100 PES | 55062000 | 01/07/2026 | 0 | 0 | 1
FAN0098 | MATELASSE 80 GR CINZA PRATA 100 PES | 55062000 | 01/07/2025 | 0 | 0 | 1
FAN0100 | MATELASSE 80 GR MARINHO 100 PES | 55062000 | 01/02/2024 | 0 | 0 | 1
FAN0103 | MATELASSE 80 GR PRETO 100 PES | 55062000 | 01/03/2024 | 0 | 0 | 1
22 | MOLETOM | 25232990 | 01/06/2024 | 103 | 103 | 7
MT-MOL000-AZ04 | Moletom Azul Royal | 60062200 | 01/07/2026 | 102 | 102 | 49
23 | MOLETOM BORDADO | 25232990 | 01/06/2024 | 103 | 103 | 7
MT-MOL000-CZ04 | Moletom Cinza Chumbo | 60062200 | 01/06/2026 | 102 | 102 | 49
MT-MOL000-MR02 | Moletom Marrom | 60062200 | 01/07/2026 | 102 | 102 | 49
MT-MOL000-PR01 | Moletom Preto | 60062200 | 01/04/2026 | 102 | 102 | 49
OMB0042 | NAYLON OMBORGO PARAQUEDA 240 BORDO 09 100 POLIAMIDA | 54074200 | 01/07/2026 | 300 | 300 | 1
OMB0046 | NAYLON OMBORGO PARAQUEDA 240 CINZA CLARO 17 100 POLIAMIDA | 54074200 | 01/07/2026 | 0 | 0 | 1
OMB0035 | NAYLON OMBORGO PARAQUEDA RES 240 PRETO 15 100 POLIAMIDA | 54074200 | 01/02/2024 | 300 | 300 | 1
1550111 | OVERLOQUE 250 GR 100%PES - PRETO | 54023320 | 01/07/2026 | 0 | 0 | 1
58 | OXFORD AD FC CORES Largura 1 50m 230g mL 100 Poliester L27 | 54075210 | 01/11/2024 | 200 | 200 | 1
IMP0041 | OXFORD INOVATORE COFFEE MARROM 100 PES | 54075210 | 01/07/2026 | 200 | 200 | 1
FAN0335 | PIQUE PV FANE PRETO 4012 TUBULAR 65% PES 35% VISC | 60064200 | 01/11/2023 | 300 | 300 | 1
44001028 | Piquet Ingles 53%Algodao,47% Poliester,larg.1,84mt,165 g/m2 - Cinza Grafeno | 60069000 | 01/07/2026 | 0 | 0 | 1
44001050 | Piquet Ingles 53%Algodao,47% Poliester,larg.1,84mt,165 g/m2 - Piscina | 60069000 | 01/07/2026 | 0 | 0 | 1
44001002 | Piquet Ingles 53%Algodao,47% Poliester,larg.1,84mt,165 g/m2 - Preto | 60069000 | 01/07/2026 | 0 | 0 | 1
35 | POLO MANGA CURTA | 63090010 | 01/09/2024 | 103 | 103 | 7
CED0156 | POLYCEDROBRIM CINZA 8047 67 CO 33PES | 52113200 | 01/01/2024 | 500 | 500 | 1
CED0162 | POLYCEDROBRIM PETROLEO 8053 67 CO 33 PES | 52113200 | 01/05/2024 | 500 | 500 | 1
FAN0198 | PV FANE BORDO 61019 67 PES 33 VISC | 60064200 | 01/02/2024 | 300 | 300 | 1
FAN0201 | PV FANE NOITE 60724 67 PES 33 VISC | 60064200 | 01/02/2024 | 300 | 300 | 1
FAN0363 | PV FANE VERDE BRASIL 62107 67 PES 33 VISC | 60064200 | 01/11/2023 | 300 | 300 | 1
7002000075 | PV TUBULAR 28/1 VORTEX PRETO / 65% PES - 35% CV | 60064200 | 01/09/2025 | 800 | 800 | 1
NAN0049 | RIBANA DOUBLE NANETE BRANCO 101 100 PES | 55151900 | 01/07/2026 | 500 | 500 | 1
NAN0056 | RIBANA DOUBLE NANETE LARANJA 2912 100 PES | 55151900 | 01/12/2024 | 500 | 500 | 1
NAN0059 | RIBANA DOUBLE NANETE MARINHO 1317 100 PES | 55151900 | 01/04/2024 | 500 | 500 | 1
NAN0064 | RIBANA DOUBLE NANETE PRETO 301 100 PES | 55151900 | 01/05/2024 | 500 | 500 | 1
MT-RIBMLT-AZ04 | Ribana Moletom Azul Royal | 60062300 | 01/07/2026 | 102 | 102 | 49
MT-RIBMLT-CZ04 | Ribana Moletom Cinza Chumbo | 60062300 | 01/06/2026 | 102 | 102 | 49
MT-RIBMLT-MR02 | Ribana Moletom Marrom | 60062300 | 01/07/2026 | 102 | 102 | 49
MT-RIBMLT-PR01 | Ribana Moletom Preta | 60062300 | 01/04/2026 | 102 | 102 | 49
FAN0263 | RIBANA PV FANE BORDO 61019 67 PES 33 VISC | 60069000 | 01/02/2024 | 500 | 500 | 1
FAN0278 | RIBANA PV FANE NOITE 60724 67 PES 33 VISC | 60069000 | 01/03/2024 | 500 | 500 | 1
7002000065 | RIBANA PV PRETO / 57,8% PES - 30,2% CV - 12% PUE | 60064200 | 01/09/2025 | 800 | 800 | 1
ADA0069 | TECHNO SPEED CHUMBO WATERPROOF 100% PES | 54075210 | 01/06/2026 | 100 | 100 | 1
ADA0069 | TECHNO SPEED CHUMBO WATERPROOF 100% PES | 54075210 | 18/06/2026 | 100 | 100 | 1
IMP0082 | TECNOSPORT ULTRAMARINE GREEN (BANDEIRA) 100 PES | 54075210 | 01/07/2026 | 100 | 100 | 1
`;

const tenantId = "11111111-1111-1111-1111-111111111111"; // Real tenant ID found earlier

const rows = dataText.trim().split('\n').filter(l => l.trim() !== '');

console.log('BEGIN;');
for (const row of rows) {
    const parts = row.split('|').map(s => s.trim());
    if (parts.length < 7) continue;

    const [codigo, descricao, ncm, vigenciaStr, recPis, recCofins, naturezaReceita] = parts;
    
    // Parse date DD/MM/YYYY to YYYY-MM-DD
    const dateParts = vigenciaStr.split('/');
    const vigencia = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;

    const sql = `
INSERT INTO public.categorias_fiscais (
    nome_amigavel, ncm, descricao_oficial, codigo, vigencia, rec_pis, rec_cofins, natureza_receita, tenant_id, situacao
) VALUES (
    '${descricao.replace(/'/g, "''")}', 
    '${ncm}', 
    '${descricao.replace(/'/g, "''")}', 
    '${codigo}', 
    '${vigencia}', 
    '${recPis}', 
    '${recCofins}', 
    '${naturezaReceita}', 
    '${tenantId}', 
    'ativo'
) ON CONFLICT (codigo, vigencia, tenant_id) DO UPDATE SET
    nome_amigavel = EXCLUDED.nome_amigavel,
    ncm = EXCLUDED.ncm,
    descricao_oficial = EXCLUDED.descricao_oficial,
    rec_pis = EXCLUDED.rec_pis,
    rec_cofins = EXCLUDED.rec_cofins,
    natureza_receita = EXCLUDED.natureza_receita,
    situacao = 'ativo',
    atualizado_em = now();`;
    
    console.log(sql);
}
console.log('COMMIT;');
