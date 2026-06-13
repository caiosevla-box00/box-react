import { useEffect } from 'react'
import { useStore } from '@/store'
import { useSync } from '@/hooks/useSync'
import { Loading } from '@/components/ui/Loading'
import { Toast } from '@/components/ui/Toast'
import { Header } from '@/components/ui/Header'
import { TabBar } from '@/components/ui/TabBar'
import { Orcamento } from '@/components/tabs/Orcamento'
import { Diluidor } from '@/components/tabs/Diluidor'

// Placeholder tabs — serão implementados
function PlaceholderTab({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="text-5xl mb-4">🚧</div>
      <div className="font-bebas text-2xl tracking-widest" style={{ color: 'var(--verde)' }}>{label}</div>
      <div className="font-barlow text-sm mt-2" style={{ color: '#555' }}>Em desenvolvimento</div>
    </div>
  )
}

export default function App() {
  const { activeTab, loading, setTab } = useStore()
  const { checkAPI } = useSync()

  useEffect(() => {
    checkAPI()
  }, [])

  const renderTab = () => {
    switch (activeTab) {
      case 'orcamento':  return <Orcamento onFechar={(svcs, total) => { console.log(svcs, total) }} />
      case 'combos':     return <PlaceholderTab label="Combos" />
      case 'agenda':     return <PlaceholderTab label="Agenda" />
      case 'clientes':   return <PlaceholderTab label="Clientes" />
      case 'financeiro': return <PlaceholderTab label="Financeiro" />
      case 'custos':     return <PlaceholderTab label="Custos" />
      case 'config':     return <PlaceholderTab label="Config" />
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
          <main className="pt-16 pb-20 px-4 min-h-screen overflow-y-auto">
            {renderTab()}
          </main>
          <TabBar />
        </>
      )}
    </div>
  )
}
