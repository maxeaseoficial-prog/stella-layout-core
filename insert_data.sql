BEGIN;

INSERT INTO public.categorias_fiscais (
    nome_amigavel, ncm, descricao_oficial, codigo, vigencia, rec_pis, rec_cofins, natureza_receita, tenant_id, situacao
) VALUES (
    'ADIDAS FELPADO 65%PES 35%CO-MARINHO >T E C E L', 
    '60069000', 
    'ADIDAS FELPADO 65%PES 35%CO-MARINHO >T E C E L', 
    '402022', 
    '2026-07-01', 
    '0', 
    '0', 
    '1', 
    '11111111-1111-1111-1111-111111111111', 
    'ativo'
) ON CONFLICT (codigo, vigencia, tenant_id) DO UPDATE SET
    nome_amigavel = EXCLUDED.nome_amigavel,
    ncm = EXCLUDED.ncm,
    descricao_oficial = EXCLUDED.descricao_oficial,
    rec_pis = EXCLUDED.rec_pis,
    rec_cofins = EXCLUDED.rec_cofins,
    natureza_receita = EXCLUDED.natureza_receita,
    situacao = 'ativo',
    atualizado_em = now();

INSERT INTO public.categorias_fiscais (
    nome_amigavel, ncm, descricao_oficial, codigo, vigencia, rec_pis, rec_cofins, natureza_receita, tenant_id, situacao
) VALUES (
    'CALCA COM FAIXA REFLETIVA', 
    '62046300', 
    'CALCA COM FAIXA REFLETIVA', 
    '57', 
    '2025-06-01', 
    '103', 
    '103', 
    '7', 
    '11111111-1111-1111-1111-111111111111', 
    'ativo'
) ON CONFLICT (codigo, vigencia, tenant_id) DO UPDATE SET
    nome_amigavel = EXCLUDED.nome_amigavel,
    ncm = EXCLUDED.ncm,
    descricao_oficial = EXCLUDED.descricao_oficial,
    rec_pis = EXCLUDED.rec_pis,
    rec_cofins = EXCLUDED.rec_cofins,
    natureza_receita = EXCLUDED.natureza_receita,
    situacao = 'ativo',
    atualizado_em = now();

INSERT INTO public.categorias_fiscais (
    nome_amigavel, ncm, descricao_oficial, codigo, vigencia, rec_pis, rec_cofins, natureza_receita, tenant_id, situacao
) VALUES (
    'CAMISA SOCIAL', 
    '25232990', 
    'CAMISA SOCIAL', 
    '26', 
    '2024-07-01', 
    '103', 
    '103', 
    '7', 
    '11111111-1111-1111-1111-111111111111', 
    'ativo'
) ON CONFLICT (codigo, vigencia, tenant_id) DO UPDATE SET
    nome_amigavel = EXCLUDED.nome_amigavel,
    ncm = EXCLUDED.ncm,
    descricao_oficial = EXCLUDED.descricao_oficial,
    rec_pis = EXCLUDED.rec_pis,
    rec_cofins = EXCLUDED.rec_cofins,
    natureza_receita = EXCLUDED.natureza_receita,
    situacao = 'ativo',
    atualizado_em = now();

INSERT INTO public.categorias_fiscais (
    nome_amigavel, ncm, descricao_oficial, codigo, vigencia, rec_pis, rec_cofins, natureza_receita, tenant_id, situacao
) VALUES (
    'CAMISA SOCIAL MANGA LONGA', 
    '25232990', 
    'CAMISA SOCIAL MANGA LONGA', 
    '29', 
    '2024-07-01', 
    '103', 
    '103', 
    '7', 
    '11111111-1111-1111-1111-111111111111', 
    'ativo'
) ON CONFLICT (codigo, vigencia, tenant_id) DO UPDATE SET
    nome_amigavel = EXCLUDED.nome_amigavel,
    ncm = EXCLUDED.ncm,
    descricao_oficial = EXCLUDED.descricao_oficial,
    rec_pis = EXCLUDED.rec_pis,
    rec_cofins = EXCLUDED.rec_cofins,
    natureza_receita = EXCLUDED.natureza_receita,
    situacao = 'ativo',
    atualizado_em = now();

INSERT INTO public.categorias_fiscais (
    nome_amigavel, ncm, descricao_oficial, codigo, vigencia, rec_pis, rec_cofins, natureza_receita, tenant_id, situacao
) VALUES (
    'CAMISETA MANGA CURTA', 
    '61046900', 
    'CAMISETA MANGA CURTA', 
    '53', 
    '2025-04-01', 
    '103', 
    '103', 
    '7', 
    '11111111-1111-1111-1111-111111111111', 
    'ativo'
) ON CONFLICT (codigo, vigencia, tenant_id) DO UPDATE SET
    nome_amigavel = EXCLUDED.nome_amigavel,
    ncm = EXCLUDED.ncm,
    descricao_oficial = EXCLUDED.descricao_oficial,
    rec_pis = EXCLUDED.rec_pis,
    rec_cofins = EXCLUDED.rec_cofins,
    natureza_receita = EXCLUDED.natureza_receita,
    situacao = 'ativo',
    atualizado_em = now();

INSERT INTO public.categorias_fiscais (
    nome_amigavel, ncm, descricao_oficial, codigo, vigencia, rec_pis, rec_cofins, natureza_receita, tenant_id, situacao
) VALUES (
    'CAMISETA MANGA LONGA', 
    '61046900', 
    'CAMISETA MANGA LONGA', 
    '54', 
    '2025-04-01', 
    '103', 
    '103', 
    '7', 
    '11111111-1111-1111-1111-111111111111', 
    'ativo'
) ON CONFLICT (codigo, vigencia, tenant_id) DO UPDATE SET
    nome_amigavel = EXCLUDED.nome_amigavel,
    ncm = EXCLUDED.ncm,
    descricao_oficial = EXCLUDED.descricao_oficial,
    rec_pis = EXCLUDED.rec_pis,
    rec_cofins = EXCLUDED.rec_cofins,
    natureza_receita = EXCLUDED.natureza_receita,
    situacao = 'ativo',
    atualizado_em = now();

INSERT INTO public.categorias_fiscais (
    nome_amigavel, ncm, descricao_oficial, codigo, vigencia, rec_pis, rec_cofins, natureza_receita, tenant_id, situacao
) VALUES (
    'CAMISETA POLO BORDADA', 
    '63090010', 
    'CAMISETA POLO BORDADA', 
    '38', 
    '2024-09-01', 
    '103', 
    '103', 
    '7', 
    '11111111-1111-1111-1111-111111111111', 
    'ativo'
) ON CONFLICT (codigo, vigencia, tenant_id) DO UPDATE SET
    nome_amigavel = EXCLUDED.nome_amigavel,
    ncm = EXCLUDED.ncm,
    descricao_oficial = EXCLUDED.descricao_oficial,
    rec_pis = EXCLUDED.rec_pis,
    rec_cofins = EXCLUDED.rec_cofins,
    natureza_receita = EXCLUDED.natureza_receita,
    situacao = 'ativo',
    atualizado_em = now();

INSERT INTO public.categorias_fiscais (
    nome_amigavel, ncm, descricao_oficial, codigo, vigencia, rec_pis, rec_cofins, natureza_receita, tenant_id, situacao
) VALUES (
    'CANNES BRANCO 0001 58%CO 38%PES 4%PUE', 
    '52081200', 
    'CANNES BRANCO 0001 58%CO 38%PES 4%PUE', 
    'DOP0157', 
    '2025-09-01', 
    '500', 
    '500', 
    '1', 
    '11111111-1111-1111-1111-111111111111', 
    'ativo'
) ON CONFLICT (codigo, vigencia, tenant_id) DO UPDATE SET
    nome_amigavel = EXCLUDED.nome_amigavel,
    ncm = EXCLUDED.ncm,
    descricao_oficial = EXCLUDED.descricao_oficial,
    rec_pis = EXCLUDED.rec_pis,
    rec_cofins = EXCLUDED.rec_cofins,
    natureza_receita = EXCLUDED.natureza_receita,
    situacao = 'ativo',
    atualizado_em = now();

INSERT INTO public.categorias_fiscais (
    nome_amigavel, ncm, descricao_oficial, codigo, vigencia, rec_pis, rec_cofins, natureza_receita, tenant_id, situacao
) VALUES (
    'CANNES DARK 1215 58%CO 38%PES 4%PUE', 
    '52103100', 
    'CANNES DARK 1215 58%CO 38%PES 4%PUE', 
    'DOP0171', 
    '2024-04-01', 
    '500', 
    '500', 
    '1', 
    '11111111-1111-1111-1111-111111111111', 
    'ativo'
) ON CONFLICT (codigo, vigencia, tenant_id) DO UPDATE SET
    nome_amigavel = EXCLUDED.nome_amigavel,
    ncm = EXCLUDED.ncm,
    descricao_oficial = EXCLUDED.descricao_oficial,
    rec_pis = EXCLUDED.rec_pis,
    rec_cofins = EXCLUDED.rec_cofins,
    natureza_receita = EXCLUDED.natureza_receita,
    situacao = 'ativo',
    atualizado_em = now();

