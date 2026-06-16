import { useState } from 'react'
import { useStore } from '@/store'
import type { TabId } from '@/types'

const MAIN_TABS: { id: TabId; icon: string; label: string }[] = [
  { id: 'home',      icon: '🏠', label: 'Home'      },
  { id: 'agenda',    icon: '📅', label: 'Agenda'    },
  { id: 'orcamento', icon: '🧾', label: 'Orçamento' },
  { id: 'clientes',  icon: '👥', label: 'Clientes'  },
]

const MORE_TABS: { id: TabId; icon: string; label: string }[] = [
  { id: 'financeiro', icon: '💰', label: 'Financeiro' },
  { id: 'combos',     icon: '🎁', label: 'Combos'     },
  { id: 'custos',     icon: '📊', label: 'Custos'     },
  { id: 'config',     icon: '⚙️', label: 'Config'     },
  { id: 'diluidor',   icon: '🧪', label: 'Diluidor'   },
]

export function BottomNav() {
  const { activeTab, setTab } = useStore()
  const [showMore, setShowMore] = useState(false)

  const isMore = MORE_TABS.some(t => t.id === activeTab)

  function handleTab(id: TabId) {
    setTab(id)
    setShowMore(false)
  }

  return (
    <>
      {/* Sheet "Mais" */}
      {showMore && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200, display: 'flex',
          flexDirection: 'column', justifyContent: 'flex-end',
        }}>
          {/* Backdrop */}
          <div onClick={() => setShowMore(false)} style={{
            position: 'absolute', inset: 0, background: 'rgba(0,0,0,.55)',
          }} />
          {/* Sheet */}
          <div style={{
            position: 'relative', zIndex: 1,
            background: 'var(--surface2)', borderRadius: '20px 20px 0 0',
            padding: '8px 16px 40px',
            maxWidth: '500px', width: '100%', margin: '0 auto',
            boxShadow: '0 -4px 32px rgba(0,0,0,.3)',
          }}>
            {/* Handle */}
            <div style={{ width: '36px', height: '4px', background: 'var(--borda)', borderRadius: '2px', margin: '8px auto 16px' }} />
            <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--dim)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '12px' }}>
              Mais opções
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {MORE_TABS.map(tab => (
                <button key={tab.id} onClick={() => handleTab(tab.id)} style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '14px', borderRadius: '14px', cursor: 'pointer',
                  background: activeTab === tab.id ? 'var(--verde-bg)' : 'var(--surface)',
                  border: `1px solid ${activeTab === tab.id ? 'var(--verde)' : 'var(--borda)'}`,
                  color: activeTab === tab.id ? 'var(--verde)' : 'var(--texto)',
                  fontSize: '14px', fontWeight: 600, textAlign: 'left',
                }}>
                  <span style={{ fontSize: '22px' }}>{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Nav bar */}
      <nav id="bottom-nav" style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
        background: 'var(--surface2)', borderTop: '0.5px solid var(--borda)',
        maxWidth: '500px', margin: '0 auto',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}>
        <div style={{ display: 'flex' }}>
          {MAIN_TABS.map(tab => (
            <button key={tab.id} onClick={() => handleTab(tab.id)} style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: '3px', padding: '10px 4px 10px', border: 'none',
              background: 'transparent', cursor: 'pointer',
              borderTop: activeTab === tab.id ? '2px solid var(--verde)' : '2px solid transparent',
            }}>
              <span style={{ fontSize: '20px', lineHeight: 1 }}>{tab.icon}</span>
              <span style={{
                fontSize: '9px', fontWeight: 600, letterSpacing: '.5px',
                textTransform: 'uppercase',
                color: activeTab === tab.id ? 'var(--verde)' : 'var(--dim)',
              }}>{tab.label}</span>
            </button>
          ))}
          {/* Mais */}
          <button onClick={() => setShowMore(!showMore)} style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: '3px', padding: '10px 4px 10px', border: 'none',
            background: 'transparent', cursor: 'pointer',
            borderTop: (isMore || showMore) ? '2px solid var(--verde)' : '2px solid transparent',
          }}>
            <span style={{ fontSize: '20px', lineHeight: 1 }}>⋯</span>
            <span style={{
              fontSize: '9px', fontWeight: 600, letterSpacing: '.5px',
              textTransform: 'uppercase',
              color: (isMore || showMore) ? 'var(--verde)' : 'var(--dim)',
            }}>Mais</span>
          </button>
        </div>
      </nav>
    </>
  )
}
