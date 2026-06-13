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
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 max-w-[500px] mx-auto"
      style={{
        background: '#111111',
        borderBottom: '2px solid var(--verde)',
        paddingTop: '12px',
        paddingBottom: '10px',
        minHeight: '60px'
      }}>
      <div>
        <div className="font-bebas tracking-widest leading-none" style={{ fontSize: '28px' }}>
          BOX <span style={{ color: 'var(--verde)' }}>0.0</span>
        </div>
        <div className="font-barlow" style={{ fontSize: '10px', color: '#555', letterSpacing: '3px', textTransform: 'uppercase', marginTop: '2px' }}>
          Estética Automotiva
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div className="font-barlow" style={{ fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase', color: apiOnline ? 'var(--verde)' : 'var(--erro)' }}>
          {apiOnline ? '🟢 Nuvem OK' : '🔴 Offline'}
        </div>
        <button onClick={handleSync}
          className="font-barlow font-bold tracking-widest uppercase"
          style={{
            fontSize: '11px', padding: '8px 14px', borderRadius: '8px',
            background: 'transparent', border: '1px solid var(--verde)', color: 'var(--verde)',
            cursor: 'pointer'
          }}>
          ☁️ SYNC
        </button>
      </div>
    </header>
  )
}