INSERT INTO public.categorias_fiscais (
    nome_amigavel, ncm, descricao_oficial, codigo, vigencia, rec_pis, rec_cofins, natureza_receita, tenant_id, situacao
) VALUES (
    'CANNES PRETO 0021 58%CO 38%PES 4%PUE', 
    '52103100', 
    'CANNES PRETO 0021 58%CO 38%PES 4%PUE', 
    'DOP0172', 
    '2024-10-01', 
    '0', 
    '0', 
    '1', 
    '11111111-1111-1111-1111-111111111111', 
    'ativo'
) ON CONFLICT (codigo, vigencia, tenant_id) DO UPDATE SET
    nome_amigavel = EXCLUDED.nome_amigavel,
    ncm = EXCLUDED.ncm,
    descricao_oficial = EXCLUDED.descricao_oficial,
    rec_pis = EXCLUDED.rec_pis,
    rec_cofins = EXCLUDED.rec_cofins,
    natureza_receita = EXCLUDED.natureza_receita,
    situacao = 'ativo',
    atualizado_em = now();

INSERT INTO public.categorias_fiscais (
    nome_amigavel, ncm, descricao_oficial, codigo, vigencia, rec_pis, rec_cofins, natureza_receita, tenant_id, situacao
) VALUES (
    'DOPLIM IBIZA 9115 CINZA 362 75%PES 21%CO 4%ELAS', 
    '54078200', 
    'DOPLIM IBIZA 9115 CINZA 362 75%PES 21%CO 4%ELAS', 
    'DOP0039', 
    '2024-01-01', 
    '0', 
    '0', 
    '1', 
    '11111111-1111-1111-1111-111111111111', 
    'ativo'
) ON CONFLICT (codigo, vigencia, tenant_id) DO UPDATE SET
    nome_amigavel = EXCLUDED.nome_amigavel,
    ncm = EXCLUDED.ncm,
    descricao_oficial = EXCLUDED.descricao_oficial,
    rec_pis = EXCLUDED.rec_pis,
    rec_cofins = EXCLUDED.rec_cofins,
    natureza_receita = EXCLUDED.natureza_receita,
    situacao = 'ativo',
    atualizado_em = now();

INSERT INTO public.categorias_fiscais (
    nome_amigavel, ncm, descricao_oficial, codigo, vigencia, rec_pis, rec_cofins, natureza_receita, tenant_id, situacao
) VALUES (
    'DOUBLE NANETE LARANJA 2912 100 PES', 
    '55151900', 
    'DOUBLE NANETE LARANJA 2912 100 PES', 
    'NAN0012', 
    '2024-12-01', 
    '500', 
    '500', 
    '1', 
    '11111111-1111-1111-1111-111111111111', 
    'ativo'
) ON CONFLICT (codigo, vigencia, tenant_id) DO UPDATE SET
    nome_amigavel = EXCLUDED.nome_amigavel,
    ncm = EXCLUDED.ncm,
    descricao_oficial = EXCLUDED.descricao_oficial,
    rec_pis = EXCLUDED.rec_pis,
    rec_cofins = EXCLUDED.rec_cofins,
    natureza_receita = EXCLUDED.natureza_receita,
    situacao = 'ativo',
    atualizado_em = now();

INSERT INTO public.categorias_fiscais (
    nome_amigavel, ncm, descricao_oficial, codigo, vigencia, rec_pis, rec_cofins, natureza_receita, tenant_id, situacao
) VALUES (
    'DOUBLE NANETE MARINHO 1317 100 PES', 
    '55151900', 
    'DOUBLE NANETE MARINHO 1317 100 PES', 
    'NAN0015', 
    '2024-04-01', 
    '500', 
    '500', 
    '1', 
    '11111111-1111-1111-1111-111111111111', 
    'ativo'
) ON CONFLICT (codigo, vigencia, tenant_id) DO UPDATE SET
    nome_amigavel = EXCLUDED.nome_amigavel,
    ncm = EXCLUDED.ncm,
    descricao_oficial = EXCLUDED.descricao_oficial,
    rec_pis = EXCLUDED.rec_pis,
    rec_cofins = EXCLUDED.rec_cofins,
    natureza_receita = EXCLUDED.natureza_receita,
    situacao = 'ativo',
    atualizado_em = now();

INSERT INTO public.categorias_fiscais (
    nome_amigavel, ncm, descricao_oficial, codigo, vigencia, rec_pis, rec_cofins, natureza_receita, tenant_id, situacao
) VALUES (
    'ELASTICO BRANCO 3,0 CM C/ 25 MTS', 
    '58062000', 
    'ELASTICO BRANCO 3,0 CM C/ 25 MTS', 
    '63', 
    '2025-02-01', 
    '101', 
    '101', 
    '49', 
    '11111111-1111-1111-1111-111111111111', 
    'ativo'
) ON CONFLICT (codigo, vigencia, tenant_id) DO UPDATE SET
    nome_amigavel = EXCLUDED.nome_amigavel,
    ncm = EXCLUDED.ncm,
    descricao_oficial = EXCLUDED.descricao_oficial,
    rec_pis = EXCLUDED.rec_pis,
    rec_cofins = EXCLUDED.rec_cofins,
    natureza_receita = EXCLUDED.natureza_receita,
    situacao = 'ativo',
    atualizado_em = now();

INSERT INTO public.categorias_fiscais (
    nome_amigavel, ncm, descricao_oficial, codigo, vigencia, rec_pis, rec_cofins, natureza_receita, tenant_id, situacao
) VALUES (
    'FIO BORDAR ZENITH', 
    '54011011', 
    'FIO BORDAR ZENITH', 
    '30', 
    '2024-07-01', 
    '101', 
    '101', 
    '49', 
    '11111111-1111-1111-1111-111111111111', 
    'ativo'
) ON CONFLICT (codigo, vigencia, tenant_id) DO UPDATE SET
    nome_amigavel = EXCLUDED.nome_amigavel,
    ncm = EXCLUDED.ncm,
    descricao_oficial = EXCLUDED.descricao_oficial,
    rec_pis = EXCLUDED.rec_pis,
    rec_cofins = EXCLUDED.rec_cofins,
    natureza_receita = EXCLUDED.natureza_receita,
    situacao = 'ativo',
    atualizado_em = now();

INSERT INTO public.categorias_fiscais (
    nome_amigavel, ncm, descricao_oficial, codigo, vigencia, rec_pis, rec_cofins, natureza_receita, tenant_id, situacao
) VALUES (
    'FIO LINHANYL RETA 5.000 MTS', 
    '55081000', 
    'FIO LINHANYL RETA 5.000 MTS', 
    '4', 
    '2024-09-01', 
    '101', 
    '101', 
    '49', 
    '11111111-1111-1111-1111-111111111111', 
    'ativo'
) ON CONFLICT (codigo, vigencia, tenant_id) DO UPDATE SET
    nome_amigavel = EXCLUDED.nome_amigavel,
    ncm = EXCLUDED.ncm,
    descricao_oficial = EXCLUDED.descricao_oficial,
    rec_pis = EXCLUDED.rec_pis,
    rec_cofins = EXCLUDED.rec_cofins,
    natureza_receita = EXCLUDED.natureza_receita,
    situacao = 'ativo',
    atualizado_em = now();

INSERT INTO public.categorias_fiscais (
    nome_amigavel, ncm, descricao_oficial, codigo, vigencia, rec_pis, rec_cofins, natureza_receita, tenant_id, situacao
) VALUES (
    'FIO RETA 5.000 MTS 100%PES - PRETO', 
    '55081000', 
    'FIO RETA 5.000 MTS 100%PES - PRETO', 
    '1050111', 
    '2026-07-01', 
    '200', 
    '200', 
    '1', 
    '11111111-1111-1111-1111-111111111111', 
    'ativo'
) ON CONFLICT (codigo, vigencia, tenant_id) DO UPDATE SET
    nome_amigavel = EXCLUDED.nome_amigavel,
    ncm = EXCLUDED.ncm,
    descricao_oficial = EXCLUDED.descricao_oficial,
    rec_pis = EXCLUDED.rec_pis,
    rec_cofins = EXCLUDED.rec_cofins,
    natureza_receita = EXCLUDED.natureza_receita,
    situacao = 'ativo',
    atualizado_em = now();

INSERT INTO public.categorias_fiscais (
    nome_amigavel, ncm, descricao_oficial, codigo, vigencia, rec_pis, rec_cofins, natureza_receita, tenant_id, situacao
) VALUES (
    'FOC SPANDEX - BRANCO Diversos', 
    '54075210', 
    'FOC SPANDEX - BRANCO Diversos', 
    '845', 
    '2026-07-01', 
    '200', 
    '200', 
    '49', 
    '11111111-1111-1111-1111-111111111111', 
    'ativo'
) ON CONFLICT (codigo, vigencia, tenant_id) DO UPDATE SET
    nome_amigavel = EXCLUDED.nome_amigavel,
    ncm = EXCLUDED.ncm,
    descricao_oficial = EXCLUDED.descricao_oficial,
    rec_pis = EXCLUDED.rec_pis,
    rec_cofins = EXCLUDED.rec_cofins,
    natureza_receita = EXCLUDED.natureza_receita,
    situacao = 'ativo',
    atualizado_em = now();

