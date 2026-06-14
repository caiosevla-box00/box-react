import { useState, useEffect } from 'react'
import { useStore } from '@/store'
import { useSync } from '@/hooks/useSync'
import type { TabId } from '@/types'

const TABS: { id: TabId; icon: string; label: string }[] = [
  { id: 'orcamento',  icon: '🧾', label: 'Orçamento'  },
  { id: 'combos',     icon: '🎁', label: 'Combos'     },
  { id: 'agenda',     icon: '📅', label: 'Agenda'     },
  { id: 'clientes',   icon: '👥', label: 'Clientes'   },
  { id: 'financeiro', icon: '💰', label: 'Financeiro' },
  { id: 'custos',     icon: '📊', label: 'Custos'     },
  { id: 'config',     icon: '⚙️', label: 'Config'     },
  { id: 'diluidor',   icon: '🧪', label: 'Diluidor'   },
]

export function Header() {
  const { apiOnline, activeTab, setTab } = useStore()
  const { sincronizarTudo } = useSync()
  const [dark, setDark] = useState(true)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
  }, [dark])

  return (
    <header id="app-header" style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: 'var(--surface2)',
      borderBottom: '2px solid var(--verde)',
      maxWidth: '500px', margin: '0 auto',
    }}>
      {/* Logo row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px 8px' }}>
        <div>
          <div style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '2px', lineHeight: 1, color: 'var(--texto)' }}>
            BOX <span style={{ color: 'var(--verde)' }}>0.0</span>
          </div>
          <div style={{ fontSize: '9px', color: 'var(--dim)', letterSpacing: '2px', textTransform: 'uppercase', marginTop: '2px' }}>
            Estética Automotiva
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button onClick={() => setDark(d => !d)} style={{
            background: 'var(--surface)', border: '1px solid var(--borda)',
            borderRadius: '20px', padding: '6px 10px', cursor: 'pointer',
            fontSize: '14px', lineHeight: 1,
          }}>
            {dark ? '☀️' : '🌙'}
          </button>
          <div style={{ fontSize: '10px', color: apiOnline ? 'var(--verde)' : 'var(--erro)', fontWeight: 600, whiteSpace: 'nowrap' }}>
            ● {apiOnline ? 'Online' : 'Offline'}
          </div>
          <button onClick={() => sincronizarTudo(false)} style={{
            background: 'var(--verde)', color: '#000', fontSize: '11px',
            fontWeight: 700, padding: '7px 13px', borderRadius: '20px',
            border: 'none', cursor: 'pointer', letterSpacing: '1px', whiteSpace: 'nowrap',
          }}>
            ☁ SYNC
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', overflowX: 'auto', scrollbarWidth: 'none' }}>
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setTab(tab.id)} style={{
            flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: '3px', padding: '7px 12px 10px', border: 'none',
            background: 'transparent', cursor: 'pointer',
            borderBottom: activeTab === tab.id ? '2px solid var(--verde)' : '2px solid transparent',
          }}>
            <span style={{ fontSize: '17px', lineHeight: 1 }}>{tab.icon}</span>
            <span style={{
              fontSize: '8px', fontWeight: 700, letterSpacing: '.5px',
              textTransform: 'uppercase', whiteSpace: 'nowrap',
              color: activeTab === tab.id ? 'var(--verde)' : 'var(--dim)',
            }}>{tab.label}</span>
          </button>
        ))}
      </div>
    </header>
  )
}
