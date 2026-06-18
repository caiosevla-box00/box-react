import React, { useState } from 'react'
import { useStore } from '@/store'
import { SERVICOS } from '@/lib/servicos'
import { apiCall } from '@/lib/api'
import { gerarId } from '@/lib/utils'

const CATEGORIAS_CUSTOM = ['Lavagens', 'Interior', 'Pintura', 'Polimento', 'Outros']

type SvcCustom = {
  id: string; nome: string; tempo: string; desc: string
  hatch: number; sedan: number; suv: number; categoria: string
}

const SVC_EMPTY: SvcCustom = { id: '', nome: '', tempo: '', desc: '', hatch: 0, sedan: 0, suv: 0, categoria: 'Outros' }

export function Config() {
  const { precos, setPrecos, divisao, setDivisao, meta, setMeta, showToast, servicosCustom, setServicosCustom } = useStore()
  const [saving, setSaving] = useState(false)
  const [divLocal, setDivLocal] = useState({ ...divisao })
  const [metaLocal, setMetaLocal] = useState(String(meta))
  const [precosLocal, setPrecosLocal] = useState({ ...precos })
  const [aba, setAba] = useState<'precos' | 'servicos' | 'fundos'>('precos')

  // Estado do modal de novo serviço
  const [modalSvc, setModalSvc] = useState(false)
  const [editSvcId, setEditSvcId] = useState<string | null>(null)
  const [formSvc, setFormSvc] = useState<SvcCustom>({ ...SVC_EMPTY })

  const totalDiv = divLocal.contas + divLocal.maquinas + divLocal.estoque + divLocal.lucro

  async function salvarPrecos() {
    setSaving(true)
    const config: Record<string, string> = {}
    SERVICOS.forEach(s => {
      ;(['hatch', 'sedan', 'suv'] as const).forEach(v => {
        config[`preco_${s.id}_${v}`] = String(precosLocal[s.id]?.[v] ?? 0)
      })
    })
    config['divisao_contas']   = String(divLocal.contas)
    config['divisao_maquinas'] = String(divLocal.maquinas)
    config['divisao_estoque']  = String(divLocal.estoque)
    config['divisao_lucro']    = String(divLocal.lucro)
    config['meta_mensal']      = metaLocal
    setPrecos(precosLocal); setDivisao(divLocal); setMeta(Number(metaLocal))
    const r = await apiCall('salvarConfig', { config })
    setSaving(false)
    showToast(r.ok ? '☁️ Configurações salvas!' : '💾 Salvo local')
  }

  function abrirNovoSvc() {
    setFormSvc({ ...SVC_EMPTY, id: gerarId() })
    setEditSvcId(null)
    setModalSvc(true)
  }

  function abrirEditarSvc(s: SvcCustom) {
    setFormSvc({ ...s })
    setEditSvcId(s.id)
    setModalSvc(true)
  }

  async function salvarSvc() {
    if (!formSvc.nome.trim()) { showToast('⚠️ Nome é obrigatório'); return }
    const lista = editSvcId
      ? servicosCustom.map(s => s.id === editSvcId ? formSvc : s)
      : [...servicosCustom, formSvc]
    setServicosCustom(lista)
    setModalSvc(false)
    // Sobe para Sheets como config
    const config: Record<string, string> = {}
    lista.forEach((s, i) => {
      config[`custom_svc_${i}_id`]       = s.id
      config[`custom_svc_${i}_nome`]     = s.nome
      config[`custom_svc_${i}_tempo`]    = s.tempo
      config[`custom_svc_${i}_desc`]     = s.desc
      config[`custom_svc_${i}_hatch`]    = String(s.hatch)
      config[`custom_svc_${i}_sedan`]    = String(s.sedan)
      config[`custom_svc_${i}_suv`]      = String(s.suv)
      config[`custom_svc_${i}_cat`]      = s.categoria
    })
    config['custom_svc_count'] = String(lista.length)
    const r = await apiCall('salvarConfig', { config })
    showToast(r.ok ? '☁️ Serviço salvo!' : '💾 Salvo local')
  }

  async function excluirSvc(id: string) {
    if (!confirm('Excluir este serviço?')) return
    const lista = servicosCustom.filter(s => s.id !== id)
    setServicosCustom(lista)
    setModalSvc(false)
    const config: Record<string, string> = {}
    lista.forEach((s, i) => {
      config[`custom_svc_${i}_id`]    = s.id
      config[`custom_svc_${i}_nome`]  = s.nome
      config[`custom_svc_${i}_tempo`] = s.tempo
      config[`custom_svc_${i}_desc`]  = s.desc
      config[`custom_svc_${i}_hatch`] = String(s.hatch)
      config[`custom_svc_${i}_sedan`] = String(s.sedan)
      config[`custom_svc_${i}_suv`]   = String(s.suv)
      config[`custom_svc_${i}_cat`]   = s.categoria
    })
    config['custom_svc_count'] = String(lista.length)
    apiCall('salvarConfig', { config })
    showToast('🗑 Serviço removido')
  }

  const S = {
    label: { fontSize: '11px', fontWeight: 600, color: 'var(--dim)', letterSpacing: '1px', textTransform: 'uppercase' as const, display: 'block', marginBottom: '6px' },
    input: { width: '100%', background: 'var(--bg)', border: '1px solid var(--borda)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', color: 'var(--texto)', outline: 'none' } as React.CSSProperties,
  }

  return (
    <div>
      <div style={{ fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>Configurações</div>

      {/* Sub abas */}
      <div style={{ display: 'flex', gap: '4px', background: 'var(--surface)', padding: '4px', borderRadius: 'var(--radius-md)', marginBottom: '16px' }}>
        {(['precos', 'servicos', 'fundos'] as const).map(a => (
          <button key={a} onClick={() => setAba(a)} style={{
            flex: 1, padding: '9px 4px', borderRadius: '10px', border: 'none', cursor: 'pointer',
            fontSize: '12px', fontWeight: 600, transition: 'all .15s',
            background: aba === a ? 'var(--verde)' : 'transparent',
            color: aba === a ? '#000' : 'var(--dim)',
          }}>
            {a === 'precos' ? '💰 Preços' : a === 'servicos' ? '✨ Serviços' : '📊 Fundos'}
          </button>
        ))}
      </div>

      {/* Preços */}
      {aba === 'precos' && (
        <div>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--borda)', borderRadius: 'var(--radius-md)', padding: '14px', marginBottom: '14px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '6px', marginBottom: '8px' }}>
              {['Serviço','Hatch','Sedan','SUV'].map(h => (
                <div key={h} style={{ ...S.label, marginBottom: 0, textAlign: h === 'Serviço' ? 'left' : 'center' }}>{h}</div>
              ))}
            </div>
            {SERVICOS.map(s => (
              <div key={s.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '6px', marginBottom: '6px', alignItems: 'center' }}>
                <div style={{ fontSize: '12px', color: 'var(--texto2)', lineHeight: 1.3 }}>{s.nome}</div>
                {(['hatch','sedan','suv'] as const).map(v => (
                  <input key={v} type="number"
                    value={precosLocal[s.id]?.[v] ?? s.base[v]}
                    onChange={e => setPrecosLocal(p => ({ ...p, [s.id]: { ...p[s.id], [v]: Number(e.target.value) } }))}
                    style={{ background: 'var(--bg)', border: '1px solid var(--borda)', borderRadius: '8px', padding: '8px 4px', color: 'var(--verde)', fontSize: '14px', fontWeight: 700, outline: 'none', textAlign: 'center', width: '100%' }} />
                ))}
              </div>
            ))}
          </div>
          <div style={{ marginBottom: '14px' }}>
            <label style={S.label}>Meta mensal (R$)</label>
            <input type="number" value={metaLocal} onChange={e => setMetaLocal(e.target.value)} style={S.input} />
          </div>
          <button onClick={salvarPrecos} disabled={saving}
            style={{ width: '100%', padding: '14px', borderRadius: 'var(--radius-md)', background: saving ? 'var(--dim)' : 'var(--verde)', color: '#000', border: 'none', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}>
            {saving ? 'Salvando...' : '☁️ Salvar Configurações'}
          </button>
        </div>
      )}

      {/* Meus Serviços */}
      {aba === 'servicos' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 600 }}>Meus Serviços</div>
              <div style={{ fontSize: '12px', color: 'var(--dim)', marginTop: '2px' }}>Serviços além dos padrão</div>
            </div>
            <button onClick={abrirNovoSvc}
              style={{ background: 'var(--verde)', color: '#000', fontSize: '13px', fontWeight: 700, padding: '9px 16px', borderRadius: '20px', border: 'none', cursor: 'pointer' }}>
              + Novo
            </button>
          </div>

          {servicosCustom.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', background: 'var(--surface)', borderRadius: 'var(--radius-md)', border: `1px dashed var(--borda)` }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>✨</div>
              <div style={{ fontSize: '15px', fontWeight: 600, marginBottom: '6px' }}>Nenhum serviço personalizado</div>
              <div style={{ fontSize: '13px', color: 'var(--dim)' }}>Crie serviços específicos do seu negócio — eles aparecem no orçamento e ficam salvos no Sheets.</div>
            </div>
          ) : servicosCustom.map(s => (
            <div key={s.id} onClick={() => abrirEditarSvc(s)}
              style={{ background: 'var(--surface)', border: '1px solid var(--verde)', borderRadius: 'var(--radius-md)', padding: '14px', marginBottom: '8px', cursor: 'pointer' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '15px', fontWeight: 600 }}>{s.nome}</div>
                  <div style={{ fontSize: '12px', color: 'var(--dim)', marginTop: '3px' }}>{s.tempo} · {s.categoria}</div>
                  {s.desc && <div style={{ fontSize: '12px', color: 'var(--dim)', marginTop: '4px' }}>{s.desc.slice(0, 60)}...</div>}
                </div>
                <div style={{ textAlign: 'right', marginLeft: '12px' }}>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--verde)' }}>R${s.hatch}</div>
                  <div style={{ fontSize: '10px', color: 'var(--dim)' }}>Hatch</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Fundos */}
      {aba === 'fundos' && (
        <div>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--borda)', borderRadius: 'var(--radius-md)', padding: '14px', marginBottom: '14px' }}>
            <div style={{ fontSize: '12px', color: totalDiv !== 100 ? 'var(--erro)' : 'var(--dim)', fontWeight: 600, marginBottom: '14px' }}>
              Total: {totalDiv}% {totalDiv !== 100 ? '⚠️ Deve ser 100%' : '✓'}
            </div>
            {[
              { label: '🏠 Contas Fixas', key: 'contas' as const, cor: 'var(--azul)' },
              { label: '🔧 Máquinas',     key: 'maquinas' as const, cor: 'var(--roxo)' },
              { label: '🧴 Estoque',      key: 'estoque' as const, cor: 'var(--rosa)' },
              { label: '💰 Lucro Real',   key: 'lucro' as const, cor: 'var(--verde)' },
            ].map(f => (
              <div key={f.key} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{ flex: 1, fontSize: '14px', fontWeight: 500 }}>{f.label}</div>
                <input type="number" value={divLocal[f.key]}
                  onChange={e => setDivLocal(p => ({ ...p, [f.key]: Number(e.target.value) }))}
                  style={{ width: '70px', background: 'var(--bg)', border: `1px solid ${f.cor}`, borderRadius: '10px', padding: '8px', color: f.cor, fontSize: '18px', fontWeight: 700, outline: 'none', textAlign: 'center' }} />
                <span style={{ fontSize: '14px', color: f.cor, fontWeight: 600 }}>%</span>
              </div>
            ))}
          </div>
          <button onClick={salvarPrecos} disabled={saving || totalDiv !== 100}
            style={{ width: '100%', padding: '14px', borderRadius: 'var(--radius-md)', background: totalDiv !== 100 ? 'var(--dim)' : 'var(--verde)', color: '#000', border: 'none', fontSize: '14px', fontWeight: 700, cursor: totalDiv !== 100 ? 'not-allowed' : 'pointer' }}>
            {saving ? 'Salvando...' : '☁️ Salvar Fundos'}
          </button>
        </div>
      )}

      {/* Modal novo/editar serviço */}
      {modalSvc && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 10001, background: 'var(--bg)', overflowY: 'auto' }}>
          <div style={{ maxWidth: '500px', margin: '0 auto', padding: '20px 16px 40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ fontSize: '18px', fontWeight: 700 }}>{editSvcId ? 'Editar Serviço' : 'Novo Serviço'}</div>
              <button onClick={() => setModalSvc(false)} style={{ background: 'var(--surface)', border: '1px solid var(--borda)', color: 'var(--texto)', padding: '8px 14px', borderRadius: '10px', cursor: 'pointer' }}>✕</button>
            </div>

            {[
              { l: 'Nome do serviço *', k: 'nome', p: 'Ex: Cristalização' },
              { l: 'Tempo estimado', k: 'tempo', p: 'Ex: 2h – 3h' },
              { l: 'Descrição (aparece no PDF)', k: 'desc', p: 'Descreva o que inclui...' },
            ].map(f => (
              <div key={f.k} style={{ marginBottom: '12px' }}>
                <label style={S.label}>{f.l}</label>
                <input value={(formSvc as any)[f.k]} onChange={e => setFormSvc(p => ({ ...p, [f.k]: e.target.value }))}
                  placeholder={f.p} style={S.input} />
              </div>
            ))}

            <div style={{ marginBottom: '12px' }}>
              <label style={S.label}>Categoria</label>
              <select value={formSvc.categoria} onChange={e => setFormSvc(p => ({ ...p, categoria: e.target.value }))}
                style={{ ...S.input, appearance: 'auto' } as any}>
                {CATEGORIAS_CUSTOM.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={S.label}>Preços por veículo (R$)</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                {([['hatch','🚗 Hatch'],['sedan','🚙 Sedan'],['suv','🛻 SUV']] as [keyof SvcCustom, string][]).map(([k,l]) => (
                  <div key={k}>
                    <div style={{ fontSize: '10px', color: 'var(--dim)', fontWeight: 600, textAlign: 'center', marginBottom: '4px' }}>{l}</div>
                    <input type="number" value={(formSvc as any)[k] || ''} onChange={e => setFormSvc(p => ({ ...p, [k]: Number(e.target.value) }))}
                      placeholder="0"
                      style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--verde)', borderRadius: '10px', padding: '10px 8px', color: 'var(--verde)', fontSize: '18px', fontWeight: 700, outline: 'none', textAlign: 'center' }} />
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              {editSvcId && (
                <button onClick={() => excluirSvc(editSvcId)}
                  style={{ flex: 1, padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--erro)', background: 'transparent', color: 'var(--erro)', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}>
                  🗑 Excluir
                </button>
              )}
              <button onClick={salvarSvc}
                style={{ flex: 2, padding: '14px', borderRadius: 'var(--radius-md)', background: 'var(--verde)', color: '#000', border: 'none', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}>
                SALVAR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