INSERT INTO public.categorias_fiscais (
    nome_amigavel, ncm, descricao_oficial, codigo, vigencia, rec_pis, rec_cofins, natureza_receita, tenant_id, situacao
) VALUES (
    'FURADINHO MAKRO CHUMBO 100 PES', 
    '58042990', 
    'FURADINHO MAKRO CHUMBO 100 PES', 
    'MAK0004', 
    '2026-07-01', 
    '200', 
    '200', 
    '1', 
    '11111111-1111-1111-1111-111111111111', 
    'ativo'
) ON CONFLICT (codigo, vigencia, tenant_id) DO UPDATE SET
    nome_amigavel = EXCLUDED.nome_amigavel,
    ncm = EXCLUDED.ncm,
    descricao_oficial = EXCLUDED.descricao_oficial,
    rec_pis = EXCLUDED.rec_pis,
    rec_cofins = EXCLUDED.rec_cofins,
    natureza_receita = EXCLUDED.natureza_receita,
    situacao = 'ativo',
    atualizado_em = now();

INSERT INTO public.categorias_fiscais (
    nome_amigavel, ncm, descricao_oficial, codigo, vigencia, rec_pis, rec_cofins, natureza_receita, tenant_id, situacao
) VALUES (
    'Gola Polo 50% Poliester, 50% Algodao, larg.0,42 cm - Cinza Grafeno', 
    '60069000', 
    'Gola Polo 50% Poliester, 50% Algodao, larg.0,42 cm - Cinza Grafeno', 
    '47044028', 
    '2026-07-01', 
    '0', 
    '0', 
    '1', 
    '11111111-1111-1111-1111-111111111111', 
    'ativo'
) ON CONFLICT (codigo, vigencia, tenant_id) DO UPDATE SET
    nome_amigavel = EXCLUDED.nome_amigavel,
    ncm = EXCLUDED.ncm,
    descricao_oficial = EXCLUDED.descricao_oficial,
    rec_pis = EXCLUDED.rec_pis,
    rec_cofins = EXCLUDED.rec_cofins,
    natureza_receita = EXCLUDED.natureza_receita,
    situacao = 'ativo',
    atualizado_em = now();

INSERT INTO public.categorias_fiscais (
    nome_amigavel, ncm, descricao_oficial, codigo, vigencia, rec_pis, rec_cofins, natureza_receita, tenant_id, situacao
) VALUES (
    'Gola Polo 50% Poliester, 50% Algodao, larg.0,42 cm - Piscina', 
    '60069000', 
    'Gola Polo 50% Poliester, 50% Algodao, larg.0,42 cm - Piscina', 
    '47044050', 
    '2026-07-01', 
    '0', 
    '0', 
    '1', 
    '11111111-1111-1111-1111-111111111111', 
    'ativo'
) ON CONFLICT (codigo, vigencia, tenant_id) DO UPDATE SET
    nome_amigavel = EXCLUDED.nome_amigavel,
    ncm = EXCLUDED.ncm,
    descricao_oficial = EXCLUDED.descricao_oficial,
    rec_pis = EXCLUDED.rec_pis,
    rec_cofins = EXCLUDED.rec_cofins,
    natureza_receita = EXCLUDED.natureza_receita,
    situacao = 'ativo',
    atualizado_em = now();

INSERT INTO public.categorias_fiscais (
    nome_amigavel, ncm, descricao_oficial, codigo, vigencia, rec_pis, rec_cofins, natureza_receita, tenant_id, situacao
) VALUES (
    'Gola Polo 50% Poliester, 50% Algodao, larg.0,42 cm - Preto', 
    '60069000', 
    'Gola Polo 50% Poliester, 50% Algodao, larg.0,42 cm - Preto', 
    '47044002', 
    '2026-07-01', 
    '0', 
    '0', 
    '1', 
    '11111111-1111-1111-1111-111111111111', 
    'ativo'
) ON CONFLICT (codigo, vigencia, tenant_id) DO UPDATE SET
    nome_amigavel = EXCLUDED.nome_amigavel,
    ncm = EXCLUDED.ncm,
    descricao_oficial = EXCLUDED.descricao_oficial,
    rec_pis = EXCLUDED.rec_pis,
    rec_cofins = EXCLUDED.rec_cofins,
    natureza_receita = EXCLUDED.natureza_receita,
    situacao = 'ativo',
    atualizado_em = now();

INSERT INTO public.categorias_fiscais (
    nome_amigavel, ncm, descricao_oficial, codigo, vigencia, rec_pis, rec_cofins, natureza_receita, tenant_id, situacao
) VALUES (
    'GOLA PV FANE MARINHO 6177 67% PES 33% VIS', 
    '60069000', 
    'GOLA PV FANE MARINHO 6177 67% PES 33% VIS', 
    'FAN0331', 
    '2024-04-01', 
    '500', 
    '500', 
    '1', 
    '11111111-1111-1111-1111-111111111111', 
    'ativo'
) ON CONFLICT (codigo, vigencia, tenant_id) DO UPDATE SET
    nome_amigavel = EXCLUDED.nome_amigavel,
    ncm = EXCLUDED.ncm,
    descricao_oficial = EXCLUDED.descricao_oficial,
    rec_pis = EXCLUDED.rec_pis,
    rec_cofins = EXCLUDED.rec_cofins,
    natureza_receita = EXCLUDED.natureza_receita,
    situacao = 'ativo',
    atualizado_em = now();

INSERT INTO public.categorias_fiscais (
    nome_amigavel, ncm, descricao_oficial, codigo, vigencia, rec_pis, rec_cofins, natureza_receita, tenant_id, situacao
) VALUES (
    'GOLA PV FANE PRETO 4012 67% PES 33% VIS', 
    '60069000', 
    'GOLA PV FANE PRETO 4012 67% PES 33% VIS', 
    'FAN0339', 
    '2023-11-01', 
    '500', 
    '500', 
    '1', 
    '11111111-1111-1111-1111-111111111111', 
    'ativo'
) ON CONFLICT (codigo, vigencia, tenant_id) DO UPDATE SET
    nome_amigavel = EXCLUDED.nome_amigavel,
    ncm = EXCLUDED.ncm,
    descricao_oficial = EXCLUDED.descricao_oficial,
    rec_pis = EXCLUDED.rec_pis,
    rec_cofins = EXCLUDED.rec_cofins,
    natureza_receita = EXCLUDED.natureza_receita,
    situacao = 'ativo',
    atualizado_em = now();

INSERT INTO public.categorias_fiscais (
    nome_amigavel, ncm, descricao_oficial, codigo, vigencia, rec_pis, rec_cofins, natureza_receita, tenant_id, situacao
) VALUES (
    'HELANCA LISA 100%PES - CINZA CHUMBO 24', 
    '54075210', 
    'HELANCA LISA 100%PES - CINZA CHUMBO 24', 
    '11072', 
    '2026-07-01', 
    '0', 
    '0', 
    '1', 
    '11111111-1111-1111-1111-111111111111', 
    'ativo'
) ON CONFLICT (codigo, vigencia, tenant_id) DO UPDATE SET
    nome_amigavel = EXCLUDED.nome_amigavel,
    ncm = EXCLUDED.ncm,
    descricao_oficial = EXCLUDED.descricao_oficial,
    rec_pis = EXCLUDED.rec_pis,
    rec_cofins = EXCLUDED.rec_cofins,
    natureza_receita = EXCLUDED.natureza_receita,
    situacao = 'ativo',
    atualizado_em = now();

INSERT INTO public.categorias_fiscais (
    nome_amigavel, ncm, descricao_oficial, codigo, vigencia, rec_pis, rec_cofins, natureza_receita, tenant_id, situacao
) VALUES (
    'HELANCA LISA 100%PES - MARINHO', 
    '52093200', 
    'HELANCA LISA 100%PES - MARINHO', 
    '11022', 
    '2024-03-01', 
    '0', 
    '0', 
    '1', 
    '11111111-1111-1111-1111-111111111111', 
    'ativo'
) ON CONFLICT (codigo, vigencia, tenant_id) DO UPDATE SET
    nome_amigavel = EXCLUDED.nome_amigavel,
    ncm = EXCLUDED.ncm,
    descricao_oficial = EXCLUDED.descricao_oficial,
    rec_pis = EXCLUDED.rec_pis,
    rec_cofins = EXCLUDED.rec_cofins,
    natureza_receita = EXCLUDED.natureza_receita,
    situacao = 'ativo',
    atualizado_em = now();

