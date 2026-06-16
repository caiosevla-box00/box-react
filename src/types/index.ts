export interface Atendimento {
  id: string
  clienteId: string
  nomeCliente?: string
  data: string
  semana?: string
  mes?: string
  ano?: string
  servicos: string
  valor: number | string
  obs?: string
  formaPagamento?: string
  parcelas?: number | string
  taxaPct?: number | string
  valorCobrado?: number | string
  custoTaxa?: number | string
  valorLiquido?: number | string
  divContas?: number | string
  divMaquinas?: number | string
  divEstoque?: number | string
  divLucro?: number | string
  criadoEm?: string
}

export interface Cliente {
  id: string
  nome: string
  email?: string
  tel?: string
  ig?: string
  origem?: string
  tipoVeiculo?: string
  marca?: string
  modelo?: string
  ano?: string
  cor?: string
  criadoEm?: string
  atendimentos?: Atendimento[]
}

export interface Agendamento {
  id: string
  clienteId: string
  data: string
  hora: string
  duracao: number
  servico: string
  svcId?: string
  obs?: string
  status: 'agendado' | 'concluido' | 'pago' | 'cancelado'
  valorAcordado?: number | string
  fechamentoJSON?: string
  obsEncerramento?: string
  criadoEm?: string
}

export interface Saida {
  id: string
  desc: string
  valor: number | string
  data: string
  criadoEm?: string
}

export interface Servico {
  id: string
  num: string
  nome: string
  tempo: string
  base: { hatch: number; sedan: number; suv: number }
  desc: string
}

export interface Combo {
  id: string
  nome: string
  svcs: string[]
  desc: string
  tag: string
}

export type TabId = 'home' | 'orcamento' | 'combos' | 'agenda' | 'clientes' | 'financeiro' | 'custos' | 'config' | 'diluidor'

export type TipoVeiculo = 'hatch' | 'sedan' | 'suv'

export interface FechamentoDados {
  svcs: string
  formaPagamento: string
  parcelas: number
  taxaPct: number
  valorOriginal: number
  valorCobrado: number
  custoTaxa: number
  liquido: number
  divisao: {
    contas: number
    maquinas: number
    estoque: number
    lucro: number
  }
}

export interface ProdutoDiluidor {
  nome: string
  parteProd: number
  parteAgua: number
}
