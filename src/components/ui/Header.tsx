import { useStore } from '@/store'
import { useSync } from '@/hooks/useSync'

export function Header() {
  const { apiOnline, showToast } = useStore()
  const { sincronizarTudo } = useSync()

  async function handleSync() {
    showToast('⏳ Sincronizando...')
    await sincronizarTudo(false)
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 max-w-[500px] mx-auto"
      style={{ background: '#080808', borderBottom: '1px solid #1a1a1a' }}>
      <div>
        <div className="font-bebas text-2xl tracking-widest">
          BOX <span style={{ color: 'var(--verde)' }}>0.0</span>
        </div>
        <div className="font-barlow text-[10px] tracking-[3px] uppercase" style={{ color: '#444' }}>
          Estética Automotiva
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="font-barlow text-[10px] tracking-widest uppercase"
          style={{ color: apiOnline ? 'var(--verde)' : 'var(--erro)' }}>
          {apiOnline ? '🟢 Nuvem OK' : '🔴 Offline'}
        </div>
        <button onClick={handleSync}
          className="font-barlow text-xs font-bold tracking-widest uppercase px-3 py-2 rounded-lg"
          style={{ background: 'transparent', border: '1px solid var(--verde)', color: 'var(--verde)' }}>
          ☁️ SYNC
        </button>
      </div>
    </header>
  )
}