INSERT INTO public.categorias_fiscais (
    nome_amigavel, ncm, descricao_oficial, codigo, vigencia, rec_pis, rec_cofins, natureza_receita, tenant_id, situacao
) VALUES (
    'IMPRESSÃO DTF TEXTIL 60CM', 
    '49119900', 
    'IMPRESSÃO DTF TEXTIL 60CM', 
    '7894798100494', 
    '2026-05-01', 
    '101', 
    '101', 
    '99', 
    '11111111-1111-1111-1111-111111111111', 
    'ativo'
) ON CONFLICT (codigo, vigencia, tenant_id) DO UPDATE SET
    nome_amigavel = EXCLUDED.nome_amigavel,
    ncm = EXCLUDED.ncm,
    descricao_oficial = EXCLUDED.descricao_oficial,
    rec_pis = EXCLUDED.rec_pis,
    rec_cofins = EXCLUDED.rec_cofins,
    natureza_receita = EXCLUDED.natureza_receita,
    situacao = 'ativo',
    atualizado_em = now();

INSERT INTO public.categorias_fiscais (
    nome_amigavel, ncm, descricao_oficial, codigo, vigencia, rec_pis, rec_cofins, natureza_receita, tenant_id, situacao
) VALUES (
    'JAQUETA BORDADA', 
    '25232990', 
    'JAQUETA BORDADA', 
    '24', 
    '2024-06-01', 
    '103', 
    '103', 
    '7', 
    '11111111-1111-1111-1111-111111111111', 
    'ativo'
) ON CONFLICT (codigo, vigencia, tenant_id) DO UPDATE SET
    nome_amigavel = EXCLUDED.nome_amigavel,
    ncm = EXCLUDED.ncm,
    descricao_oficial = EXCLUDED.descricao_oficial,
    rec_pis = EXCLUDED.rec_pis,
    rec_cofins = EXCLUDED.rec_cofins,
    natureza_receita = EXCLUDED.natureza_receita,
    situacao = 'ativo',
    atualizado_em = now();

INSERT INTO public.categorias_fiscais (
    nome_amigavel, ncm, descricao_oficial, codigo, vigencia, rec_pis, rec_cofins, natureza_receita, tenant_id, situacao
) VALUES (
    'MATELASSE 100%PES - PRETO', 
    '58110000', 
    'MATELASSE 100%PES - PRETO', 
    '600111', 
    '2025-05-01', 
    '0', 
    '0', 
    '1', 
    '11111111-1111-1111-1111-111111111111', 
    'ativo'
) ON CONFLICT (codigo, vigencia, tenant_id) DO UPDATE SET
    nome_amigavel = EXCLUDED.nome_amigavel,
    ncm = EXCLUDED.ncm,
    descricao_oficial = EXCLUDED.descricao_oficial,
    rec_pis = EXCLUDED.rec_pis,
    rec_cofins = EXCLUDED.rec_cofins,
    natureza_receita = EXCLUDED.natureza_receita,
    situacao = 'ativo',
    atualizado_em = now();

INSERT INTO public.categorias_fiscais (
    nome_amigavel, ncm, descricao_oficial, codigo, vigencia, rec_pis, rec_cofins, natureza_receita, tenant_id, situacao
) VALUES (
    'MATELASSE 80 GR BORDO 100 PES', 
    '55062000', 
    'MATELASSE 80 GR BORDO 100 PES', 
    'FAN0095', 
    '2026-07-01', 
    '0', 
    '0', 
    '1', 
    '11111111-1111-1111-1111-111111111111', 
    'ativo'
) ON CONFLICT (codigo, vigencia, tenant_id) DO UPDATE SET
    nome_amigavel = EXCLUDED.nome_amigavel,
    ncm = EXCLUDED.ncm,
    descricao_oficial = EXCLUDED.descricao_oficial,
    rec_pis = EXCLUDED.rec_pis,
    rec_cofins = EXCLUDED.rec_cofins,
    natureza_receita = EXCLUDED.natureza_receita,
    situacao = 'ativo',
    atualizado_em = now();

INSERT INTO public.categorias_fiscais (
    nome_amigavel, ncm, descricao_oficial, codigo, vigencia, rec_pis, rec_cofins, natureza_receita, tenant_id, situacao
) VALUES (
    'MATELASSE 80 GR CINZA PRATA 100 PES', 
    '55062000', 
    'MATELASSE 80 GR CINZA PRATA 100 PES', 
    'FAN0098', 
    '2025-07-01', 
    '0', 
    '0', 
    '1', 
    '11111111-1111-1111-1111-111111111111', 
    'ativo'
) ON CONFLICT (codigo, vigencia, tenant_id) DO UPDATE SET
    nome_amigavel = EXCLUDED.nome_amigavel,
    ncm = EXCLUDED.ncm,
    descricao_oficial = EXCLUDED.descricao_oficial,
    rec_pis = EXCLUDED.rec_pis,
    rec_cofins = EXCLUDED.rec_cofins,
    natureza_receita = EXCLUDED.natureza_receita,
    situacao = 'ativo',
    atualizado_em = now();

INSERT INTO public.categorias_fiscais (
    nome_amigavel, ncm, descricao_oficial, codigo, vigencia, rec_pis, rec_cofins, natureza_receita, tenant_id, situacao
) VALUES (
    'MATELASSE 80 GR MARINHO 100 PES', 
    '55062000', 
    'MATELASSE 80 GR MARINHO 100 PES', 
    'FAN0100', 
    '2024-02-01', 
    '0', 
    '0', 
    '1', 
    '11111111-1111-1111-1111-111111111111', 
    'ativo'
) ON CONFLICT (codigo, vigencia, tenant_id) DO UPDATE SET
    nome_amigavel = EXCLUDED.nome_amigavel,
    ncm = EXCLUDED.ncm,
    descricao_oficial = EXCLUDED.descricao_oficial,
    rec_pis = EXCLUDED.rec_pis,
    rec_cofins = EXCLUDED.rec_cofins,
    natureza_receita = EXCLUDED.natureza_receita,
    situacao = 'ativo',
    atualizado_em = now();

INSERT INTO public.categorias_fiscais (
    nome_amigavel, ncm, descricao_oficial, codigo, vigencia, rec_pis, rec_cofins, natureza_receita, tenant_id, situacao
) VALUES (
    'MATELASSE 80 GR PRETO 100 PES', 
    '55062000', 
    'MATELASSE 80 GR PRETO 100 PES', 
    'FAN0103', 
    '2024-03-01', 
    '0', 
    '0', 
    '1', 
    '11111111-1111-1111-1111-111111111111', 
    'ativo'
) ON CONFLICT (codigo, vigencia, tenant_id) DO UPDATE SET
    nome_amigavel = EXCLUDED.nome_amigavel,
    ncm = EXCLUDED.ncm,
    descricao_oficial = EXCLUDED.descricao_oficial,
    rec_pis = EXCLUDED.rec_pis,
    rec_cofins = EXCLUDED.rec_cofins,
    natureza_receita = EXCLUDED.natureza_receita,
    situacao = 'ativo',
    atualizado_em = now();

INSERT INTO public.categorias_fiscais (
    nome_amigavel, ncm, descricao_oficial, codigo, vigencia, rec_pis, rec_cofins, natureza_receita, tenant_id, situacao
) VALUES (
    'MOLETOM', 
    '25232990', 
    'MOLETOM', 
    '22', 
    '2024-06-01', 
    '103', 
    '103', 
    '7', 
    '11111111-1111-1111-1111-111111111111', 
    'ativo'
) ON CONFLICT (codigo, vigencia, tenant_id) DO UPDATE SET
    nome_amigavel = EXCLUDED.nome_amigavel,
    ncm = EXCLUDED.ncm,
    descricao_oficial = EXCLUDED.descricao_oficial,
    rec_pis = EXCLUDED.rec_pis,
    rec_cofins = EXCLUDED.rec_cofins,
    natureza_receita = EXCLUDED.natureza_receita,
    situacao = 'ativo',
    atualizado_em = now();

INSERT INTO public.categorias_fiscais (
    nome_amigavel, ncm, descricao_oficial, codigo, vigencia, rec_pis, rec_cofins, natureza_receita, tenant_id, situacao
) VALUES (
    'Moletom Azul Royal', 
    '60062200', 
    'Moletom Azul Royal', 
    'MT-MOL000-AZ04', 
    '2026-07-01', 
    '102', 
    '102', 
    '49', 
    '11111111-1111-1111-1111-111111111111', 
    'ativo'
) ON CONFLICT (codigo, vigencia, tenant_id) DO UPDATE SET
    nome_amigavel = EXCLUDED.nome_amigavel,
    ncm = EXCLUDED.ncm,
    descricao_oficial = EXCLUDED.descricao_oficial,
    rec_pis = EXCLUDED.rec_pis,
    rec_cofins = EXCLUDED.rec_cofins,
    natureza_receita = EXCLUDED.natureza_receita,
    situacao = 'ativo',
    atualizado_em = now();

