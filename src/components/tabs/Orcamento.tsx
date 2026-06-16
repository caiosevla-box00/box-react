import { useState, useMemo } from 'react'
import { useStore } from '@/store'
import { SERVICOS, CATEGORIAS } from '@/lib/servicos'
import type { TipoVeiculo } from '@/types'

interface Props { onFechar: (svcs: string[], total: number, svcIds: string[], delivery?: number, desconto?: number) => void }

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

  function tog(id: string) {
    setSel(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n })
  }

  // Altura da barra inferior: aprox 100px com desconto/delivery visíveis
  const barH = sel.size > 0 ? 110 : 0

  return (
    <div>
      {/* Veículo */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px', marginBottom: '20px' }}>
        {V.map(v => (
          <button key={v.id} onClick={() => setVeiculo(v.id)} style={{
            padding: '11px 4px', borderRadius: 'var(--radius-md)', fontSize: '12px',
            fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'all .15s',
            background: veiculo === v.id ? 'var(--verde)' : 'var(--surface)',
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
                background: on ? 'var(--verde-bg)' : 'var(--surface)',
                border: `1.5px solid ${on ? 'var(--verde)' : 'var(--borda)'}`,
                cursor: 'pointer', textAlign: 'left', transition: 'all .15s',
              }}>
                <div style={{
                  width: '22px', height: '22px', borderRadius: '6px', flexShrink: 0,
                  background: on ? 'var(--verde)' : 'transparent',
                  border: `1.5px solid ${on ? 'var(--verde)' : '#555'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '12px', color: '#000', fontWeight: 700,
                }}>
                  {on ? '✓' : ''}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--texto)' }}>{s.nome}</div>
                  <div style={{ fontSize: '12px', color: 'var(--dim)', marginTop: '2px' }}>{s.tempo}</div>
                </div>
                <div style={{ fontSize: '17px', fontWeight: 700, color: on ? 'var(--verde)' : 'var(--dim)', flexShrink: 0 }}>
                  R${getP(id)}
                </div>
              </button>
            )
          })}
        </div>
      ))}

      {/* Delivery + Desconto — sempre visíveis, acima da barra */}
      <div style={{ marginTop: '20px', paddingBottom: `${barH + 16}px` }}>

        {/* Delivery */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--borda)', borderRadius: 'var(--radius-md)', padding: '14px', marginBottom: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--texto)' }}>🚚 Delivery</div>
              <div style={{ fontSize: '12px', color: 'var(--dim)', marginTop: '2px' }}>Taxa de deslocamento</div>
            </div>
            <button onClick={() => setDelivery(!delivery)} style={{
              width: '46px', height: '26px', borderRadius: '13px', border: 'none', cursor: 'pointer',
              background: delivery ? 'var(--verde)' : '#444', position: 'relative', transition: 'background .2s',
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
              <span style={{ fontSize: '13px', color: 'var(--dim)' }}>R$</span>
              <input type="number" value={taxaDel || ''} onChange={e => setTaxaDel(Number(e.target.value))}
                placeholder="0" style={{ flex: 1, background: 'var(--bg)', border: '1px solid var(--borda)', borderRadius: '10px', padding: '10px 14px', color: 'var(--verde)', fontSize: '18px', fontWeight: 700, outline: 'none', textAlign: 'center' }} />
              <span style={{ fontSize: '13px', color: 'var(--dim)' }}>→ Cobrar do cliente</span>
            </div>
          )}
        </div>

        {/* Desconto */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--borda)', borderRadius: 'var(--radius-md)', padding: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--texto)' }}>Desconto</div>
              <div style={{ fontSize: '12px', color: 'var(--dim)', marginTop: '2px' }}>Valor a descontar do total</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '13px', color: 'var(--dim)' }}>R$</span>
              <input type="number" value={desconto || ''} onChange={e => setDesconto(Number(e.target.value))}
                placeholder="0" style={{ width: '90px', background: 'var(--bg)', border: '1px solid var(--borda)', borderRadius: '10px', padding: '8px 12px', color: 'var(--erro)', fontSize: '18px', fontWeight: 700, outline: 'none', textAlign: 'center' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Barra total — fixa na parte inferior */}
      {sel.size > 0 && (
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          maxWidth: '500px', margin: '0 auto',
          background: 'var(--surface2)', borderTop: '1px solid var(--borda)',
          padding: '12px 16px 28px', zIndex: 90,
        }}>
          {/* Resumo */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--dim)' }}>
                {sel.size} serviço{sel.size !== 1 ? 's' : ''}
                {delivery && taxaDel > 0 && ` + delivery R$${taxaDel}`}
                {desconto > 0 && ` - desconto R$${desconto}`}
              </div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--verde)', lineHeight: 1 }}>
                R${total}
              </div>
            </div>
            {/* Mini breakdown */}
            {(desconto > 0 || (delivery && taxaDel > 0)) && (
              <div style={{ textAlign: 'right', fontSize: '11px', color: 'var(--dim)' }}>
                {subtotal > 0 && <div>Serviços: R${subtotal}</div>}
                {delivery && taxaDel > 0 && <div>Delivery: +R${taxaDel}</div>}
                {desconto > 0 && <div style={{ color: 'var(--erro)' }}>Desconto: -R${desconto}</div>}
              </div>
            )}
          </div>
          <button onClick={() => onFechar(
            Array.from(sel).map(id => SERVICOS.find(s => s.id === id)?.nome || id),
            total,
            Array.from(sel),
            delivery ? taxaDel : 0,
            desconto
          )}
            style={{ width: '100%', background: 'var(--verde)', color: '#000', fontSize: '15px', fontWeight: 700, padding: '15px', borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer', letterSpacing: '1px' }}>
            FECHAR SERVIÇO →
          </button>
        </div>
      )}
    </div>
  )
}
