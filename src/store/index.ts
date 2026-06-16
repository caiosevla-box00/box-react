import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Cliente, Agendamento, Saida, TabId, TipoVeiculo } from '@/types'
import { SERVICOS } from '@/lib/servicos'

type Precos = Record<string, { hatch: number; sedan: number; suv: number }>

function initPrecos(): Precos {
  const p: Precos = {}
  SERVICOS.forEach(s => { p[s.id] = { ...s.base } })
  return p
}

interface AppState {
  // UI
  activeTab: TabId
  apiOnline: boolean
  loading: boolean
  loadingStep: string
  loadingPct: number
  toast: string | null

  // Data
  clientes: Cliente[]
  agendamentos: Agendamento[]
  saidas: Saida[]
  precos: Precos
  finCache: any[]

  // Config
  divisao: { contas: number; maquinas: number; estoque: number; lucro: number }
  meta: number
  taxaDebito: number
  taxaCredito: number[]
  custoPorKm: number
  servicosCustom: { id: string; nome: string; tempo: string; desc: string; hatch: number; sedan: number; suv: number; categoria: string }[]

  // Veiculo selecionado
  veiculo: TipoVeiculo

  // Actions
  setTab: (tab: TabId) => void
  setApiOnline: (v: boolean) => void
  setLoading: (v: boolean, step?: string, pct?: number) => void
  setLoadingStep: (step: string, pct: number) => void
  showToast: (msg: string) => void
  clearToast: () => void
  setVeiculo: (v: TipoVeiculo) => void
  setClientes: (c: Cliente[]) => void
  setAgendamentos: (a: Agendamento[]) => void
  setSaidas: (s: Saida[]) => void
  setPrecos: (p: Precos) => void
  setFinCache: (d: any[]) => void
  setDivisao: (d: AppState['divisao']) => void
  setMeta: (m: number) => void
  setCustoPorKm: (v: number) => void
  setServicosCustom: (s: AppState['servicosCustom']) => void
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      activeTab: 'home' as TabId,
      apiOnline: false,
      loading: true,
      loadingStep: 'Iniciando...',
      loadingPct: 0,
      toast: null,
      clientes: [],
      agendamentos: [],
      saidas: [],
      precos: initPrecos(),
      finCache: [],
      divisao: { contas: 10, maquinas: 10, estoque: 20, lucro: 60 },
      meta: 0,
      taxaDebito: 1.5,
      taxaCredito: [0, 3.49, 4.49, 5.49, 5.99, 6.49, 6.99, 7.49, 7.99, 8.49, 8.99, 9.49, 9.99],
      custoPorKm: 0,
      servicosCustom: [],
      veiculo: 'hatch',

      setTab: (tab) => set({ activeTab: tab }),
      setApiOnline: (v) => set({ apiOnline: v }),
      setLoading: (v, step, pct) => set({ loading: v, loadingStep: step ?? '', loadingPct: pct ?? 0 }),
      setLoadingStep: (step, pct) => set({ loadingStep: step, loadingPct: pct }),
      showToast: (msg) => set({ toast: msg }),
      clearToast: () => set({ toast: null }),
      setVeiculo: (v) => set({ veiculo: v }),
      setClientes: (c) => set({ clientes: c }),
      setAgendamentos: (a) => set({ agendamentos: a }),
      setSaidas: (s) => set({ saidas: s }),
      setPrecos: (p) => set({ precos: p }),
      setFinCache: (d) => set({ finCache: d }),
      setDivisao: (d) => set({ divisao: d }),
      setMeta: (m) => set({ meta: m }),
      setCustoPorKm: (v) => set({ custoPorKm: v }),
      setServicosCustom: (s) => set({ servicosCustom: s }),
    }),
    {
      name: 'box00-store-v1',
      partialize: (state) => ({
        clientes: state.clientes,
        agendamentos: state.agendamentos,
        saidas: state.saidas,
        precos: state.precos,
        finCache: state.finCache,
        divisao: state.divisao,
        meta: state.meta,
        taxaDebito: state.taxaDebito,
        taxaCredito: state.taxaCredito,
        veiculo: state.veiculo,
        custoPorKm: state.custoPorKm,
        servicosCustom: state.servicosCustom,
      }),
    }
  )
)
