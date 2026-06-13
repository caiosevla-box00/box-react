import { useStore } from '@/store'
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

export function TabBar() {
  const { activeTab, setTab } = useStore()

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
      background: '#111111', borderTop: '1px solid #252525',
      maxWidth: '500px', margin: '0 auto',
      paddingBottom: 'env(safe-area-inset-bottom, 0px)'
    }}>
      <div style={{ display: 'flex', overflowX: 'auto', scrollbarWidth: 'none' }}>
        {TABS.map(tab => (
          <button key={tab.id}
            onClick={() => setTab(tab.id)}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', flexShrink: 0, padding: '8px 10px',
              minWidth: '56px', background: 'transparent', border: 'none',
              cursor: 'pointer', transition: 'color 0.2s',
              color: activeTab === tab.id ? 'var(--verde)' : '#444',
              borderTop: activeTab === tab.id ? '2px solid var(--verde)' : '2px solid transparent'
            }}>
            <span style={{ fontSize: '18px', lineHeight: 1 }}>{tab.icon}</span>
            <span style={{
              fontFamily: '"Barlow Condensed", sans-serif', fontSize: '9px',
              fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', marginTop: '3px'
            }}>
              {tab.label}
            </span>
          </button>
        ))}
      </div>
    </nav>
  )
}