INSERT INTO public.categorias_fiscais (
    nome_amigavel, ncm, descricao_oficial, codigo, vigencia, rec_pis, rec_cofins, natureza_receita, tenant_id, situacao
) VALUES (
    'MOLETOM BORDADO', 
    '25232990', 
    'MOLETOM BORDADO', 
    '23', 
    '2024-06-01', 
    '103', 
    '103', 
    '7', 
    '11111111-1111-1111-1111-111111111111', 
    'ativo'
) ON CONFLICT (codigo, vigencia, tenant_id) DO UPDATE SET
    nome_amigavel = EXCLUDED.nome_amigavel,
    ncm = EXCLUDED.ncm,
    descricao_oficial = EXCLUDED.descricao_oficial,
    rec_pis = EXCLUDED.rec_pis,
    rec_cofins = EXCLUDED.rec_cofins,
    natureza_receita = EXCLUDED.natureza_receita,
    situacao = 'ativo',
    atualizado_em = now();

INSERT INTO public.categorias_fiscais (
    nome_amigavel, ncm, descricao_oficial, codigo, vigencia, rec_pis, rec_cofins, natureza_receita, tenant_id, situacao
) VALUES (
    'Moletom Cinza Chumbo', 
    '60062200', 
    'Moletom Cinza Chumbo', 
    'MT-MOL000-CZ04', 
    '2026-06-01', 
    '102', 
    '102', 
    '49', 
    '11111111-1111-1111-1111-111111111111', 
    'ativo'
) ON CONFLICT (codigo, vigencia, tenant_id) DO UPDATE SET
    nome_amigavel = EXCLUDED.nome_amigavel,
    ncm = EXCLUDED.ncm,
    descricao_oficial = EXCLUDED.descricao_oficial,
    rec_pis = EXCLUDED.rec_pis,
    rec_cofins = EXCLUDED.rec_cofins,
    natureza_receita = EXCLUDED.natureza_receita,
    situacao = 'ativo',
    atualizado_em = now();

INSERT INTO public.categorias_fiscais (
    nome_amigavel, ncm, descricao_oficial, codigo, vigencia, rec_pis, rec_cofins, natureza_receita, tenant_id, situacao
) VALUES (
    'Moletom Marrom', 
    '60062200', 
    'Moletom Marrom', 
    'MT-MOL000-MR02', 
    '2026-07-01', 
    '102', 
    '102', 
    '49', 
    '11111111-1111-1111-1111-111111111111', 
    'ativo'
) ON CONFLICT (codigo, vigencia, tenant_id) DO UPDATE SET
    nome_amigavel = EXCLUDED.nome_amigavel,
    ncm = EXCLUDED.ncm,
    descricao_oficial = EXCLUDED.descricao_oficial,
    rec_pis = EXCLUDED.rec_pis,
    rec_cofins = EXCLUDED.rec_cofins,
    natureza_receita = EXCLUDED.natureza_receita,
    situacao = 'ativo',
    atualizado_em = now();

INSERT INTO public.categorias_fiscais (
    nome_amigavel, ncm, descricao_oficial, codigo, vigencia, rec_pis, rec_cofins, natureza_receita, tenant_id, situacao
) VALUES (
    'Moletom Preto', 
    '60062200', 
    'Moletom Preto', 
    'MT-MOL000-PR01', 
    '2026-04-01', 
    '102', 
    '102', 
    '49', 
    '11111111-1111-1111-1111-111111111111', 
    'ativo'
) ON CONFLICT (codigo, vigencia, tenant_id) DO UPDATE SET
    nome_amigavel = EXCLUDED.nome_amigavel,
    ncm = EXCLUDED.ncm,
    descricao_oficial = EXCLUDED.descricao_oficial,
    rec_pis = EXCLUDED.rec_pis,
    rec_cofins = EXCLUDED.rec_cofins,
    natureza_receita = EXCLUDED.natureza_receita,
    situacao = 'ativo',
    atualizado_em = now();

INSERT INTO public.categorias_fiscais (
    nome_amigavel, ncm, descricao_oficial, codigo, vigencia, rec_pis, rec_cofins, natureza_receita, tenant_id, situacao
) VALUES (
    'NAYLON OMBORGO PARAQUEDA 240 BORDO 09 100 POLIAMIDA', 
    '54074200', 
    'NAYLON OMBORGO PARAQUEDA 240 BORDO 09 100 POLIAMIDA', 
    'OMB0042', 
    '2026-07-01', 
    '300', 
    '300', 
    '1', 
    '11111111-1111-1111-1111-111111111111', 
    'ativo'
) ON CONFLICT (codigo, vigencia, tenant_id) DO UPDATE SET
    nome_amigavel = EXCLUDED.nome_amigavel,
    ncm = EXCLUDED.ncm,
    descricao_oficial = EXCLUDED.descricao_oficial,
    rec_pis = EXCLUDED.rec_pis,
    rec_cofins = EXCLUDED.rec_cofins,
    natureza_receita = EXCLUDED.natureza_receita,
    situacao = 'ativo',
    atualizado_em = now();

INSERT INTO public.categorias_fiscais (
    nome_amigavel, ncm, descricao_oficial, codigo, vigencia, rec_pis, rec_cofins, natureza_receita, tenant_id, situacao
) VALUES (
    'NAYLON OMBORGO PARAQUEDA 240 CINZA CLARO 17 100 POLIAMIDA', 
    '54074200', 
    'NAYLON OMBORGO PARAQUEDA 240 CINZA CLARO 17 100 POLIAMIDA', 
    'OMB0046', 
    '2026-07-01', 
    '0', 
    '0', 
    '1', 
    '11111111-1111-1111-1111-111111111111', 
    'ativo'
) ON CONFLICT (codigo, vigencia, tenant_id) DO UPDATE SET
    nome_amigavel = EXCLUDED.nome_amigavel,
    ncm = EXCLUDED.ncm,
    descricao_oficial = EXCLUDED.descricao_oficial,
    rec_pis = EXCLUDED.rec_pis,
    rec_cofins = EXCLUDED.rec_cofins,
    natureza_receita = EXCLUDED.natureza_receita,
    situacao = 'ativo',
    atualizado_em = now();

INSERT INTO public.categorias_fiscais (
    nome_amigavel, ncm, descricao_oficial, codigo, vigencia, rec_pis, rec_cofins, natureza_receita, tenant_id, situacao
) VALUES (
    'NAYLON OMBORGO PARAQUEDA RES 240 PRETO 15 100 POLIAMIDA', 
    '54074200', 
    'NAYLON OMBORGO PARAQUEDA RES 240 PRETO 15 100 POLIAMIDA', 
    'OMB0035', 
    '2024-02-01', 
    '300', 
    '300', 
    '1', 
    '11111111-1111-1111-1111-111111111111', 
    'ativo'
) ON CONFLICT (codigo, vigencia, tenant_id) DO UPDATE SET
    nome_amigavel = EXCLUDED.nome_amigavel,
    ncm = EXCLUDED.ncm,
    descricao_oficial = EXCLUDED.descricao_oficial,
    rec_pis = EXCLUDED.rec_pis,
    rec_cofins = EXCLUDED.rec_cofins,
    natureza_receita = EXCLUDED.natureza_receita,
    situacao = 'ativo',
    atualizado_em = now();

INSERT INTO public.categorias_fiscais (
    nome_amigavel, ncm, descricao_oficial, codigo, vigencia, rec_pis, rec_cofins, natureza_receita, tenant_id, situacao
) VALUES (
    'OVERLOQUE 250 GR 100%PES - PRETO', 
    '54023320', 
    'OVERLOQUE 250 GR 100%PES - PRETO', 
    '1550111', 
    '2026-07-01', 
    '0', 
    '0', 
    '1', 
    '11111111-1111-1111-1111-111111111111', 
    'ativo'
) ON CONFLICT (codigo, vigencia, tenant_id) DO UPDATE SET
    nome_amigavel = EXCLUDED.nome_amigavel,
    ncm = EXCLUDED.ncm,
    descricao_oficial = EXCLUDED.descricao_oficial,
    rec_pis = EXCLUDED.rec_pis,
    rec_cofins = EXCLUDED.rec_cofins,
    natureza_receita = EXCLUDED.natureza_receita,
    situacao = 'ativo',
    atualizado_em = now();

INSERT INTO public.categorias_fiscais (
    nome_amigavel, ncm, descricao_oficial, codigo, vigencia, rec_pis, rec_cofins, natureza_receita, tenant_id, situacao
) VALUES (
    'OXFORD AD FC CORES Largura 1 50m 230g mL 100 Poliester L27', 
    '54075210', 
    'OXFORD AD FC CORES Largura 1 50m 230g mL 100 Poliester L27', 
    '58', 
    '2024-11-01', 
    '200', 
    '200', 
    '1', 
    '11111111-1111-1111-1111-111111111111', 
    'ativo'
) ON CONFLICT (codigo, vigencia, tenant_id) DO UPDATE SET
    nome_amigavel = EXCLUDED.nome_amigavel,
    ncm = EXCLUDED.ncm,
    descricao_oficial = EXCLUDED.descricao_oficial,
    rec_pis = EXCLUDED.rec_pis,
    rec_cofins = EXCLUDED.rec_cofins,
    natureza_receita = EXCLUDED.natureza_receita,
    situacao = 'ativo',
    atualizado_em = now();

