import { useEffect, useState } from 'react'
import { useStore } from '@/store'
import { useSync } from '@/hooks/useSync'
import { Loading } from '@/components/ui/Loading'
import { Toast } from '@/components/ui/Toast'
import { Header } from '@/components/ui/Header'
import { BottomNav } from '@/components/ui/BottomNav'
import { Home } from '@/components/tabs/Home'
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

export default function App() {
  const { activeTab, loading, setTab, clientes, showToast } = useStore()
  const { checkAPI } = useSync()

  const [headerH, setHeaderH] = useState(66)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [checkoutSvcs, setCheckoutSvcs] = useState<string[]>([])
  const [checkoutTotal, setCheckoutTotal] = useState(0)
  const [checkoutSvcIds, setCheckoutSvcIds] = useState<string[]>([])
  const [checkoutDelivery, setCheckoutDelivery] = useState(0)
  const [checkoutDesconto, setCheckoutDesconto] = useState(0)
  const [seletorOpen, setSeletorOpen] = useState(false)
  const [seletorBusca, setSeletorBusca] = useState('')

  useEffect(() => { checkAPI() }, [])

  // Measure header height
  useEffect(() => {
    const measure = () => {
      const el = document.getElementById('app-header')
      if (el) setHeaderH(el.offsetHeight)
    }
    measure()
    window.addEventListener('resize', measure)
    setTimeout(measure, 600)
    return () => window.removeEventListener('resize', measure)
  }, [loading])

  function handleOrcamentoFechar(svcs: string[], total: number, svcIds: string[], delivery = 0, desconto = 0) {
    setCheckoutSvcs(svcs); setCheckoutTotal(total); setCheckoutSvcIds(svcIds)
    setCheckoutDelivery(delivery); setCheckoutDesconto(desconto)
    setCheckoutOpen(true)
  }
  function handleCheckoutConfirmar(_d: FechamentoDados) {
    setCheckoutOpen(false); setSeletorOpen(true); setSeletorBusca('')
  }
  function handleClienteSelecionado(_id: string) {
    setSeletorOpen(false); setTab('agenda'); showToast('✅ Selecione data e horário!')
  }

  const clientesFil = seletorBusca
    ? clientes.filter(c => c.nome?.toLowerCase().includes(seletorBusca.toLowerCase()) || (c.tel || '').includes(seletorBusca))
    : clientes

  const BOTTOM_H = 64 // bottom nav height

  const renderTab = () => {
    switch (activeTab) {
      case 'home':       return <Home />
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

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', minHeight: '100vh', background: 'var(--bg)' }}>
      <Loading />
      <Toast />

      {!loading && (
        <>
          <Header />
          <main style={{
            paddingTop: `${headerH + 8}px`,
            paddingBottom: `${BOTTOM_H + 16}px`,
            paddingLeft: '16px',
            paddingRight: '16px',
          }}>
            <div className="animate-fadeUp" key={activeTab}>
              {renderTab()}
            </div>
          </main>
          <BottomNav />
        </>
      )}

      {checkoutOpen && (
        <Checkout
          valorInicial={checkoutTotal}
          svcsTexto={checkoutSvcs.join(' + ')}
          svcIds={checkoutSvcIds}
          delivery={checkoutDelivery}
          desconto={checkoutDesconto}
          onConfirmar={handleCheckoutConfirmar}
          onCancelar={() => setCheckoutOpen(false)}
        />
      )}

      {seletorOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 10003, background: 'var(--bg)', overflowY: 'auto' }}>
          <div style={{ maxWidth: '500px', margin: '0 auto', padding: '20px 16px 40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ fontSize: '18px', fontWeight: 700 }}>Selecionar Cliente</div>
              <button onClick={() => setSeletorOpen(false)} style={{ background: 'var(--surface)', border: '1px solid var(--borda)', color: 'var(--texto)', padding: '8px 14px', borderRadius: '10px', cursor: 'pointer' }}>✕</button>
            </div>
            <input value={seletorBusca} onChange={e => setSeletorBusca(e.target.value)}
              placeholder="Buscar cliente..."
              style={{ width: '100%', background: 'var(--surface)', border: '1px solid var(--borda)', borderRadius: '12px', padding: '12px 16px', color: 'var(--texto)', marginBottom: '12px', outline: 'none' }} />
            {clientesFil.map(c => (
              <button key={c.id} onClick={() => handleClienteSelecionado(c.id)}
                style={{ width: '100%', textAlign: 'left', background: 'var(--surface)', border: '1px solid var(--borda)', borderRadius: '14px', padding: '14px', marginBottom: '8px', cursor: 'pointer', color: 'var(--texto)' }}>
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
