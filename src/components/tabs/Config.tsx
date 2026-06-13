import { useState } from 'react'
import { useStore } from '@/store'
import { SERVICOS } from '@/lib/servicos'
import { apiCall } from '@/lib/api'

export function Config() {
  const { precos, setPrecos, divisao, setDivisao, meta, setMeta, taxaDebito, showToast } = useStore()
  const [saving, setSaving] = useState(false)
  const [divLocal, setDivLocal] = useState({ ...divisao })
  const [metaLocal, setMetaLocal] = useState(String(meta))
  const [precosLocal, setPrecosLocal] = useState({ ...precos })

  async function salvarTudo() {
    setSaving(true)
    const config: Record<string, string> = {}
    SERVICOS.forEach(s => {
      ;(['hatch','sedan','suv'] as const).forEach(v => {
        config[`preco_${s.id}_${v}`] = String(precosLocal[s.id]?.[v] ?? 0)
      })
    })
    config['divisao_contas']   = String(divLocal.contas)
    config['divisao_maquinas'] = String(divLocal.maquinas)
    config['divisao_estoque']  = String(divLocal.estoque)
    config['divisao_lucro']    = String(divLocal.lucro)
    config['meta_mensal']      = metaLocal

    setPrecos(precosLocal)
    setDivisao(divLocal)
    setMeta(Number(metaLocal))

    const r = await apiCall('salvarConfig', { config })
    setSaving(false)
    showToast(r.ok ? '☁️ Configurações salvas!' : '💾 Salvo local')
  }

  const totalDiv = divLocal.contas + divLocal.maquinas + divLocal.estoque + divLocal.lucro

  return (
    <div>
      <div className="font-bebas text-2xl tracking-widest mb-1" style={{ color: 'var(--verde)' }}>Configurações</div>
      <div className="font-barlow text-xs tracking-widest uppercase mb-4" style={{ color: '#555' }}>Preços, taxas e divisão de fundos</div>

      {/* Preços por serviço */}
      <div className="rounded-xl p-4 mb-4" style={{ background: 'var(--card)', border: '1px solid var(--borda)' }}>
        <div className="font-barlow font-bold text-xs tracking-[2px] uppercase mb-3" style={{ color: 'var(--verde)' }}>💰 Preços dos Serviços</div>
        <div className="grid grid-cols-4 gap-1 mb-2 text-center">
          {['Serviço','Hatch','Sedan','SUV'].map(h => (
            <div key={h} className="font-barlow text-[10px] font-bold tracking-wider uppercase" style={{ color: '#555' }}>{h}</div>
          ))}
        </div>
        {SERVICOS.map(s => (
          <div key={s.id} className="grid grid-cols-4 gap-1 mb-1 items-center">
            <div className="font-barlow text-xs leading-tight" style={{ color: '#aaa' }}>{s.nome}</div>
            {(['hatch','sedan','suv'] as const).map(v => (
              <input key={v} type="number"
                value={precosLocal[s.id]?.[v] ?? s.base[v]}
                onChange={e => setPrecosLocal(prev => ({ ...prev, [s.id]: { ...prev[s.id], [v]: Number(e.target.value) } }))}
                className="rounded-lg px-2 py-1.5 text-center font-bebas text-base outline-none w-full"
                style={{ background: '#000', border: '1px solid #333', color: 'var(--verde)' }} />
            ))}
          </div>
        ))}
      </div>

      {/* Divisão de fundos */}
      <div className="rounded-xl p-4 mb-4" style={{ background: 'var(--card)', border: '1px solid var(--borda)' }}>
        <div className="font-barlow font-bold text-xs tracking-[2px] uppercase mb-3" style={{ color: 'var(--verde)' }}>
          💰 Divisão dos Fundos
          <span className="ml-2 font-barlow text-xs" style={{ color: totalDiv !== 100 ? '#ff6b6b' : '#555' }}>
            Total: {totalDiv}% {totalDiv !== 100 && '⚠️ deve ser 100%'}
          </span>
        </div>
        {[
          { label: '🏠 Contas Fixas', key: 'contas' as const, cor: '#74b9ff' },
          { label: '🔧 Máquinas', key: 'maquinas' as const, cor: '#a29bfe' },
          { label: '🧴 Estoque', key: 'estoque' as const, cor: '#fd79a8' },
          { label: '💰 Lucro Real', key: 'lucro' as const, cor: 'var(--verde)' },
        ].map(f => (
          <div key={f.key} className="flex items-center gap-3 mb-3">
            <div className="flex-1 font-barlow text-sm">{f.label}</div>
            <div className="flex items-center gap-2">
              <input type="number" value={divLocal[f.key]}
                onChange={e => setDivLocal(prev => ({ ...prev, [f.key]: Number(e.target.value) }))}
                className="w-16 rounded-lg px-2 py-1.5 text-center font-bebas text-xl outline-none"
                style={{ background: '#000', border: `1px solid ${f.cor}`, color: f.cor }} />
              <span className="font-barlow text-sm" style={{ color: f.cor }}>%</span>
            </div>
          </div>
        ))}
      </div>

      {/* Meta mensal */}
      <div className="rounded-xl p-4 mb-5" style={{ background: 'var(--card)', border: '1px solid var(--borda)' }}>
        <div className="font-barlow font-bold text-xs tracking-[2px] uppercase mb-3" style={{ color: 'var(--verde)' }}>🎯 Meta Mensal</div>
        <div className="flex items-center gap-2">
          <span className="font-barlow text-sm" style={{ color: '#aaa' }}>R$</span>
          <input type="number" value={metaLocal} onChange={e => setMetaLocal(e.target.value)}
            className="flex-1 rounded-xl px-4 py-3 font-bebas text-2xl outline-none"
            style={{ background: '#000', border: '1px solid #333', color: 'var(--verde)' }} />
        </div>
      </div>

      <button onClick={salvarTudo} disabled={saving}
        className="w-full py-4 rounded-xl font-barlow font-extrabold text-base tracking-widest uppercase"
        style={{ background: saving ? '#333' : 'var(--verde)', color: '#080808', border: 'none' }}>
        {saving ? '⏳ Salvando...' : '☁️ SALVAR CONFIGURAÇÕES'}
      </button>
    </div>
  )
}