INSERT INTO public.categorias_fiscais (
    nome_amigavel, ncm, descricao_oficial, codigo, vigencia, rec_pis, rec_cofins, natureza_receita, tenant_id, situacao
) VALUES (
    'OXFORD INOVATORE COFFEE MARROM 100 PES', 
    '54075210', 
    'OXFORD INOVATORE COFFEE MARROM 100 PES', 
    'IMP0041', 
    '2026-07-01', 
    '200', 
    '200', 
    '1', 
    '11111111-1111-1111-1111-111111111111', 
    'ativo'
) ON CONFLICT (codigo, vigencia, tenant_id) DO UPDATE SET
    nome_amigavel = EXCLUDED.nome_amigavel,
    ncm = EXCLUDED.ncm,
    descricao_oficial = EXCLUDED.descricao_oficial,
    rec_pis = EXCLUDED.rec_pis,
    rec_cofins = EXCLUDED.rec_cofins,
    natureza_receita = EXCLUDED.natureza_receita,
    situacao = 'ativo',
    atualizado_em = now();

INSERT INTO public.categorias_fiscais (
    nome_amigavel, ncm, descricao_oficial, codigo, vigencia, rec_pis, rec_cofins, natureza_receita, tenant_id, situacao
) VALUES (
    'PIQUE PV FANE PRETO 4012 TUBULAR 65% PES 35% VISC', 
    '60064200', 
    'PIQUE PV FANE PRETO 4012 TUBULAR 65% PES 35% VISC', 
    'FAN0335', 
    '2023-11-01', 
    '300', 
    '300', 
    '1', 
    '11111111-1111-1111-1111-111111111111', 
    'ativo'
) ON CONFLICT (codigo, vigencia, tenant_id) DO UPDATE SET
    nome_amigavel = EXCLUDED.nome_amigavel,
    ncm = EXCLUDED.ncm,
    descricao_oficial = EXCLUDED.descricao_oficial,
    rec_pis = EXCLUDED.rec_pis,
    rec_cofins = EXCLUDED.rec_cofins,
    natureza_receita = EXCLUDED.natureza_receita,
    situacao = 'ativo',
    atualizado_em = now();

INSERT INTO public.categorias_fiscais (
    nome_amigavel, ncm, descricao_oficial, codigo, vigencia, rec_pis, rec_cofins, natureza_receita, tenant_id, situacao
) VALUES (
    'Piquet Ingles 53%Algodao,47% Poliester,larg.1,84mt,165 g/m2 - Cinza Grafeno', 
    '60069000', 
    'Piquet Ingles 53%Algodao,47% Poliester,larg.1,84mt,165 g/m2 - Cinza Grafeno', 
    '44001028', 
    '2026-07-01', 
    '0', 
    '0', 
    '1', 
    '11111111-1111-1111-1111-111111111111', 
    'ativo'
) ON CONFLICT (codigo, vigencia, tenant_id) DO UPDATE SET
    nome_amigavel = EXCLUDED.nome_amigavel,
    ncm = EXCLUDED.ncm,
    descricao_oficial = EXCLUDED.descricao_oficial,
    rec_pis = EXCLUDED.rec_pis,
    rec_cofins = EXCLUDED.rec_cofins,
    natureza_receita = EXCLUDED.natureza_receita,
    situacao = 'ativo',
    atualizado_em = now();

INSERT INTO public.categorias_fiscais (
    nome_amigavel, ncm, descricao_oficial, codigo, vigencia, rec_pis, rec_cofins, natureza_receita, tenant_id, situacao
) VALUES (
    'Piquet Ingles 53%Algodao,47% Poliester,larg.1,84mt,165 g/m2 - Piscina', 
    '60069000', 
    'Piquet Ingles 53%Algodao,47% Poliester,larg.1,84mt,165 g/m2 - Piscina', 
    '44001050', 
    '2026-07-01', 
    '0', 
    '0', 
    '1', 
    '11111111-1111-1111-1111-111111111111', 
    'ativo'
) ON CONFLICT (codigo, vigencia, tenant_id) DO UPDATE SET
    nome_amigavel = EXCLUDED.nome_amigavel,
    ncm = EXCLUDED.ncm,
    descricao_oficial = EXCLUDED.descricao_oficial,
    rec_pis = EXCLUDED.rec_pis,
    rec_cofins = EXCLUDED.rec_cofins,
    natureza_receita = EXCLUDED.natureza_receita,
    situacao = 'ativo',
    atualizado_em = now();

INSERT INTO public.categorias_fiscais (
    nome_amigavel, ncm, descricao_oficial, codigo, vigencia, rec_pis, rec_cofins, natureza_receita, tenant_id, situacao
) VALUES (
    'Piquet Ingles 53%Algodao,47% Poliester,larg.1,84mt,165 g/m2 - Preto', 
    '60069000', 
    'Piquet Ingles 53%Algodao,47% Poliester,larg.1,84mt,165 g/m2 - Preto', 
    '44001002', 
    '2026-07-01', 
    '0', 
    '0', 
    '1', 
    '11111111-1111-1111-1111-111111111111', 
    'ativo'
) ON CONFLICT (codigo, vigencia, tenant_id) DO UPDATE SET
    nome_amigavel = EXCLUDED.nome_amigavel,
    ncm = EXCLUDED.ncm,
    descricao_oficial = EXCLUDED.descricao_oficial,
    rec_pis = EXCLUDED.rec_pis,
    rec_cofins = EXCLUDED.rec_cofins,
    natureza_receita = EXCLUDED.natureza_receita,
    situacao = 'ativo',
    atualizado_em = now();

INSERT INTO public.categorias_fiscais (
    nome_amigavel, ncm, descricao_oficial, codigo, vigencia, rec_pis, rec_cofins, natureza_receita, tenant_id, situacao
) VALUES (
    'POLO MANGA CURTA', 
    '63090010', 
    'POLO MANGA CURTA', 
    '35', 
    '2024-09-01', 
    '103', 
    '103', 
    '7', 
    '11111111-1111-1111-1111-111111111111', 
    'ativo'
) ON CONFLICT (codigo, vigencia, tenant_id) DO UPDATE SET
    nome_amigavel = EXCLUDED.nome_amigavel,
    ncm = EXCLUDED.ncm,
    descricao_oficial = EXCLUDED.descricao_oficial,
    rec_pis = EXCLUDED.rec_pis,
    rec_cofins = EXCLUDED.rec_cofins,
    natureza_receita = EXCLUDED.natureza_receita,
    situacao = 'ativo',
    atualizado_em = now();

INSERT INTO public.categorias_fiscais (
    nome_amigavel, ncm, descricao_oficial, codigo, vigencia, rec_pis, rec_cofins, natureza_receita, tenant_id, situacao
) VALUES (
    'POLYCEDROBRIM CINZA 8047 67 CO 33PES', 
    '52113200', 
    'POLYCEDROBRIM CINZA 8047 67 CO 33PES', 
    'CED0156', 
    '2024-01-01', 
    '500', 
    '500', 
    '1', 
    '11111111-1111-1111-1111-111111111111', 
    'ativo'
) ON CONFLICT (codigo, vigencia, tenant_id) DO UPDATE SET
    nome_amigavel = EXCLUDED.nome_amigavel,
    ncm = EXCLUDED.ncm,
    descricao_oficial = EXCLUDED.descricao_oficial,
    rec_pis = EXCLUDED.rec_pis,
    rec_cofins = EXCLUDED.rec_cofins,
    natureza_receita = EXCLUDED.natureza_receita,
    situacao = 'ativo',
    atualizado_em = now();

INSERT INTO public.categorias_fiscais (
    nome_amigavel, ncm, descricao_oficial, codigo, vigencia, rec_pis, rec_cofins, natureza_receita, tenant_id, situacao
) VALUES (
    'POLYCEDROBRIM PETROLEO 8053 67 CO 33 PES', 
    '52113200', 
    'POLYCEDROBRIM PETROLEO 8053 67 CO 33 PES', 
    'CED0162', 
    '2024-05-01', 
    '500', 
    '500', 
    '1', 
    '11111111-1111-1111-1111-111111111111', 
    'ativo'
) ON CONFLICT (codigo, vigencia, tenant_id) DO UPDATE SET
    nome_amigavel = EXCLUDED.nome_amigavel,
    ncm = EXCLUDED.ncm,
    descricao_oficial = EXCLUDED.descricao_oficial,
    rec_pis = EXCLUDED.rec_pis,
    rec_cofins = EXCLUDED.rec_cofins,
    natureza_receita = EXCLUDED.natureza_receita,
    situacao = 'ativo',
    atualizado_em = now();

INSERT INTO public.categorias_fiscais (
    nome_amigavel, ncm, descricao_oficial, codigo, vigencia, rec_pis, rec_cofins, natureza_receita, tenant_id, situacao
) VALUES (
    'PV FANE BORDO 61019 67 PES 33 VISC', 
    '60064200', 
    'PV FANE BORDO 61019 67 PES 33 VISC', 
    'FAN0198', 
    '2024-02-01', 
    '300', 
    '300', 
    '1', 
    '11111111-1111-1111-1111-111111111111', 
    'ativo'
) ON CONFLICT (codigo, vigencia, tenant_id) DO UPDATE SET
    nome_amigavel = EXCLUDED.nome_amigavel,
    ncm = EXCLUDED.ncm,
    descricao_oficial = EXCLUDED.descricao_oficial,
    rec_pis = EXCLUDED.rec_pis,
    rec_cofins = EXCLUDED.rec_cofins,
    natureza_receita = EXCLUDED.natureza_receita,
    situacao = 'ativo',
    atualizado_em = now();

