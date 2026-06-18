import { useState, useMemo } from 'react'
import { useStore } from '@/store'
import { SERVICOS, CATEGORIAS } from '@/lib/servicos'
import type { TipoVeiculo } from '@/types'

interface Props { onFechar: (svcs: string[], total: number, svcIds: string[], delivery?: number, desconto?: number, veiculo?: 'hatch'|'sedan'|'suv') => void }

const V: { id: TipoVeiculo; icon: string; label: string }[] = [
  { id: 'hatch', icon: '🚗', label: 'Hatch' },
  { id: 'sedan', icon: '🚙', label: 'Sedan' },
  { id: 'suv',   icon: '🛻', label: 'SUV/Pick' },
]

export function Orcamento({ onFechar }: Props) {
  const { veiculo, setVeiculo, precos, custoPorKm, servicosCustom } = useStore()
  const [sel, setSel] = useState<Set<string>>(new Set())
  const [delivery, setDelivery] = useState(false)
  const [km, setKm] = useState<number | ''>('')
  const [taxaDelCustom, setTaxaDelCustom] = useState<number | ''>('')
  const [desconto, setDesconto] = useState<number | ''>('')

  const kmN = Number(km) || 0
  const custoReal = custoPorKm * kmN
  const taxaDelSugerida = Math.ceil(custoReal * 1.5)
  const taxaDelFinal = taxaDelCustom !== '' ? Number(taxaDelCustom) : taxaDelSugerida
  const descontoN = Number(desconto) || 0

  const getP = (id: string) => {
    const custom = servicosCustom.find(s => s.id === id)
    if (custom) return custom[veiculo] ?? custom.hatch
    return precos[id]?.[veiculo] ?? SERVICOS.find(s => s.id === id)?.base[veiculo] ?? 0
  }

  const subtotal = useMemo(() =>
    Array.from(sel).reduce((a, id) => a + getP(id), 0),
    [sel, veiculo, precos, servicosCustom]
  )
  const total = subtotal + (delivery ? taxaDelFinal : 0) - descontoN

  function tog(id: string) {
    setSel(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n })
  }

  const barH = sel.size > 0 ? 120 : 0

  const renderSvc = (id: string, nome: string, tempo: string, preco: number) => {
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
        }}>{on ? '✓' : ''}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--texto)' }}>{nome}</div>
          <div style={{ fontSize: '12px', color: 'var(--dim)', marginTop: '2px' }}>{tempo}</div>
        </div>
        <div style={{ fontSize: '17px', fontWeight: 700, color: on ? 'var(--verde)' : 'var(--dim)', flexShrink: 0 }}>
          R${preco}
        </div>
      </button>
    )
  }

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

      {/* Serviços padrão por categoria */}
      {CATEGORIAS.map(cat => (
        <div key={cat.nome}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--dim)', letterSpacing: '1px', textTransform: 'uppercase', margin: '16px 0 8px' }}>
            {cat.nome}
          </div>
          {cat.ids.map(id => {
            const s = SERVICOS.find(x => x.id === id)!
            return renderSvc(id, s.nome, s.tempo, getP(id))
          })}
        </div>
      ))}

      {/* Serviços personalizados */}
      {servicosCustom.length > 0 && (
        <div>
          <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--verde)', letterSpacing: '1px', textTransform: 'uppercase', margin: '16px 0 8px' }}>
            ✨ Meus Serviços
          </div>
          {servicosCustom.map(s => renderSvc(s.id, s.nome, s.tempo, getP(s.id)))}
        </div>
      )}

      {/* Delivery + Desconto */}
      <div style={{ marginTop: '20px', paddingBottom: `${barH + 16}px` }}>

        {/* Delivery */}
        <div style={{ background: 'var(--surface)', border: `1px solid ${delivery ? 'var(--verde)' : 'var(--borda)'}`, borderRadius: 'var(--radius-md)', padding: '14px', marginBottom: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--texto)' }}>🚚 Delivery</div>
              <div style={{ fontSize: '12px', color: 'var(--dim)', marginTop: '2px' }}>
                {custoPorKm > 0 ? `R$${custoPorKm.toFixed(2)}/km calculado em Custos` : 'Configure o custo/km em Custos'}
              </div>
            </div>
            <button onClick={() => { setDelivery(!delivery); setKm(''); setTaxaDelCustom('') }} style={{
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
            <div style={{ marginTop: '14px' }}>
              {/* KM input */}
              <label style={{ fontSize: '11px', color: 'var(--dim)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '6px' }}>
                Distância em km
              </label>
              <input
                type="number" value={km}
                onChange={e => {
                  const v = e.target.value === '' ? '' : Number(e.target.value)
                  setKm(v)
                  setTaxaDelCustom('') // reset override quando km muda
                }}
                placeholder="Ex: 8"
                style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--borda)', borderRadius: '10px', padding: '12px 14px', color: 'var(--texto)', fontSize: '24px', fontWeight: 700, outline: 'none', textAlign: 'center', marginBottom: '10px' }}
              />

              {/* Cálculo ao vivo — aparece assim que km > 0 */}
              {kmN > 0 && (
                <div style={{ background: 'var(--bg)', borderRadius: '12px', padding: '12px 14px', marginBottom: '10px' }}>
                  {custoPorKm > 0 ? (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontSize: '12px', color: 'var(--dim)' }}>
                          Custo real ({kmN} km × R${custoPorKm.toFixed(2)})
                        </span>
                        <span style={{ fontSize: '12px', color: 'var(--dim)' }}>R${custoReal.toFixed(2)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--verde)' }}>
                          Cobrar do cliente (+50%)
                        </span>
                        <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--verde)' }}>
                          R${taxaDelSugerida}
                        </span>
                      </div>
                      <div style={{ fontSize: '10px', color: 'var(--dim)', marginTop: '4px' }}>
                        Sua margem: R${(taxaDelSugerida - custoReal).toFixed(2)}
                      </div>
                    </>
                  ) : (
                    <div style={{ fontSize: '12px', color: 'var(--alerta)' }}>
                      ⚠️ Configure o custo/km em Custos para cálculo automático
                    </div>
                  )}
                </div>
              )}

              {/* Override do valor — pré-preenchido automaticamente */}
              <label style={{ fontSize: '11px', color: 'var(--dim)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '6px' }}>
                Ajustar valor cobrado
              </label>
              <input
                type="number"
                value={taxaDelCustom !== '' ? taxaDelCustom : (taxaDelSugerida > 0 ? taxaDelSugerida : '')}
                onChange={e => setTaxaDelCustom(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder={custoPorKm > 0 ? `Sugerido: R$${taxaDelSugerida}` : 'R$'}
                style={{ width: '100%', background: 'var(--bg)', border: '2px solid var(--verde)', borderRadius: '10px', padding: '12px 14px', color: 'var(--verde)', fontSize: '22px', fontWeight: 700, outline: 'none', textAlign: 'center' }}
              />
            </div>
          )}
        </div>

        {/* Desconto */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--borda)', borderRadius: 'var(--radius-md)', padding: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--texto)' }}>Desconto</div>
              <div style={{ fontSize: '12px', color: 'var(--dim)', marginTop: '2px' }}>Valor a deduzir do total</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '13px', color: 'var(--dim)' }}>R$</span>
              <input type="number" value={desconto} onChange={e => setDesconto(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="0"
                style={{ width: '90px', background: 'var(--bg)', border: '1px solid var(--borda)', borderRadius: '10px', padding: '8px 12px', color: 'var(--erro)', fontSize: '18px', fontWeight: 700, outline: 'none', textAlign: 'center' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Barra total */}
      {sel.size > 0 && (
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, maxWidth: '500px', margin: '0 auto',
          background: 'var(--surface2)', borderTop: '1px solid var(--borda)', padding: '12px 16px 28px', zIndex: 90,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--dim)' }}>
                {sel.size} serviço{sel.size !== 1 ? 's' : ''}
                {delivery && taxaDelFinal > 0 && ` + delivery`}
                {descontoN > 0 && ` − desconto`}
              </div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--verde)', lineHeight: 1 }}>R${total}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              {(descontoN > 0 || (delivery && taxaDelFinal > 0)) && (
                <div style={{ fontSize: '11px', color: 'var(--dim)', marginBottom: '4px' }}>
                  <div>Serviços: R${subtotal}</div>
                  {delivery && taxaDelFinal > 0 && <div>Delivery: +R${taxaDelFinal}</div>}
                  {descontoN > 0 && <div style={{ color: 'var(--erro)' }}>Desconto: -R${descontoN}</div>}
                </div>
              )}
              {/* Botão Limpar */}
              <button onClick={() => {
                setSel(new Set())
                setDelivery(false)
                setKm('')
                setTaxaDelCustom('')
                setDesconto('')
              }} style={{
                background: 'transparent', border: '1px solid var(--borda)',
                borderRadius: '8px', padding: '5px 12px', fontSize: '12px',
                fontWeight: 600, color: 'var(--dim)', cursor: 'pointer',
              }}>
                🗑 Limpar
              </button>
            </div>
          </div>
          <button onClick={() => onFechar(
            Array.from(sel).map(id => {
              const custom = servicosCustom.find(s => s.id === id)
              return custom ? custom.nome : (SERVICOS.find(s => s.id === id)?.nome || id)
            }),
            total, Array.from(sel),
            delivery ? taxaDelFinal : 0,
            descontoN,
            veiculo
          )}
            style={{ width: '100%', background: 'var(--verde)', color: '#000', fontSize: '15px', fontWeight: 700, padding: '15px', borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer', letterSpacing: '1px' }}>
            FECHAR SERVIÇO →
          </button>
        </div>
      )}
    </div>
  )
}
