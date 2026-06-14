import { useEffect, useState } from 'react'
import { useStore } from '@/store'
import { useSync } from '@/hooks/useSync'
import { Loading } from '@/components/ui/Loading'
import { Toast } from '@/components/ui/Toast'
import { Header } from '@/components/ui/Header'
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
import { gerarId, formatarDataBR, dataStrParaDate, getISOWeek, hoje } from '@/lib/utils'

export default function App() {
  const { activeTab, loading, setTab, clientes, setClientes, agendamentos, setAgendamentos, showToast } = useStore()
  const { checkAPI } = useSync()

  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [checkoutSvcs, setCheckoutSvcs] = useState<string[]>([])
  const [checkoutTotal, setCheckoutTotal] = useState(0)
  const [seletorOpen, setSeletorOpen] = useState(false)
  const [seletorBusca, setSeletorBusca] = useState('')
  const [checkoutDados, setCheckoutDados] = useState<FechamentoDados | null>(null)

  useEffect(() => { checkAPI() }, [])

  function handleOrcamentoFechar(svcs: string[], total: number) {
    setCheckoutSvcs(svcs)
    setCheckoutTotal(total)
    setCheckoutOpen(true)
  }

  function handleCheckoutConfirmar(dados: FechamentoDados) {
    setCheckoutDados(dados)
    setCheckoutOpen(false)
    setSeletorOpen(true)
    setSeletorBusca('')
  }

  function handleClienteSelecionado(clienteId: string) {
    setSeletorOpen(false)
    setTab('agenda')
    showToast('✅ Selecione data e horário!')
  }

  const clientesFiltrados = seletorBusca
    ? clientes.filter(c => c.nome?.toLowerCase().includes(seletorBusca.toLowerCase()) || (c.tel || '').includes(seletorBusca))
    : clientes

  const renderTab = () => {
    switch (activeTab) {
      case 'orcamento':  return <Orcamento onFechar={handleOrcamentoFechar} />
      case 'combos':     return <Combos onSelecionarCombo={() => setTab('orcamento')} />
      case 'agenda':     return <Agenda />
      case 'clientes':   return <Clientes />
      case 'financeiro': return <Financeiro />
      case 'custos':     return <Custos />
      case 'config':     return <Config />
      case 'diluidor':   return <Diluidor />
      default:           return null
    }
  }

  // Header height: logo row ~52px + tab row ~56px = 108px
  const HEADER_H = 108

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', minHeight: '100vh', background: 'var(--preto)', position: 'relative' }}>
      <Loading />
      <Toast />

      {!loading && (
        <>
          <Header />
          <main style={{ paddingTop: `${HEADER_H}px`, paddingBottom: '24px', paddingLeft: '16px', paddingRight: '16px', minHeight: '100vh' }}>
            <div className="animate-fadeUp" key={activeTab}>
              {renderTab()}
            </div>
          </main>
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
      {seletorOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 10003, background: 'var(--preto)', overflowY: 'auto' }}>
          <div style={{ maxWidth: '500px', margin: '0 auto', padding: '20px 16px 40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ fontSize: '18px', fontWeight: 700 }}>Selecionar Cliente</div>
              <button onClick={() => setSeletorOpen(false)} style={{ background: '#1c1c1c', border: '1px solid #333', color: '#ccc', padding: '8px 14px', borderRadius: '10px', cursor: 'pointer' }}>✕</button>
            </div>
            <input value={seletorBusca} onChange={e => setSeletorBusca(e.target.value)}
              placeholder="Buscar cliente..."
              style={{ width: '100%', background: 'var(--card)', border: '1px solid var(--borda)', borderRadius: '12px', padding: '12px 16px', color: 'var(--texto)', marginBottom: '12px', outline: 'none' }} />
            {clientesFiltrados.map(c => (
              <button key={c.id} onClick={() => handleClienteSelecionado(c.id)}
                style={{ width: '100%', textAlign: 'left', background: 'var(--card)', border: '1px solid var(--borda)', borderRadius: '14px', padding: '14px', marginBottom: '8px', cursor: 'pointer', color: 'var(--texto)' }}>
                <div style={{ fontSize: '15px', fontWeight: 600 }}>{c.nome}</div>
                <div style={{ fontSize: '12px', color: 'var(--dim)', marginTop: '3px' }}>
                  {c.tel}{c.marca ? ` · ${c.marca} ${c.modelo || ''}` : ''}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