INSERT INTO public.categorias_fiscais (
    nome_amigavel, ncm, descricao_oficial, codigo, vigencia, rec_pis, rec_cofins, natureza_receita, tenant_id, situacao
) VALUES (
    'PV FANE NOITE 60724 67 PES 33 VISC', 
    '60064200', 
    'PV FANE NOITE 60724 67 PES 33 VISC', 
    'FAN0201', 
    '2024-02-01', 
    '300', 
    '300', 
    '1', 
    '11111111-1111-1111-1111-111111111111', 
    'ativo'
) ON CONFLICT (codigo, vigencia, tenant_id) DO UPDATE SET
    nome_amigavel = EXCLUDED.nome_amigavel,
    ncm = EXCLUDED.ncm,
    descricao_oficial = EXCLUDED.descricao_oficial,
    rec_pis = EXCLUDED.rec_pis,
    rec_cofins = EXCLUDED.rec_cofins,
    natureza_receita = EXCLUDED.natureza_receita,
    situacao = 'ativo',
    atualizado_em = now();

INSERT INTO public.categorias_fiscais (
    nome_amigavel, ncm, descricao_oficial, codigo, vigencia, rec_pis, rec_cofins, natureza_receita, tenant_id, situacao
) VALUES (
    'PV FANE VERDE BRASIL 62107 67 PES 33 VISC', 
    '60064200', 
    'PV FANE VERDE BRASIL 62107 67 PES 33 VISC', 
    'FAN0363', 
    '2023-11-01', 
    '300', 
    '300', 
    '1', 
    '11111111-1111-1111-1111-111111111111', 
    'ativo'
) ON CONFLICT (codigo, vigencia, tenant_id) DO UPDATE SET
    nome_amigavel = EXCLUDED.nome_amigavel,
    ncm = EXCLUDED.ncm,
    descricao_oficial = EXCLUDED.descricao_oficial,
    rec_pis = EXCLUDED.rec_pis,
    rec_cofins = EXCLUDED.rec_cofins,
    natureza_receita = EXCLUDED.natureza_receita,
    situacao = 'ativo',
    atualizado_em = now();

INSERT INTO public.categorias_fiscais (
    nome_amigavel, ncm, descricao_oficial, codigo, vigencia, rec_pis, rec_cofins, natureza_receita, tenant_id, situacao
) VALUES (
    'PV TUBULAR 28/1 VORTEX PRETO / 65% PES - 35% CV', 
    '60064200', 
    'PV TUBULAR 28/1 VORTEX PRETO / 65% PES - 35% CV', 
    '7002000075', 
    '2025-09-01', 
    '800', 
    '800', 
    '1', 
    '11111111-1111-1111-1111-111111111111', 
    'ativo'
) ON CONFLICT (codigo, vigencia, tenant_id) DO UPDATE SET
    nome_amigavel = EXCLUDED.nome_amigavel,
    ncm = EXCLUDED.ncm,
    descricao_oficial = EXCLUDED.descricao_oficial,
    rec_pis = EXCLUDED.rec_pis,
    rec_cofins = EXCLUDED.rec_cofins,
    natureza_receita = EXCLUDED.natureza_receita,
    situacao = 'ativo',
    atualizado_em = now();

INSERT INTO public.categorias_fiscais (
    nome_amigavel, ncm, descricao_oficial, codigo, vigencia, rec_pis, rec_cofins, natureza_receita, tenant_id, situacao
) VALUES (
    'RIBANA DOUBLE NANETE BRANCO 101 100 PES', 
    '55151900', 
    'RIBANA DOUBLE NANETE BRANCO 101 100 PES', 
    'NAN0049', 
    '2026-07-01', 
    '500', 
    '500', 
    '1', 
    '11111111-1111-1111-1111-111111111111', 
    'ativo'
) ON CONFLICT (codigo, vigencia, tenant_id) DO UPDATE SET
    nome_amigavel = EXCLUDED.nome_amigavel,
    ncm = EXCLUDED.ncm,
    descricao_oficial = EXCLUDED.descricao_oficial,
    rec_pis = EXCLUDED.rec_pis,
    rec_cofins = EXCLUDED.rec_cofins,
    natureza_receita = EXCLUDED.natureza_receita,
    situacao = 'ativo',
    atualizado_em = now();

INSERT INTO public.categorias_fiscais (
    nome_amigavel, ncm, descricao_oficial, codigo, vigencia, rec_pis, rec_cofins, natureza_receita, tenant_id, situacao
) VALUES (
    'RIBANA DOUBLE NANETE LARANJA 2912 100 PES', 
    '55151900', 
    'RIBANA DOUBLE NANETE LARANJA 2912 100 PES', 
    'NAN0056', 
    '2024-12-01', 
    '500', 
    '500', 
    '1', 
    '11111111-1111-1111-1111-111111111111', 
    'ativo'
) ON CONFLICT (codigo, vigencia, tenant_id) DO UPDATE SET
    nome_amigavel = EXCLUDED.nome_amigavel,
    ncm = EXCLUDED.ncm,
    descricao_oficial = EXCLUDED.descricao_oficial,
    rec_pis = EXCLUDED.rec_pis,
    rec_cofins = EXCLUDED.rec_cofins,
    natureza_receita = EXCLUDED.natureza_receita,
    situacao = 'ativo',
    atualizado_em = now();

INSERT INTO public.categorias_fiscais (
    nome_amigavel, ncm, descricao_oficial, codigo, vigencia, rec_pis, rec_cofins, natureza_receita, tenant_id, situacao
) VALUES (
    'RIBANA DOUBLE NANETE MARINHO 1317 100 PES', 
    '55151900', 
    'RIBANA DOUBLE NANETE MARINHO 1317 100 PES', 
    'NAN0059', 
    '2024-04-01', 
    '500', 
    '500', 
    '1', 
    '11111111-1111-1111-1111-111111111111', 
    'ativo'
) ON CONFLICT (codigo, vigencia, tenant_id) DO UPDATE SET
    nome_amigavel = EXCLUDED.nome_amigavel,
    ncm = EXCLUDED.ncm,
    descricao_oficial = EXCLUDED.descricao_oficial,
    rec_pis = EXCLUDED.rec_pis,
    rec_cofins = EXCLUDED.rec_cofins,
    natureza_receita = EXCLUDED.natureza_receita,
    situacao = 'ativo',
    atualizado_em = now();

INSERT INTO public.categorias_fiscais (
    nome_amigavel, ncm, descricao_oficial, codigo, vigencia, rec_pis, rec_cofins, natureza_receita, tenant_id, situacao
) VALUES (
    'RIBANA DOUBLE NANETE PRETO 301 100 PES', 
    '55151900', 
    'RIBANA DOUBLE NANETE PRETO 301 100 PES', 
    'NAN0064', 
    '2024-05-01', 
    '500', 
    '500', 
    '1', 
    '11111111-1111-1111-1111-111111111111', 
    'ativo'
) ON CONFLICT (codigo, vigencia, tenant_id) DO UPDATE SET
    nome_amigavel = EXCLUDED.nome_amigavel,
    ncm = EXCLUDED.ncm,
    descricao_oficial = EXCLUDED.descricao_oficial,
    rec_pis = EXCLUDED.rec_pis,
    rec_cofins = EXCLUDED.rec_cofins,
    natureza_receita = EXCLUDED.natureza_receita,
    situacao = 'ativo',
    atualizado_em = now();

INSERT INTO public.categorias_fiscais (
    nome_amigavel, ncm, descricao_oficial, codigo, vigencia, rec_pis, rec_cofins, natureza_receita, tenant_id, situacao
) VALUES (
    'Ribana Moletom Azul Royal', 
    '60062300', 
    'Ribana Moletom Azul Royal', 
    'MT-RIBMLT-AZ04', 
    '2026-07-01', 
    '102', 
    '102', 
    '49', 
    '11111111-1111-1111-1111-111111111111', 
    'ativo'
) ON CONFLICT (codigo, vigencia, tenant_id) DO UPDATE SET
    nome_amigavel = EXCLUDED.nome_amigavel,
    ncm = EXCLUDED.ncm,
    descricao_oficial = EXCLUDED.descricao_oficial,
    rec_pis = EXCLUDED.rec_pis,
    rec_cofins = EXCLUDED.rec_cofins,
    natureza_receita = EXCLUDED.natureza_receita,
    situacao = 'ativo',
    atualizado_em = now();

