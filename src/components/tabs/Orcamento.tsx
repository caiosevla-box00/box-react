import { useState, useMemo } from 'react'
import { useStore } from '@/store'
import { SERVICOS, CATEGORIAS } from '@/lib/servicos'
import type { TipoVeiculo } from '@/types'

interface Props { onFechar: (svcs: string[], total: number, svcIds: string[]) => void }

const V: { id: TipoVeiculo; icon: string; label: string }[] = [
  { id: 'hatch', icon: '🚗', label: 'Hatch' },
  { id: 'sedan', icon: '🚙', label: 'Sedan' },
  { id: 'suv',   icon: '🛻', label: 'SUV/Pick' },
]

export function Orcamento({ onFechar }: Props) {
  const { veiculo, setVeiculo, precos } = useStore()
  const [sel, setSel] = useState<Set<string>>(new Set())
  const [delivery, setDelivery] = useState(false)
  const [taxaDel, setTaxaDel] = useState(0)
  const [desconto, setDesconto] = useState(0)

  const getP = (id: string) => precos[id]?.[veiculo] ?? SERVICOS.find(s => s.id === id)?.base[veiculo] ?? 0
  const subtotal = useMemo(() => Array.from(sel).reduce((a, id) => a + getP(id), 0), [sel, veiculo, precos])
  const total = subtotal + (delivery ? taxaDel : 0) - desconto

  function tog(id: string) { setSel(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n }) }

  return (
    <div>
      {/* Veículo */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px', marginBottom: '20px' }}>
        {V.map(v => (
          <button key={v.id} onClick={() => setVeiculo(v.id)} style={{
            padding: '11px 4px', borderRadius: 'var(--radius-md)', fontSize: '12px',
            fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'all .15s',
            background: veiculo === v.id ? 'var(--verde)' : 'var(--card)',
            color: veiculo === v.id ? '#000' : 'var(--dim)',
            outline: veiculo === v.id ? 'none' : '1px solid var(--borda)',
          }}>{v.icon} {v.label}</button>
        ))}
      </div>

      {/* Serviços */}
      {CATEGORIAS.map(cat => (
        <div key={cat.nome}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--dim)', letterSpacing: '1px', textTransform: 'uppercase', margin: '16px 0 8px' }}>
            {cat.nome}
          </div>
          {cat.ids.map(id => {
            const s = SERVICOS.find(x => x.id === id)!
            const on = sel.has(id)
            return (
              <button key={id} onClick={() => tog(id)} style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
                padding: '14px', borderRadius: 'var(--radius-md)', marginBottom: '6px',
                background: on ? 'var(--verde-bg)' : 'var(--card)',
                border: `1.5px solid ${on ? 'var(--verde)' : 'var(--borda)'}`,
                cursor: 'pointer', textAlign: 'left', transition: 'all .15s',
              }}>
                <div style={{
                  width: '22px', height: '22px', borderRadius: '6px', flexShrink: 0,
                  background: on ? 'var(--verde)' : 'transparent',
                  border: `1.5px solid ${on ? 'var(--verde)' : '#333'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '12px', color: '#000', fontWeight: 700,
                }}>
                  {on ? '✓' : ''}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--texto)' }}>{s.nome}</div>
                  <div style={{ fontSize: '12px', color: 'var(--dim)', marginTop: '2px' }}>⏱ {s.tempo}</div>
                </div>
                <div style={{ fontSize: '17px', fontWeight: 700, color: on ? 'var(--verde)' : '#aaa', flexShrink: 0 }}>
                  R${getP(id)}
                </div>
              </button>
            )
          })}
        </div>
      ))}

      {/* Delivery */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--borda)', borderRadius: 'var(--radius-md)', padding: '14px', marginTop: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 600 }}>🚚 Delivery</div>
            <div style={{ fontSize: '12px', color: 'var(--dim)', marginTop: '2px' }}>Taxa de deslocamento</div>
          </div>
          <button onClick={() => setDelivery(!delivery)} style={{
            width: '46px', height: '26px', borderRadius: '13px', border: 'none', cursor: 'pointer',
            background: delivery ? 'var(--verde)' : '#333', position: 'relative', transition: 'background .2s',
          }}>
            <div style={{
              position: 'absolute', top: '3px', width: '20px', height: '20px',
              borderRadius: '50%', background: '#fff', transition: 'left .2s',
              left: delivery ? '23px' : '3px',
            }} />
          </button>
        </div>
        {delivery && (
          <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '14px', color: 'var(--dim)' }}>R$</span>
            <input type="number" value={taxaDel || ''} onChange={e => setTaxaDel(Number(e.target.value))}
              placeholder="0" style={{ flex: 1, background: 'var(--bg)', border: '1px solid #333', borderRadius: '10px', padding: '10px 14px', color: 'var(--verde)', fontSize: '18px', fontWeight: 700, outline: 'none', textAlign: 'center' }} />
          </div>
        )}
      </div>

      {/* Desconto */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--borda)', borderRadius: 'var(--radius-md)', padding: '14px', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--dim)', flexShrink: 0 }}>Desconto R$</div>
        <input type="number" value={desconto || ''} onChange={e => setDesconto(Number(e.target.value))}
          placeholder="0" style={{ flex: 1, background: 'var(--bg)', border: '1px solid #333', borderRadius: '10px', padding: '10px 14px', color: 'var(--texto)', fontSize: '16px', outline: 'none', textAlign: 'center' }} />
      </div>

      <div style={{ height: '100px' }} />

      {/* Total bar */}
      {sel.size > 0 && (
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, maxWidth: '500px', margin: '0 auto', background: 'var(--surface2)', borderTop: '1px solid var(--borda)', padding: '12px 16px 28px', zIndex: 90 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--dim)' }}>{sel.size} serviço{sel.size !== 1 ? 's' : ''}</div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--verde)', lineHeight: 1 }}>R${total}</div>
            </div>
          </div>
          <button onClick={() => onFechar(Array.from(sel).map(id => SERVICOS.find(s => s.id === id)?.nome || id), total, Array.from(sel))}
            style={{ width: '100%', background: 'var(--verde)', color: '#000', fontSize: '15px', fontWeight: 700, padding: '15px', borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer', letterSpacing: '1px' }}>
            FECHAR SERVIÇO →
          </button>
        </div>
      )}
    </div>
  )
}
