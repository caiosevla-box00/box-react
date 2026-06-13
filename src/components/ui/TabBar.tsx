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
    <nav className="fixed bottom-0 left-0 right-0 z-50 max-w-[500px] mx-auto"
      style={{ background: '#080808', borderTop: '1px solid #1a1a1a' }}>
      <div className="flex overflow-x-auto scrollbar-hide">
        {TABS.map(tab => (
          <button key={tab.id}
            onClick={() => setTab(tab.id)}
            className="flex flex-col items-center justify-center flex-shrink-0 py-2 px-3 min-w-[56px] transition-colors"
            style={{ color: activeTab === tab.id ? 'var(--verde)' : '#444' }}>
            <span className="text-lg leading-none">{tab.icon}</span>
            <span className="font-barlow text-[9px] font-bold tracking-wider uppercase mt-1">
              {tab.label}
            </span>
            {activeTab === tab.id && (
              <div className="w-4 h-0.5 rounded-full mt-1" style={{ background: 'var(--verde)' }} />
            )}
          </button>
        ))}
      </div>
    </nav>
  )
}
