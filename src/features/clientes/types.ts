export type TipoCliente = "pessoa_fisica" | "empresa";
export type StatusCliente = "ativo" | "inativo";

export interface ClienteArquivo {
  id: string;
  nome: string;
  tipo: string; // mime
  extensao: string;
  tamanho: number; // bytes
  dataUrl: string; // base64 data url
  criadoEm: string; // ISO date
}

interface ClienteBase {
  id: string;
  tipo: TipoCliente;
  telefone: string;
  email?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  observacoes?: string;
  status: StatusCliente;
  dataCadastro: string; // ISO date (yyyy-mm-dd)
  criadoEm: string; // ISO timestamp
  atualizadoEm: string; // ISO timestamp
  imagem?: string; // avatar/logo data url
  arquivos: ClienteArquivo[];
  // Reservado para expansão futura (pedidos, orçamentos, notas, matrizes, logos, histórico)
}

export interface ClientePessoaFisica extends ClienteBase {
  tipo: "pessoa_fisica";
  nome: string;
  cpf?: string;
}

export interface ClienteEmpresa extends ClienteBase {
  tipo: "empresa";
  nomeEmpresa: string;
  responsavel: string;
  cnpj?: string;
  inscricaoEstadual?: string;
}

export type Cliente = ClientePessoaFisica | ClienteEmpresa;

export type ClienteInput = Omit<Cliente, "id" | "criadoEm" | "atualizadoEm" | "arquivos" | "status"> & {
  status?: StatusCliente;
  arquivos?: ClienteArquivo[];
};

export function getClienteNome(cliente: Cliente): string {
  return cliente.tipo === "empresa" ? cliente.nomeEmpresa : cliente.nome;
}

export function getClienteResponsavel(cliente: Cliente): string | undefined {
  return cliente.tipo === "empresa" ? cliente.responsavel : undefined;
}
