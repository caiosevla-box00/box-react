import { useState, useMemo } from 'react'
import { useStore } from '@/store'
import { SERVICOS, CATEGORIAS } from '@/lib/servicos'
import type { TipoVeiculo } from '@/types'

interface OrcamentoProps {
  onFechar: (svcs: string[], total: number) => void
}

export function Orcamento({ onFechar }: OrcamentoProps) {
  const { veiculo, setVeiculo, precos } = useStore()
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set())
  const [delivery, setDelivery] = useState(false)
  const [taxaDelivery, setTaxaDelivery] = useState(0)
  const [desconto, setDesconto] = useState(0)

  const getPreco = (svcId: string) => precos[svcId]?.[veiculo] ?? SERVICOS.find(s => s.id === svcId)?.base[veiculo] ?? 0

  const subtotal = useMemo(() =>
    Array.from(selecionados).reduce((acc, id) => acc + getPreco(id), 0),
    [selecionados, veiculo, precos]
  )

  const total = subtotal + (delivery ? taxaDelivery : 0) - desconto

  function toggleServico(id: string) {
    setSelecionados(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function handleFechar() {
    if (!selecionados.size) return
    const svcsNomes = Array.from(selecionados).map(id => SERVICOS.find(s => s.id === id)?.nome ?? id)
    onFechar(svcsNomes, total)
  }

  const veiculos: { id: TipoVeiculo; icon: string; label: string }[] = [
    { id: 'hatch', icon: '🚗', label: 'Hatch' },
    { id: 'sedan', icon: '🚙', label: 'Sedan' },
    { id: 'suv',   icon: '🛻', label: 'SUV/Pick' },
  ]

  return (
    <div>
      {/* Seletor de veículo */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {veiculos.map(v => (
          <button key={v.id} onClick={() => setVeiculo(v.id)}
            className="py-3 rounded-xl font-barlow font-bold text-sm tracking-wider uppercase transition-all"
            style={{
              background: veiculo === v.id ? 'var(--verde)' : '#111',
              color: veiculo === v.id ? '#080808' : '#aaa',
              border: `1px solid ${veiculo === v.id ? 'var(--verde)' : '#222'}`
            }}>
            {v.icon} {v.label}
          </button>
        ))}
      </div>

      {/* Serviços por categoria */}
      {CATEGORIAS.map(cat => (
        <div key={cat.nome} className="mb-4">
          <div className="font-barlow text-xs font-bold tracking-[2px] uppercase mb-2"
            style={{ color: '#555' }}>
            {cat.nome}
          </div>
          <div className="space-y-2">
            {cat.ids.map(id => {
              const s = SERVICOS.find(x => x.id === id)!
              const sel = selecionados.has(id)
              const preco = getPreco(id)
              return (
                <button key={id} onClick={() => toggleServico(id)}
                  className="w-full text-left rounded-xl p-3 transition-all"
                  style={{
                    background: sel ? 'rgba(170,255,0,.08)' : '#111',
                    border: `1px solid ${sel ? 'var(--verde)' : '#222'}`
                  }}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ background: sel ? 'var(--verde)' : '#222', border: `1px solid ${sel ? 'var(--verde)' : '#444'}` }}>
                        {sel && <span className="text-black text-xs">✓</span>}
                      </div>
                      <div>
                        <div className="font-barlow font-bold text-sm tracking-wide">
                          <span style={{ color: '#555' }}>{s.num} · </span>
                          {s.nome}
                        </div>
                        <div className="font-barlow text-xs mt-1" style={{ color: '#555', lineHeight: 1.4 }}>
                          {s.desc.split(' · ').slice(0,2).join(' · ')}
                        </div>
                        <div className="font-barlow text-xs mt-1" style={{ color: 'var(--verde-dim)' }}>
                          ⏱ {s.tempo}
                        </div>
                      </div>
                    </div>
                    <div className="font-bebas text-xl flex-shrink-0" style={{ color: sel ? 'var(--verde)' : '#aaa' }}>
                      R${preco}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      ))}

      {/* Delivery */}
      <div className="rounded-xl p-4 mb-3" style={{ background: '#111', border: '1px solid #222' }}>
        <div className="flex items-center justify-between">
          <div>
            <div className="font-barlow font-bold text-sm">🚚 DELIVERY</div>
            <div className="font-barlow text-xs" style={{ color: '#555' }}>Adicionar taxa de deslocamento</div>
          </div>
          <button onClick={() => setDelivery(!delivery)}
            className="w-12 h-6 rounded-full transition-all relative"
            style={{ background: delivery ? 'var(--verde)' : '#333' }}>
            <div className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all"
              style={{ left: delivery ? '24px' : '2px' }} />
          </button>
        </div>
        {delivery && (
          <div className="mt-3 flex items-center gap-2">
            <span className="font-barlow text-xs text-gray-400">R$</span>
            <input type="number" value={taxaDelivery} onChange={e => setTaxaDelivery(Number(e.target.value))}
              className="flex-1 bg-black rounded-lg px-3 py-2 font-bebas text-xl text-center outline-none"
              style={{ border: '1px solid #333', color: 'var(--verde)' }} />
          </div>
        )}
      </div>

      {/* Desconto */}
      <div className="rounded-xl p-4 mb-4 flex items-center gap-3" style={{ background: '#111', border: '1px solid #222' }}>
        <span className="font-barlow text-sm font-bold tracking-wider uppercase" style={{ color: '#555' }}>DESCONTO R$</span>
        <input type="number" value={desconto || ''} onChange={e => setDesconto(Number(e.target.value))}
          placeholder="0"
          className="flex-1 bg-black rounded-lg px-3 py-2 font-bebas text-xl text-center outline-none"
          style={{ border: '1px solid #333', color: '#f0f0f0' }} />
      </div>

      {/* Total + botão */}
      {selecionados.size > 0 && (
        <div className="sticky bottom-0 py-3" style={{ background: '#080808' }}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="font-barlow text-xs tracking-widest uppercase" style={{ color: '#555' }}>Total</div>
              <div className="font-bebas text-3xl" style={{ color: 'var(--verde)' }}>R${total}</div>
            </div>
            <div className="font-barlow text-xs text-right" style={{ color: '#555' }}>
              {selecionados.size} serviço{selecionados.size !== 1 ? 's' : ''}
            </div>
          </div>
          <button onClick={handleFechar}
            className="w-full py-4 rounded-xl font-barlow font-extrabold text-lg tracking-widest uppercase"
            style={{ background: 'var(--verde)', color: '#080808' }}>
            FECHAR SERVIÇO
          </button>
        </div>
      )}
    </div>
  )
}
