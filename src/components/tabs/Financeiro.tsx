import { useState, useEffect } from 'react'
import { useStore } from '@/store'
import { apiCall } from '@/lib/api'
import { hoje, formatarDataBR, dataStrParaDate, getISOWeek, getMesAtual, getSemanaAtual, gerarId, parseValor } from '@/lib/utils'
import type { Saida } from '@/types'

type Periodo = 'semana' | 'mes' | 'total' | 'custom'

export function Financeiro() {
  const { finCache, saidas, setSaidas, divisao, meta, setMeta, showToast } = useStore()
  const [periodo, setPeriodo] = useState<Periodo>('total')
  const [customIni, setCustomIni] = useState('')
  const [customFim, setCustomFim] = useState('')
  const [modalSaida, setModalSaida] = useState(false)
  const [saidaDesc, setSaidaDesc] = useState('')
  const [saidaVal, setSaidaVal] = useState('')
  const [saidaData, setSaidaData] = useState(new Date().toISOString().slice(0,10))
  const [editMeta, setEditMeta] = useState(false)
  const [metaInput, setMetaInput] = useState(String(meta))
  const [graficoPeriodo, setGraficoPeriodo] = useState<string | null>(null)
  const [syncTs, setSyncTs] = useState('')

  function filtrarAtends() {
    if (periodo === 'total') return finCache
    if (periodo === 'semana') {
      const sem = graficoPeriodo || getSemanaAtual()
      return finCache.filter(a => String(a.semana||'').trim() === sem)
    }
    if (periodo === 'mes') {
      const m = graficoPeriodo || getMesAtual()
      return finCache.filter(a => String(a.mes||'').trim() === m)
    }
    if (periodo === 'custom' && customIni && customFim) {
      const ini = new Date(customIni + 'T00:00:00')
      const fim = new Date(customFim + 'T23:59:59')
      return finCache.filter(a => {
        const d = dataStrParaDate(formatarDataBR(a.data || ''))
        return d && d >= ini && d <= fim
      })
    }
    return finCache
  }

  function filtrarSaidas() {
    if (periodo === 'total') return saidas
    if (periodo === 'semana' || periodo === 'mes') {
      const now = new Date()
      const ini = new Date(now.getFullYear(), now.getMonth(), 1)
      const fim = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
      return saidas.filter(s => {
        const d = dataStrParaDate(formatarDataBR(String(s.data||'')))
        return d && d >= ini && d <= fim
      })
    }
    if (periodo === 'custom' && customIni && customFim) {
      const ini = new Date(customIni + 'T00:00:00')
      const fim = new Date(customFim + 'T23:59:59')
      return saidas.filter(s => {
        const d = dataStrParaDate(formatarDataBR(String(s.data||'')))
        return d && d && d >= ini && d <= fim
      })
    }
    return saidas
  }

  const atends = filtrarAtends()
  const saidasFil = filtrarSaidas()

  const receitaBruta = atends.reduce((acc, a) => acc + (parseValor(a.valorCobrado) || parseValor(a.valor)), 0)
  const custoTaxas = atends.reduce((acc, a) => acc + parseValor(a.custoTaxa), 0)
  const totalLiquido = atends.reduce((acc, a) => acc + (parseValor(a.valorLiquido) || parseValor(a.valor)), 0)
  const totalSaidas = saidasFil.reduce((acc, s) => acc + parseValor(s.valor), 0)
  const lucroReal = totalLiquido - totalSaidas
  const ticketMedio = atends.length > 0 ? totalLiquido / atends.length : 0
  const metaPct = meta > 0 ? Math.min(100, (totalLiquido / meta) * 100) : 0
  const corMeta = metaPct >= 100 ? 'var(--verde)' : metaPct >= 60 ? '#f0a500' : '#ff6b6b'

  // Dados do gráfico
  function getGraficoData() {
    const usarSemanas = periodo === 'semana' || periodo === 'total'
    const periodos: { label: string; key: string; val: number }[] = []
    const now = new Date()

    if (usarSemanas) {
      for (let i = 7; i >= 0; i--) {
        const ref = new Date(now)
        const ds = ref.getDay() === 0 ? 6 : ref.getDay() - 1
        ref.setDate(ref.getDate() - ds - i * 7)
        const isoKey = getISOWeek(ref)
        const label = `${ref.getDate().toString().padStart(2,'0')}/${(ref.getMonth()+1).toString().padStart(2,'0')}`
        const val = finCache.filter(a => String(a.semana||'').trim() === isoKey)
          .reduce((acc, a) => acc + (parseValor(a.valorLiquido) || parseValor(a.valor)), 0)
        periodos.push({ label, key: isoKey, val })
      }
    } else {
      const meses = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']
      for (let i = 5; i >= 0; i--) {
        let m = now.getMonth() - i, a = now.getFullYear()
        while (m < 0) { m += 12; a-- }
        const isoKey = `${a}-${String(m+1).padStart(2,'0')}`
        const val = finCache.filter(a2 => String(a2.mes||'').trim() === isoKey)
          .reduce((acc, a2) => acc + (parseValor(a2.valorLiquido) || parseValor(a2.valor)), 0)
        periodos.push({ label: meses[m], key: isoKey, val })
      }
    }
    return periodos
  }

  const graficoData = getGraficoData()
  const maxVal = Math.max(...graficoData.map(p => p.val), 1)

  async function salvarSaida() {
    if (!saidaDesc.trim() || !saidaVal) { showToast('⚠️ Preencha todos os campos'); return }
    const [a, m, d] = saidaData.split('-')
    const nova: Saida = { id: gerarId(), desc: saidaDesc.trim(), valor: parseFloat(saidaVal), data: `${d}/${m}/${a}`, criadoEm: hoje() }
    const lista = [...saidas, nova]
    setSaidas(lista)
    setModalSaida(false)
    setSaidaDesc(''); setSaidaVal('')
    const r = await apiCall('salvarSaida', { saida: { ...nova, valor: String(nova.valor).replace('.', ',') } })
    showToast(r.ok ? '✅ Saída salva!' : '💾 Salvo local')
  }

  async function excluirSaida(id: string) {
    if (!confirm('Excluir esta saída?')) return
    setSaidas(saidas.filter(s => s.id !== id))
    apiCall('excluirSaida', { id })
    showToast('🗑 Saída removida')
  }

  const periodoLabel: Record<Periodo, string> = {
    semana: 'Semana atual', mes: 'Mês atual', total: 'Todo o período', custom: 'Período personalizado'
  }

  return (
    <div>
      {/* Filtros */}
      <div className="flex gap-1 mb-1">
        {(['semana','mes','total','custom'] as Periodo[]).map(p => (
          <button key={p} onClick={() => { setPeriodo(p); setGraficoPeriodo(null) }}
            className="flex-1 py-2 rounded-xl font-barlow font-bold text-xs tracking-wider uppercase"
            style={{
              background: periodo === p ? 'var(--verde)' : '#111',
              border: `1px solid ${periodo === p ? 'var(--verde)' : 'var(--borda)'}`,
              color: periodo === p ? '#080808' : 'var(--dim)'
            }}>
            {p === 'semana' ? 'Sem' : p === 'mes' ? 'Mês' : p === 'total' ? 'Total' : 'Custom'}
          </button>
        ))}
      </div>

      {periodo === 'custom' && (
        <div className="grid grid-cols-2 gap-2 mb-3">
          <input type="date" value={customIni} onChange={e => setCustomIni(e.target.value)}
            className="rounded-xl px-3 py-2 text-sm outline-none"
            style={{ background: 'var(--surface2)', border: '1px solid var(--borda)', color: 'var(--texto)' }} />
          <input type="date" value={customFim} onChange={e => setCustomFim(e.target.value)}
            className="rounded-xl px-3 py-2 text-sm outline-none"
            style={{ background: 'var(--surface2)', border: '1px solid var(--borda)', color: 'var(--texto)' }} />
        </div>
      )}

      <div className="font-barlow text-xs tracking-widest uppercase mb-3" style={{ color: '#555' }}>
        {graficoPeriodo ? `Filtrando: ${graficoPeriodo}` : periodoLabel[periodo]}
        {graficoPeriodo && (
          <button onClick={() => setGraficoPeriodo(null)} className="ml-2 px-2 py-0.5 rounded-full text-[10px]"
            style={{ background: 'rgba(170,255,0,.1)', border: '1px solid var(--verde)', color: 'var(--verde)' }}>
            ✕ limpar
          </button>
        )}
      </div>

      {/* Cards */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {[
          { icon: '⬆️', label: 'Entradas', val: totalLiquido, cor: 'var(--verde)' },
          { icon: '⬇️', label: 'Saídas', val: totalSaidas, cor: '#ff6b6b' },
          { icon: '💵', label: 'Lucro', val: lucroReal, cor: lucroReal >= 0 ? 'var(--verde)' : '#ff6b6b' },
        ].map((c, i) => (
          <div key={i} className="rounded-xl p-3 text-center" style={{ background: 'var(--surface)', border: '1px solid var(--borda)' }}>
            <div className="text-lg">{c.icon}</div>
            <div className="font-bebas text-xl leading-none mt-1" style={{ color: c.cor }}>R${c.val.toFixed(0)}</div>
            <div className="font-barlow text-[10px] uppercase tracking-wider mt-1" style={{ color: 'var(--dim)' }}>{c.label}</div>
          </div>
        ))}
      </div>

      {/* DRE */}
      <div className="rounded-xl p-4 mb-4" style={{ background: 'var(--surface)', border: '1px solid var(--borda)' }}>
        <div className="font-barlow font-bold text-xs tracking-[2px] uppercase mb-3" style={{ color: 'var(--verde)' }}>📋 DRE — Demonstrativo</div>
        {[
          { label: 'Receita Bruta (cobrado)', val: receitaBruta, cor: '#f0f0f0', neg: false, bold: false },
          { label: '(-) Custo de Taxas', val: custoTaxas, cor: '#f0a500', neg: true, bold: false },
          { label: '(=) Receita Líquida', val: totalLiquido, cor: 'var(--verde)', neg: false, bold: true },
          { label: '(-) Saídas Operacionais', val: totalSaidas, cor: '#ff6b6b', neg: true, bold: false },
        ].map((r, i) => (
          <div key={i} className="flex justify-between items-center py-1.5" style={{ borderBottom: i < 3 ? '1px dashed #222' : 'none' }}>
            <span className="font-barlow text-xs" style={{ color: '#aaa' }}>{r.label}</span>
            <span className={`font-bebas ${r.bold ? 'text-xl' : 'text-base'}`} style={{ color: r.cor }}>
              {r.neg ? '-' : ''}R${r.val.toFixed(2)}
            </span>
          </div>
        ))}
        <div className="flex justify-between items-center pt-2 mt-1" style={{ borderTop: '2px solid var(--verde)' }}>
          <span className="font-barlow font-bold text-xs tracking-wider uppercase" style={{ color: 'var(--verde)' }}>(=) LUCRO REAL</span>
          <span className="font-bebas text-3xl" style={{ color: lucroReal >= 0 ? 'var(--verde)' : '#ff6b6b' }}>R${lucroReal.toFixed(2)}</span>
        </div>
        {atends.length > 0 && (
          <div className="font-barlow text-xs mt-2" style={{ color: '#555' }}>
            🎯 Ticket médio líquido: <strong style={{ color: 'var(--verde)' }}>R${ticketMedio.toFixed(2)}</strong> · {atends.length} atendimento(s)
          </div>
        )}
      </div>

      {/* Meta */}
      <div className="rounded-xl p-4 mb-4" style={{ background: 'var(--surface)', border: '1px solid var(--borda)' }}>
        <div className="flex justify-between items-center mb-3">
          <div className="font-barlow font-bold text-xs tracking-[2px] uppercase" style={{ color: 'var(--verde)' }}>🎯 Meta de Caixa</div>
          <button onClick={() => setEditMeta(!editMeta)} className="font-barlow text-xs tracking-wider uppercase px-2 py-1 rounded-lg"
            style={{ border: '1px solid #333', color: '#777', background: 'transparent' }}>EDITAR</button>
        </div>
        {editMeta && (
          <div className="flex gap-2 mb-3">
            <input type="number" value={metaInput} onChange={e => setMetaInput(e.target.value)}
              className="flex-1 rounded-xl px-4 py-2 text-sm outline-none"
              style={{ background: 'var(--bg)', border: '1px solid var(--borda)', color: 'var(--texto)' }} />
            <button onClick={() => { setMeta(Number(metaInput)); setEditMeta(false) }}
              className="px-4 py-2 rounded-xl font-barlow font-bold text-sm"
              style={{ background: 'var(--verde)', color: '#080808', border: 'none' }}>OK</button>
          </div>
        )}
        <div className="flex justify-between items-center mb-2">
          <span className="font-barlow text-sm" style={{ color: '#aaa' }}>Meta mensal: <strong style={{ color: 'var(--texto)' }}>R${meta.toFixed(0)}</strong></span>
          <span className="font-bebas text-xl" style={{ color: corMeta }}>{metaPct.toFixed(0)}%</span>
        </div>
        <div className="h-2 rounded-full" style={{ background: 'var(--surface2)' }}>
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${metaPct}%`, background: corMeta }} />
        </div>
        <div className="font-barlow text-xs mt-1" style={{ color: '#555' }}>
          {meta > 0 ? `Faltam R$${Math.max(0, meta - totalLiquido).toFixed(0)} para atingir a meta` : 'Toque em EDITAR para definir sua meta'}
        </div>
      </div>

      {/* Divisão de fundos */}
      <div className="rounded-xl p-4 mb-4" style={{ background: 'var(--surface)', border: '1px solid var(--borda)' }}>
        <div className="font-barlow font-bold text-xs tracking-[2px] uppercase mb-3" style={{ color: 'var(--verde)' }}>💰 Divisão dos Fundos</div>
        {[
          { label: '🏠 Contas Fixas', pct: divisao.contas, cor: '#74b9ff' },
          { label: '🔧 Máquinas', pct: divisao.maquinas, cor: '#a29bfe' },
          { label: '🧴 Estoque', pct: divisao.estoque, cor: '#fd79a8' },
          { label: '💰 Lucro Real', pct: divisao.lucro, cor: 'var(--verde)' },
        ].map((f, i) => (
          <div key={i} className="mb-3">
            <div className="flex justify-between items-center mb-1">
              <span className="font-barlow text-sm">{f.label} ({f.pct}%)</span>
              <span className="font-bebas text-xl" style={{ color: f.cor }}>R${(totalLiquido * f.pct / 100).toFixed(2)}</span>
            </div>
            <div className="h-1.5 rounded-full" style={{ background: 'var(--surface2)' }}>
              <div className="h-full rounded-full opacity-70" style={{ width: `${f.pct}%`, background: f.cor }} />
            </div>
          </div>
        ))}
      </div>

      {/* Gráfico */}
      <div className="rounded-xl p-4 mb-4" style={{ background: 'var(--surface)', border: '1px solid var(--borda)' }}>
        <div className="font-barlow font-bold text-xs tracking-[2px] uppercase mb-4" style={{ color: 'var(--verde)' }}>
          📊 Faturamento por período
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '120px', position: 'relative' }}>
          {graficoData.map((p, i) => {
            const h = maxVal > 0 ? Math.max((p.val / maxVal) * 100, p.val > 0 ? 4 : 0) : 0
            const isSelected = graficoPeriodo === p.key
            const isCurrent = periodo === 'semana' ? p.key === getSemanaAtual() : p.key === getMesAtual()
            const barColor = isSelected ? '#AAFF00' : isCurrent ? '#5abf00' : '#2a3a00'
            const barBorder = isSelected || isCurrent ? '1px solid var(--verde)' : '1px solid transparent'
            return (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%', cursor: 'pointer' }}
                onClick={() => setGraficoPeriodo(isSelected ? null : p.key)}>
                {p.val > 0 && (
                  <div style={{ fontSize: '9px', marginBottom: '3px', color: isCurrent || isSelected ? 'var(--verde)' : '#555', textAlign: 'center', lineHeight: 1 }}>
                    R${p.val.toFixed(0)}
                  </div>
                )}
                <div style={{
                  width: '100%',
                  height: `${h}%`,
                  minHeight: p.val > 0 ? '3px' : '0',
                  background: barColor,
                  border: barBorder,
                  borderRadius: '3px 3px 0 0',
                  transition: 'height 0.4s ease'
                }} />
                <div style={{ fontSize: '9px', marginTop: '4px', color: isCurrent || isSelected ? 'var(--verde)' : '#444', textAlign: 'center' }}>
                  {p.label}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Saídas */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-3">
          <div className="font-barlow font-bold text-xs tracking-[2px] uppercase" style={{ color: 'var(--verde)' }}>
            Saídas Registradas
            {totalSaidas > 0 && <span className="ml-2 font-bebas text-base" style={{ color: '#ff6b6b' }}>-R${totalSaidas.toFixed(2)}</span>}
          </div>
          <button onClick={() => { setSaidaData(new Date().toISOString().slice(0,10)); setModalSaida(true) }}
            className="px-3 py-2 rounded-xl font-barlow font-bold text-xs tracking-widest uppercase"
            style={{ background: 'var(--verde)', color: '#080808', border: 'none' }}>
            + SAÍDA
          </button>
        </div>
        {saidasFil.length === 0 ? (
          <div className="text-center py-6 font-barlow text-sm" style={{ color: 'var(--dim)' }}>Nenhuma saída no período</div>
        ) : [...saidasFil].reverse().map(s => (
          <div key={s.id} className="flex justify-between items-center rounded-xl p-3 mb-2"
            style={{ background: 'var(--surface)', border: '1px solid var(--borda)' }}>
            <div>
              <div className="font-barlow text-sm">{s.desc}</div>
              <div className="font-barlow text-xs mt-0.5" style={{ color: 'var(--dim)' }}>{formatarDataBR(String(s.data))}</div>
            </div>
            <div className="flex items-center gap-2">
              <div className="font-bebas text-xl" style={{ color: '#ff6b6b' }}>-R${parseValor(s.valor).toFixed(2)}</div>
              <button onClick={() => excluirSaida(s.id)} className="text-sm" style={{ background: 'none', border: 'none', color: '#444', cursor: 'pointer' }}>✕</button>
            </div>
          </div>
        ))}
      </div>

      {/* Atendimentos */}
      <div className="mb-4">
        <div className="font-barlow font-bold text-xs tracking-[2px] uppercase mb-3" style={{ color: 'var(--verde)' }}>
          Atendimentos do Período
        </div>
        {atends.length === 0 ? (
          <div className="text-center py-6 font-barlow text-sm" style={{ color: 'var(--dim)' }}>Nenhum atendimento no período</div>
        ) : [...atends].reverse().map((a, i) => (
          <div key={i} className="rounded-xl p-3 mb-2" style={{ background: 'var(--surface)', border: '1px solid var(--borda)' }}>
            <div className="flex justify-between items-start">
              <div>
                <div className="font-barlow font-bold text-sm uppercase">{a.nomeCliente || 'Cliente'}</div>
                <div className="font-barlow text-xs mt-0.5" style={{ color: 'var(--dim)' }}>{a.servicos}</div>
                <div className="font-barlow text-xs mt-0.5" style={{ color: 'var(--dim)' }}>
                  {formatarDataBR(a.data)} {a.formaPagamento && `· ${String(a.formaPagamento).toUpperCase()}`}
                </div>
              </div>
              <div className="font-bebas text-2xl" style={{ color: 'var(--verde)' }}>
                R${(parseValor(a.valorLiquido) || parseValor(a.valor)).toFixed(0)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Saída */}
      {modalSaida && (
        <div className="fixed inset-0 z-[10001] flex items-end justify-center" style={{ background: 'rgba(0,0,0,.8)' }}>
          <div className="w-full max-w-[500px] rounded-t-2xl p-6 pb-10" style={{ background: 'var(--surface2)' }}>
            <div className="font-bebas text-2xl tracking-widest mb-4" style={{ color: 'var(--verde)' }}>NOVA SAÍDA</div>
            <div className="mb-3">
              <label className="font-barlow text-xs font-bold tracking-wider uppercase block mb-1" style={{ color: '#777' }}>Descrição</label>
              <input value={saidaDesc} onChange={e => setSaidaDesc(e.target.value)} placeholder="Ex: Shampoo, Microfibra..."
                className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                style={{ background: 'var(--bg)', border: '1px solid var(--borda)', color: 'var(--texto)' }} />
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="font-barlow text-xs font-bold tracking-wider uppercase block mb-1" style={{ color: '#777' }}>Valor (R$)</label>
                <input type="number" value={saidaVal} onChange={e => setSaidaVal(e.target.value)} placeholder="0,00"
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                  style={{ background: 'var(--bg)', border: '1px solid var(--borda)', color: 'var(--texto)' }} />
              </div>
              <div>
                <label className="font-barlow text-xs font-bold tracking-wider uppercase block mb-1" style={{ color: '#777' }}>Data</label>
                <input type="date" value={saidaData} onChange={e => setSaidaData(e.target.value)}
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                  style={{ background: 'var(--bg)', border: '1px solid var(--borda)', color: 'var(--texto)' }} />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setModalSaida(false)}
                className="flex-1 py-3 rounded-xl font-barlow font-bold text-sm tracking-widest uppercase"
                style={{ border: '1px solid #333', color: '#777', background: 'transparent' }}>Cancelar</button>
              <button onClick={salvarSaida}
                className="flex-2 flex-1 py-3 rounded-xl font-barlow font-extrabold text-sm tracking-widest uppercase"
                style={{ background: 'var(--verde)', color: '#080808', border: 'none' }}>SALVAR</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
