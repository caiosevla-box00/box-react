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

  async function handleSync() {
    await sincronizarTudo(false)
  }

  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: '#111', borderBottom: '1px solid #1e1e1e',
      maxWidth: '500px', margin: '0 auto',
    }}>
      {/* Logo row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px 10px' }}>
        <div>
          <div style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '2px', lineHeight: 1 }}>
            BOX <span style={{ color: 'var(--verde)' }}>0.0</span>
          </div>
          <div style={{ fontSize: '10px', color: '#444', letterSpacing: '2px', textTransform: 'uppercase', marginTop: '3px' }}>
            Estética Automotiva
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ fontSize: '11px', color: apiOnline ? 'var(--verde)' : 'var(--erro)', fontWeight: 600 }}>
            {apiOnline ? '● Online' : '● Offline'}
          </div>
          <button onClick={handleSync} style={{
            background: 'var(--verde)', color: '#000', fontSize: '11px',
            fontWeight: 700, padding: '8px 16px', borderRadius: '20px',
            border: 'none', cursor: 'pointer', letterSpacing: '1px',
          }}>
            ☁ SYNC
          </button>
        </div>
      </div>

      {/* Tab row */}
      <div style={{ display: 'flex', overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: '0' }}>
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setTab(tab.id)} style={{
            flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: '3px', padding: '8px 14px 10px', border: 'none', background: 'transparent',
            cursor: 'pointer', position: 'relative',
            borderBottom: activeTab === tab.id ? '2px solid var(--verde)' : '2px solid transparent',
          }}>
            <span style={{ fontSize: '18px', lineHeight: 1 }}>{tab.icon}</span>
            <span style={{
              fontSize: '9px', fontWeight: 600, letterSpacing: '.5px',
              textTransform: 'uppercase', whiteSpace: 'nowrap',
              color: activeTab === tab.id ? 'var(--verde)' : '#444',
            }}>{tab.label}</span>
          </button>
        ))}
      </div>
    </header>
  )
}
