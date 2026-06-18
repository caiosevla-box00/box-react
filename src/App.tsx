import { useEffect, useState } from 'react'
import { useStore } from '@/store'
import { useSync } from '@/hooks/useSync'
import { Loading } from '@/components/ui/Loading'
import { Toast } from '@/components/ui/Toast'
import { Header } from '@/components/ui/Header'
import { BottomNav } from '@/components/ui/BottomNav'
import { TokenGate } from '@/components/ui/TokenGate'
import { AcaoOrcamento } from '@/components/modals/AcaoOrcamento'
import { Home } from '@/components/tabs/Home'
import { Orcamento } from '@/components/tabs/Orcamento'
import { Combos } from '@/components/tabs/Combos'
import { Agenda } from '@/components/tabs/Agenda'
import { Clientes } from '@/components/tabs/Clientes'
import { Financeiro } from '@/components/tabs/Financeiro'
import { Custos } from '@/components/tabs/Custos'
import { Config } from '@/components/tabs/Config'
import { Diluidor } from '@/components/tabs/Diluidor'

export default function App() {
  const { activeTab, loading, setTab } = useStore()
  const { checkAPI } = useSync()

  const [headerH, setHeaderH] = useState(66)

  // Estado do orçamento fechado
  const [acaoOpen, setAcaoOpen] = useState(false)
  const [acaoSvcs, setAcaoSvcs] = useState<string[]>([])
  const [acaoSvcIds, setAcaoSvcIds] = useState<string[]>([])
  const [acaoTotal, setAcaoTotal] = useState(0)
  const [acaoDelivery, setAcaoDelivery] = useState(0)
  const [acaoDesconto, setAcaoDesconto] = useState(0)
  const [acaoVeiculo, setAcaoVeiculo] = useState<'hatch'|'sedan'|'suv'>('hatch')
  const [acaoPDFDados, setAcaoPDFDados] = useState<any>(null)

  useEffect(() => { checkAPI() }, [])

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

  function handleOrcamentoFechar(svcs: string[], total: number, svcIds: string[], delivery = 0, desconto = 0, veiculo: 'hatch'|'sedan'|'suv' = 'hatch') {
    setAcaoSvcs(svcs); setAcaoTotal(total); setAcaoSvcIds(svcIds)
    setAcaoDelivery(delivery); setAcaoDesconto(desconto); setAcaoVeiculo(veiculo)
    setAcaoOpen(true)
  }

  async function handlePDF(clienteNome?: string, clienteVeiculo?: string) {
    const { gerarOrcamentoPDF } = await import('@/lib/orcamentoPDF')
    const { servicosCustom } = useStore.getState()
    gerarOrcamentoPDF({
      cliente: clienteNome ? { nome: clienteNome, veiculo: clienteVeiculo } : undefined,
      svcIds: acaoSvcIds,
      servicosCustom,
      veiculo: acaoVeiculo,
      total: acaoTotal,
      delivery: acaoDelivery,
      desconto: acaoDesconto,
    })
  }

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
    <TokenGate>
    <div style={{ maxWidth:'500px', margin:'0 auto', minHeight:'100vh', background:'var(--bg)' }}>
      <Loading />
      <Toast />

      {!loading && (
        <>
          <Header />
          <main style={{ paddingTop:`${headerH+8}px`, paddingBottom:'80px', paddingLeft:'16px', paddingRight:'16px' }}>
            <div className="animate-fadeUp" key={activeTab}>
              {renderTab()}
            </div>
          </main>
          <BottomNav />
        </>
      )}

      {acaoOpen && (
        <AcaoOrcamento
          svcs={acaoSvcs}
          svcIds={acaoSvcIds}
          total={acaoTotal}
          delivery={acaoDelivery}
          desconto={acaoDesconto}
          veiculo={acaoVeiculo}
          onPDF={handlePDF}
          onFinalizado={() => { setAcaoOpen(false); setTab('agenda') }}
          onCancelar={() => setAcaoOpen(false)}
        />
      )}
    </div>
    </TokenGate>
  )
}
