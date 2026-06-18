import { useState, useEffect } from 'react'
import { useStore } from '@/store'
import { useSync } from '@/hooks/useSync'
import { BuscaGlobal } from '@/components/ui/BuscaGlobal'

export function Header() {
  const { apiOnline } = useStore()
  const { sincronizarTudo } = useSync()
  const [dark, setDark] = useState(true)
  const [syncing, setSyncing] = useState(false)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
  }, [dark])

  async function handleSync() {
    setSyncing(true)
    await sincronizarTudo(false)
    setSyncing(false)
  }

  return (
    <header id="app-header" style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: 'var(--surface2)', borderBottom: '0.5px solid var(--borda)',
      maxWidth: '500px', margin: '0 auto',
      padding: '12px 18px 11px',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    }}>
      {/* Logo */}
      <div>
        <div style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '2px', lineHeight: 1, color: 'var(--texto)' }}>
          BOX <span style={{ color: 'var(--verde)' }}>0.0</span>
        </div>
        <div style={{ fontSize: '9px', color: 'var(--dim)', letterSpacing: '2px', textTransform: 'uppercase', marginTop: '2px' }}>
          Estética Automotiva
        </div>
      </div>

      {/* Ações */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* Status */}
        <div style={{ fontSize: '11px', fontWeight: 600, color: apiOnline ? 'var(--verde)' : 'var(--dim)' }}>
          {apiOnline ? '● Online' : '● Offline'}
        </div>
        {/* Busca */}
        <BuscaGlobal />
        {/* Tema */}
        <button onClick={() => setDark(d => !d)} style={{
          background: 'var(--surface)', border: '0.5px solid var(--borda)',
          borderRadius: '20px', padding: '5px 9px', cursor: 'pointer', fontSize: '14px', lineHeight: 1,
        }}>
          {dark ? '☀️' : '🌙'}
        </button>
        {/* Sync */}
        <button onClick={handleSync} disabled={syncing} style={{
          background: 'var(--verde)', color: '#000', fontSize: '11px', fontWeight: 700,
          padding: '7px 14px', borderRadius: '20px', border: 'none', cursor: 'pointer',
          letterSpacing: '0.5px', opacity: syncing ? .7 : 1, transition: 'opacity .2s',
        }}>
          {syncing ? '⏳' : '☁ SYNC'}
        </button>
      </div>
    </header>
  )
}
