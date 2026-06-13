import { useState, useEffect } from 'react'
import { useStore } from '@/store'
import type { FechamentoDados } from '@/types'

interface CheckoutProps {
  valorInicial: number
  svcsTexto: string
  onConfirmar: (dados: FechamentoDados) => void
  onCancelar: () => void
}

type FormaPagto = 'pix' | 'debito' | 'credito'

const TAXAS_CREDITO = [0, 3.49, 4.49, 5.49, 5.99, 6.49, 6.99, 7.49, 7.99, 8.49, 8.99, 9.49, 9.99]

export function Checkout({ valorInicial, svcsTexto, onConfirmar, onCancelar }: CheckoutProps) {
  const { divisao, taxaDebito } = useStore()
  const [forma, setForma] = useState<FormaPagto>('pix')
  const [parcelas, setParcelas] = useState(1)
  const [taxaManual, setTaxaManual] = useState<number | ''>('')

  const taxa = taxaManual !== '' ? Number(taxaManual)
    : forma === 'pix' ? 0
    : forma === 'debito' ? taxaDebito
    : TAXAS_CREDITO[parcelas] || 0

  const valorCobrado = taxa > 0 ? Math.ceil(valorInicial / (1 - taxa / 100)) : valorInicial
  const custoTaxa = valorCobrado - valorInicial
  const liquido = valorInicial

  const fundos = [
    { label: '🏠 Contas Fixas', pct: divisao.contas, cor: '#74b9ff', key: 'contas' as const },
    { label: '🔧 Máquinas', pct: divisao.maquinas, cor: '#a29bfe', key: 'maquinas' as const },
    { label: '🧴 Estoque', pct: divisao.estoque, cor: '#fd79a8', key: 'estoque' as const },
    { label: '💰 Lucro Real', pct: divisao.lucro, cor: 'var(--verde)', key: 'lucro' as const },
  ]

  function confirmar() {
    onConfirmar({
      svcs: svcsTexto,
      formaPagamento: forma,
      parcelas: forma === 'credito' ? parcelas : 1,
      taxaPct: taxa,
      valorOriginal: valorInicial,
      valorCobrado,
      custoTaxa,
      liquido,
      divisao: {
        contas: parseFloat((liquido * divisao.contas / 100).toFixed(2)),
        maquinas: parseFloat((liquido * divisao.maquinas / 100).toFixed(2)),
        estoque: parseFloat((liquido * divisao.estoque / 100).toFixed(2)),
        lucro: parseFloat((liquido * divisao.lucro / 100).toFixed(2)),
      }
    })
  }

  return (
    <div className="fixed inset-0 z-[10002] overflow-y-auto" style={{ background: '#080808' }}>
      <div className="max-w-[500px] mx-auto p-4 pb-20">
        <div className="flex justify-between items-center mb-5">
          <div className="font-bebas text-2xl tracking-widest" style={{ color: 'var(--verde)' }}>FECHAR SERVIÇO</div>
          <button onClick={onCancelar} className="px-4 py-2 rounded-lg font-barlow text-sm font-bold"
            style={{ background: '#1c1c1c', border: '1px solid #333', color: '#ccc' }}>✕</button>
        </div>

        {/* Valor */}
        <div className="rounded-xl p-4 mb-4 text-center" style={{ background: 'var(--card)', border: '2px solid var(--verde)' }}>
          <div className="font-barlow text-xs tracking-widest uppercase mb-1" style={{ color: '#555' }}>Valor do serviço</div>
          <div className="font-bebas text-5xl" style={{ color: 'var(--verde)' }}>R${valorInicial}</div>
          <div className="font-barlow text-xs mt-1" style={{ color: '#555' }}>{svcsTexto}</div>
        </div>

        {/* Forma de pagamento */}
        <div className="rounded-xl p-4 mb-4" style={{ background: 'var(--card)', border: '1px solid var(--borda)' }}>
          <div className="font-barlow font-bold text-sm tracking-wider uppercase mb-3" style={{ color: 'var(--verde)' }}>
            💳 Forma de Pagamento
          </div>
          <div className="grid grid-cols-3 gap-2 mb-3">
            {(['pix', 'debito', 'credito'] as FormaPagto[]).map(f => (
              <button key={f} onClick={() => { setForma(f); setParcelas(1); setTaxaManual('') }}
                className="py-3 rounded-xl font-barlow font-bold text-xs tracking-wider uppercase transition-all"
                style={{
                  background: forma === f ? 'var(--verde-bg)' : '#111',
                  border: `1px solid ${forma === f ? 'var(--verde)' : 'var(--borda)'}`,
                  color: forma === f ? 'var(--verde)' : 'var(--dim)'
                }}>
                {f === 'pix' ? '⚡ PIX' : f === 'debito' ? '💳 Débito' : '💳 Crédito'}
                <div className="text-[9px] mt-0.5">
                  {f === 'pix' ? 'sem taxa' : f === 'debito' ? `${taxaDebito}%` : `${TAXAS_CREDITO[1]}%+`}
                </div>
              </button>
            ))}
          </div>

          {forma === 'credito' && (
            <div className="mb-3">
              <label className="font-barlow text-xs font-bold tracking-wider uppercase block mb-1" style={{ color: '#777' }}>
                Parcelas
              </label>
              <div className="grid grid-cols-4 gap-1">
                {[1,2,3,4,5,6,7,8,9,10,11,12].map(p => (
                  <button key={p} onClick={() => { setParcelas(p); setTaxaManual('') }}
                    className="py-2 rounded-lg font-barlow font-bold text-xs"
                    style={{
                      background: parcelas === p ? 'var(--verde-bg)' : '#000',
                      border: `1px solid ${parcelas === p ? 'var(--verde)' : '#333'}`,
                      color: parcelas === p ? 'var(--verde)' : '#555'
                    }}>
                    {p}x
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="font-barlow text-xs font-bold tracking-wider uppercase block mb-1" style={{ color: '#777' }}>
              Taxa % manual (opcional)
            </label>
            <input type="number" value={taxaManual} onChange={e => setTaxaManual(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="Automático"
              className="w-full rounded-xl px-4 py-3 text-sm outline-none"
              style={{ background: '#000', border: '1px solid #333', color: 'var(--verde)' }} />
          </div>
        </div>

        {/* Resultado */}
        <div className="rounded-xl p-4 mb-4" style={{ background: 'var(--card)', border: '1px solid var(--borda)' }}>
          <div className="font-barlow font-bold text-sm tracking-wider uppercase mb-3" style={{ color: 'var(--verde)' }}>
            📊 Resumo Financeiro
          </div>
          {[
            { label: 'Valor do serviço', val: `R$${valorInicial}`, cor: '#f0f0f0' },
            { label: `Taxa (${taxa.toFixed(2)}%)`, val: custoTaxa > 0 ? `-R$${custoTaxa.toFixed(2)}` : 'R$0', cor: '#ff6b6b' },
            { label: 'Você cobra', val: `R$${valorCobrado}`, cor: '#f0a500' },
            { label: 'Valor líquido', val: `R$${liquido}`, cor: 'var(--verde)' },
          ].map((row, i) => (
            <div key={i} className="flex justify-between items-center py-2" style={{ borderBottom: i < 3 ? '1px solid #1e1e1e' : 'none' }}>
              <span className="font-barlow text-sm" style={{ color: '#aaa' }}>{row.label}</span>
              <span className="font-bebas text-xl" style={{ color: row.cor }}>{row.val}</span>
            </div>
          ))}
          {forma === 'credito' && parcelas > 1 && (
            <div className="mt-2 text-center font-barlow text-xs" style={{ color: 'var(--verde)' }}>
              {parcelas}x de R${(valorCobrado / parcelas).toFixed(2)}
            </div>
          )}
        </div>

        {/* Divisão de fundos */}
        <div className="rounded-xl p-4 mb-5" style={{ background: 'var(--card)', border: '1px solid var(--borda)' }}>
          <div className="font-barlow font-bold text-sm tracking-wider uppercase mb-3" style={{ color: 'var(--verde)' }}>
            💰 Divisão dos Fundos
          </div>
          {fundos.map(f => (
            <div key={f.key} className="flex justify-between items-center py-2" style={{ borderBottom: '1px solid #1e1e1e' }}>
              <div>
                <div className="font-barlow text-sm">{f.label}</div>
                <div className="font-barlow text-xs" style={{ color: '#555' }}>{f.pct}% do líquido</div>
              </div>
              <div className="font-bebas text-2xl" style={{ color: f.cor }}>
                R${(liquido * f.pct / 100).toFixed(2)}
              </div>
            </div>
          ))}
        </div>

        <button onClick={confirmar}
          className="w-full py-4 rounded-xl font-barlow font-extrabold text-lg tracking-widest uppercase"
          style={{ background: 'var(--verde)', color: '#080808', border: 'none' }}>
          CONFIRMAR PAGAMENTO
        </button>
      </div>
    </div>
  )
}