INSERT INTO public.categorias_fiscais (
    nome_amigavel, ncm, descricao_oficial, codigo, vigencia, rec_pis, rec_cofins, natureza_receita, tenant_id, situacao
) VALUES (
    'Ribana Moletom Cinza Chumbo', 
    '60062300', 
    'Ribana Moletom Cinza Chumbo', 
    'MT-RIBMLT-CZ04', 
    '2026-06-01', 
    '102', 
    '102', 
    '49', 
    '11111111-1111-1111-1111-111111111111', 
    'ativo'
) ON CONFLICT (codigo, vigencia, tenant_id) DO UPDATE SET
    nome_amigavel = EXCLUDED.nome_amigavel,
    ncm = EXCLUDED.ncm,
    descricao_oficial = EXCLUDED.descricao_oficial,
    rec_pis = EXCLUDED.rec_pis,
    rec_cofins = EXCLUDED.rec_cofins,
    natureza_receita = EXCLUDED.natureza_receita,
    situacao = 'ativo',
    atualizado_em = now();

INSERT INTO public.categorias_fiscais (
    nome_amigavel, ncm, descricao_oficial, codigo, vigencia, rec_pis, rec_cofins, natureza_receita, tenant_id, situacao
) VALUES (
    'Ribana Moletom Marrom', 
    '60062300', 
    'Ribana Moletom Marrom', 
    'MT-RIBMLT-MR02', 
    '2026-07-01', 
    '102', 
    '102', 
    '49', 
    '11111111-1111-1111-1111-111111111111', 
    'ativo'
) ON CONFLICT (codigo, vigencia, tenant_id) DO UPDATE SET
    nome_amigavel = EXCLUDED.nome_amigavel,
    ncm = EXCLUDED.ncm,
    descricao_oficial = EXCLUDED.descricao_oficial,
    rec_pis = EXCLUDED.rec_pis,
    rec_cofins = EXCLUDED.rec_cofins,
    natureza_receita = EXCLUDED.natureza_receita,
    situacao = 'ativo',
    atualizado_em = now();

INSERT INTO public.categorias_fiscais (
    nome_amigavel, ncm, descricao_oficial, codigo, vigencia, rec_pis, rec_cofins, natureza_receita, tenant_id, situacao
) VALUES (
    'Ribana Moletom Preta', 
    '60062300', 
    'Ribana Moletom Preta', 
    'MT-RIBMLT-PR01', 
    '2026-04-01', 
    '102', 
    '102', 
    '49', 
    '11111111-1111-1111-1111-111111111111', 
    'ativo'
) ON CONFLICT (codigo, vigencia, tenant_id) DO UPDATE SET
    nome_amigavel = EXCLUDED.nome_amigavel,
    ncm = EXCLUDED.ncm,
    descricao_oficial = EXCLUDED.descricao_oficial,
    rec_pis = EXCLUDED.rec_pis,
    rec_cofins = EXCLUDED.rec_cofins,
    natureza_receita = EXCLUDED.natureza_receita,
    situacao = 'ativo',
    atualizado_em = now();

INSERT INTO public.categorias_fiscais (
    nome_amigavel, ncm, descricao_oficial, codigo, vigencia, rec_pis, rec_cofins, natureza_receita, tenant_id, situacao
) VALUES (
    'RIBANA PV FANE BORDO 61019 67 PES 33 VISC', 
    '60069000', 
    'RIBANA PV FANE BORDO 61019 67 PES 33 VISC', 
    'FAN0263', 
    '2024-02-01', 
    '500', 
    '500', 
    '1', 
    '11111111-1111-1111-1111-111111111111', 
    'ativo'
) ON CONFLICT (codigo, vigencia, tenant_id) DO UPDATE SET
    nome_amigavel = EXCLUDED.nome_amigavel,
    ncm = EXCLUDED.ncm,
    descricao_oficial = EXCLUDED.descricao_oficial,
    rec_pis = EXCLUDED.rec_pis,
    rec_cofins = EXCLUDED.rec_cofins,
    natureza_receita = EXCLUDED.natureza_receita,
    situacao = 'ativo',
    atualizado_em = now();

INSERT INTO public.categorias_fiscais (
    nome_amigavel, ncm, descricao_oficial, codigo, vigencia, rec_pis, rec_cofins, natureza_receita, tenant_id, situacao
) VALUES (
    'RIBANA PV FANE NOITE 60724 67 PES 33 VISC', 
    '60069000', 
    'RIBANA PV FANE NOITE 60724 67 PES 33 VISC', 
    'FAN0278', 
    '2024-03-01', 
    '500', 
    '500', 
    '1', 
    '11111111-1111-1111-1111-111111111111', 
    'ativo'
) ON CONFLICT (codigo, vigencia, tenant_id) DO UPDATE SET
    nome_amigavel = EXCLUDED.nome_amigavel,
    ncm = EXCLUDED.ncm,
    descricao_oficial = EXCLUDED.descricao_oficial,
    rec_pis = EXCLUDED.rec_pis,
    rec_cofins = EXCLUDED.rec_cofins,
    natureza_receita = EXCLUDED.natureza_receita,
    situacao = 'ativo',
    atualizado_em = now();

INSERT INTO public.categorias_fiscais (
    nome_amigavel, ncm, descricao_oficial, codigo, vigencia, rec_pis, rec_cofins, natureza_receita, tenant_id, situacao
) VALUES (
    'RIBANA PV PRETO / 57,8% PES - 30,2% CV - 12% PUE', 
    '60064200', 
    'RIBANA PV PRETO / 57,8% PES - 30,2% CV - 12% PUE', 
    '7002000065', 
    '2025-09-01', 
    '800', 
    '800', 
    '1', 
    '11111111-1111-1111-1111-111111111111', 
    'ativo'
) ON CONFLICT (codigo, vigencia, tenant_id) DO UPDATE SET
    nome_amigavel = EXCLUDED.nome_amigavel,
    ncm = EXCLUDED.ncm,
    descricao_oficial = EXCLUDED.descricao_oficial,
    rec_pis = EXCLUDED.rec_pis,
    rec_cofins = EXCLUDED.rec_cofins,
    natureza_receita = EXCLUDED.natureza_receita,
    situacao = 'ativo',
    atualizado_em = now();

INSERT INTO public.categorias_fiscais (
    nome_amigavel, ncm, descricao_oficial, codigo, vigencia, rec_pis, rec_cofins, natureza_receita, tenant_id, situacao
) VALUES (
    'TECHNO SPEED CHUMBO WATERPROOF 100% PES', 
    '54075210', 
    'TECHNO SPEED CHUMBO WATERPROOF 100% PES', 
    'ADA0069', 
    '2026-06-01', 
    '100', 
    '100', 
    '1', 
    '11111111-1111-1111-1111-111111111111', 
    'ativo'
) ON CONFLICT (codigo, vigencia, tenant_id) DO UPDATE SET
    nome_amigavel = EXCLUDED.nome_amigavel,
    ncm = EXCLUDED.ncm,
    descricao_oficial = EXCLUDED.descricao_oficial,
    rec_pis = EXCLUDED.rec_pis,
    rec_cofins = EXCLUDED.rec_cofins,
    natureza_receita = EXCLUDED.natureza_receita,
    situacao = 'ativo',
    atualizado_em = now();

INSERT INTO public.categorias_fiscais (
    nome_amigavel, ncm, descricao_oficial, codigo, vigencia, rec_pis, rec_cofins, natureza_receita, tenant_id, situacao
) VALUES (
    'TECHNO SPEED CHUMBO WATERPROOF 100% PES', 
    '54075210', 
    'TECHNO SPEED CHUMBO WATERPROOF 100% PES', 
    'ADA0069', 
    '2026-06-18', 
    '100', 
    '100', 
    '1', 
    '11111111-1111-1111-1111-111111111111', 
    'ativo'
) ON CONFLICT (codigo, vigencia, tenant_id) DO UPDATE SET
    nome_amigavel = EXCLUDED.nome_amigavel,
    ncm = EXCLUDED.ncm,
    descricao_oficial = EXCLUDED.descricao_oficial,
    rec_pis = EXCLUDED.rec_pis,
    rec_cofins = EXCLUDED.rec_cofins,
    natureza_receita = EXCLUDED.natureza_receita,
    situacao = 'ativo',
    atualizado_em = now();

INSERT INTO public.categorias_fiscais (
    nome_amigavel, ncm, descricao_oficial, codigo, vigencia, rec_pis, rec_cofins, natureza_receita, tenant_id, situacao
) VALUES (
    'TECNOSPORT ULTRAMARINE GREEN (BANDEIRA) 100 PES', 
    '54075210', 
    'TECNOSPORT ULTRAMARINE GREEN (BANDEIRA) 100 PES', 
    'IMP0082', 
    '2026-07-01', 
    '100', 
    '100', 
    '1', 
    '11111111-1111-1111-1111-111111111111', 
    'ativo'
) ON CONFLICT (codigo, vigencia, tenant_id) DO UPDATE SET
    nome_amigavel = EXCLUDED.nome_amigavel,
    ncm = EXCLUDED.ncm,
    descricao_oficial = EXCLUDED.descricao_oficial,
    rec_pis = EXCLUDED.rec_pis,
    rec_cofins = EXCLUDED.rec_cofins,
    natureza_receita = EXCLUDED.natureza_receita,
    situacao = 'ativo',
    atualizado_em = now();
COMMIT;
