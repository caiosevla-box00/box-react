import { useEffect, useState } from 'react'
import { useStore } from '@/store'
import { useSync } from '@/hooks/useSync'
import { Loading } from '@/components/ui/Loading'
import { Toast } from '@/components/ui/Toast'
import { Header } from '@/components/ui/Header'
import { TabBar } from '@/components/ui/TabBar'
import { Orcamento } from '@/components/tabs/Orcamento'
import { Combos } from '@/components/tabs/Combos'
import { Agenda } from '@/components/tabs/Agenda'
import { Clientes } from '@/components/tabs/Clientes'
import { Financeiro } from '@/components/tabs/Financeiro'
import { Custos } from '@/components/tabs/Custos'
import { Config } from '@/components/tabs/Config'
import { Diluidor } from '@/components/tabs/Diluidor'
import { Checkout } from '@/components/modals/Checkout'
import type { FechamentoDados } from '@/types'
import { apiCall } from '@/lib/api'
import { hoje, formatarDataBR, dataStrParaDate, gerarId, getISOWeek } from '@/lib/utils'

export default function App() {
  const { activeTab, loading, setTab, clientes, setClientes, agendamentos, setAgendamentos, showToast } = useStore()
  const { checkAPI } = useSync()

  // Estado do checkout (orçamento → seletor cliente → agendamento)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [checkoutSvcs, setCheckoutSvcs] = useState<string[]>([])
  const [checkoutTotal, setCheckoutTotal] = useState(0)
  const [checkoutDados, setCheckoutDados] = useState<FechamentoDados | null>(null)
  const [seletorClienteOpen, setSeletorClienteOpen] = useState(false)
  const [seletorBusca, setSeletorBusca] = useState('')
  const [clienteSelecionado, setClienteSelecionado] = useState<string | null>(null)

  useEffect(() => { checkAPI() }, [])

  function handleOrcamentoFechar(svcs: string[], total: number) {
    setCheckoutSvcs(svcs)
    setCheckoutTotal(total)
    setCheckoutOpen(true)
  }

  function handleCheckoutConfirmar(dados: FechamentoDados) {
    setCheckoutDados(dados)
    setCheckoutOpen(false)
    setSeletorClienteOpen(true)
    setSeletorBusca('')
  }

  function handleClienteSelecionado(clienteId: string) {
    setClienteSelecionado(clienteId)
    setSeletorClienteOpen(false)
    // Vai para agenda para agendar
    setTab('agenda')
    showToast('✅ Cliente selecionado! Agende o horário.')
  }

  const clientesFiltrados = seletorBusca
    ? clientes.filter(c => c.nome?.toLowerCase().includes(seletorBusca.toLowerCase()) || c.tel?.includes(seletorBusca))
    : clientes

  const renderTab = () => {
    switch (activeTab) {
      case 'orcamento':  return <Orcamento onFechar={handleOrcamentoFechar} />
      case 'combos':     return <Combos onSelecionarCombo={(svcs) => { setTab('orcamento') }} />
      case 'agenda':     return <Agenda />
      case 'clientes':   return <Clientes />
      case 'financeiro': return <Financeiro />
      case 'custos':     return <Custos />
      case 'config':     return <Config />
      case 'diluidor':   return <Diluidor />
      default:           return null
    }
  }

  return (
    <div className="relative min-h-screen max-w-[500px] mx-auto" style={{ background: '#080808' }}>
      <Loading />
      <Toast />

      {!loading && (
        <>
          <Header />
          <main style={{ paddingTop: '72px', paddingBottom: '80px', paddingLeft: '16px', paddingRight: '16px', minHeight: '100vh', overflowY: 'auto' }}>
            {renderTab()}
          </main>
          <TabBar />
        </>
      )}

      {/* Checkout do orçamento */}
      {checkoutOpen && (
        <Checkout
          valorInicial={checkoutTotal}
          svcsTexto={checkoutSvcs.join(' + ')}
          onConfirmar={handleCheckoutConfirmar}
          onCancelar={() => setCheckoutOpen(false)}
        />
      )}

      {/* Seletor de cliente */}
      {seletorClienteOpen && (
        <div className="fixed inset-0 z-[10003] overflow-y-auto" style={{ background: '#080808' }}>
          <div className="max-w-[500px] mx-auto p-4 pb-20">
            <div className="flex justify-between items-center mb-5">
              <div className="font-bebas text-2xl tracking-widest" style={{ color: 'var(--verde)' }}>SELECIONAR CLIENTE</div>
              <button onClick={() => setSeletorClienteOpen(false)}
                className="px-4 py-2 rounded-lg font-barlow text-sm font-bold"
                style={{ background: '#1c1c1c', border: '1px solid #333', color: '#ccc' }}>✕</button>
            </div>
            <div className="relative mb-4">
              <input value={seletorBusca} onChange={e => setSeletorBusca(e.target.value)}
                placeholder="Buscar cliente..."
                className="w-full rounded-xl py-3 px-4 text-sm outline-none"
                style={{ background: '#111', border: '1px solid var(--borda)', color: 'var(--texto)' }} />
            </div>
            {clientesFiltrados.map(c => (
              <button key={c.id} onClick={() => handleClienteSelecionado(c.id)}
                className="w-full text-left rounded-xl p-4 mb-2"
                style={{ background: 'var(--card)', border: '1px solid var(--borda)' }}>
                <div className="font-barlow font-bold text-base">{c.nome}</div>
                <div className="font-barlow text-xs mt-1" style={{ color: 'var(--dim)' }}>
                  {c.tel} {c.marca && `· ${c.marca} ${c.modelo}`}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
