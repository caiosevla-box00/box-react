import React, { useState } from 'react'
import { useStore } from '@/store'
import { apiCall } from '@/lib/api'
import { hoje, formatarDataBR, gerarId, diasDesde } from '@/lib/utils'
import type { Cliente } from '@/types'

const ORIGENS: Record<string, string> = {
  vizinho: '🏘 Vizinho', instagram: '📸 Instagram',
  whatsapp: '💬 WhatsApp', indicacao: '🤝 Indicação', outro: '🔹 Outro'
}
const TIPOS_V: Record<string, string> = {
  hatch: '🚗 Hatch', sedan: '🚙 Sedan', suv: '🛻 SUV/Pickup'
}
const EMPTY: Cliente = { id: '', nome: '', email: '', tel: '', ig: '', origem: '', tipoVeiculo: 'hatch', marca: '', modelo: '', ano: '', cor: '', atendimentos: [] }

function Avatar({ nome, warn }: { nome: string; warn?: boolean }) {
  const inicial = nome.trim()[0]?.toUpperCase() || '?'
  return (
    <div style={{
      width: '42px', height: '42px', borderRadius: '12px', flexShrink: 0,
      background: warn ? 'rgba(240,165,0,.1)' : 'var(--verde-bg)',
      border: `1.5px solid ${warn ? 'var(--alerta)' : 'var(--verde)'}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '16px', fontWeight: 700,
      color: warn ? 'var(--alerta)' : 'var(--verde)',
    }}>{inicial}</div>
  )
}

export function Clientes() {
  const { clientes, setClientes, showToast } = useStore()
  const [busca, setBusca] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [perfilId, setPerfilId] = useState<string | null>(null)
  const [form, setForm] = useState<Cliente>(EMPTY)
  const [editId, setEditId] = useState<string | null>(null)

  const filtrados = busca ? clientes.filter(c => c.nome?.toLowerCase().includes(busca.toLowerCase()) || (c.tel || '').includes(busca)) : clientes
  const totalFat = clientes.reduce((a, c) => a + (c.atendimentos || []).reduce((b, at) => b + (parseFloat(String(at.valor)) || 0), 0), 0)
  const comAlerta = clientes.filter(c => { const d = diasDesde(c.atendimentos?.slice(-1)[0]?.data || ''); return d !== null && d >= 30 }).length

  async function salvar() {
    if (!form.nome.trim()) { showToast('⚠️ Nome é obrigatório'); return }
    const lista = [...clientes]
    const dados: Cliente = { ...form, id: editId || gerarId(), criadoEm: editId ? clientes.find(x => x.id === editId)?.criadoEm || hoje() : hoje(), atendimentos: editId ? clientes.find(x => x.id === editId)?.atendimentos || [] : [] }
    if (editId) { const idx = lista.findIndex(x => x.id === editId); if (idx >= 0) lista[idx] = dados }
    else lista.unshift(dados)
    setClientes(lista); setModalOpen(false)
    const r = await apiCall('salvarCliente', { cliente: dados })
    showToast(r.ok ? '☁️ Salvo!' : '💾 Salvo local')
  }

  async function excluir() {
    if (!editId || !confirm('Excluir este cliente?')) return
    setClientes(clientes.filter(x => x.id !== editId)); setModalOpen(false); setPerfilId(null)
    apiCall('excluirCliente', { id: editId }); showToast('🗑 Removido')
  }

  function chamarDeVolta(c: Cliente) {
    if (!c.tel) return
    const veiculo = [c.marca, c.modelo, c.cor].filter(Boolean).join(' ')
    const msg = `Oi ${c.nome.split(' ')[0]}! 🚗✨\n\nFaz um tempinho que não vejo você por aqui...\n\n${veiculo ? `Seu ${veiculo} está precisando de cuidado? 😄\n\n` : ''}Tenho agenda disponível essa semana!\nMe chama aqui 👇\n\nBOX 0.0 — Estética Automotiva 🏁`
    window.open(`https://wa.me/55${(c.tel || '').replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  const perfil = perfilId ? clientes.find(x => x.id === perfilId) : null

  const S = { // styles
    card: { background: 'var(--surface)', border: '1.5px solid var(--borda)', borderRadius: 'var(--radius-md)', padding: '14px', marginBottom: '8px', cursor: 'pointer' } as React.CSSProperties,
    label: { fontSize: '11px', fontWeight: 600, color: '#777', letterSpacing: '1px', textTransform: 'uppercase' as const, display: 'block', marginBottom: '6px' },
    input: { width: '100%', background: 'var(--surface2)', border: '1px solid var(--borda)', borderRadius: 'var(--radius-sm)', padding: '12px 14px', color: 'var(--texto)', outline: 'none' } as React.CSSProperties,
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <div style={{ fontSize: '20px', fontWeight: 700 }}>Clientes</div>
        <button onClick={() => { setForm({ ...EMPTY }); setEditId(null); setModalOpen(true) }}
          style={{ background: 'var(--verde)', color: '#000', fontSize: '13px', fontWeight: 700, padding: '9px 18px', borderRadius: '20px', border: 'none', cursor: 'pointer' }}>
          + Novo
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '14px' }}>
        {[
          { v: clientes.length, l: 'Clientes', i: '👥', c: 'var(--verde)' },
          { v: `R$${totalFat.toFixed(0)}`, l: 'Faturado', i: '💰', c: 'var(--verde)' },
          { v: comAlerta, l: 'Retorno', i: '🔔', c: comAlerta > 0 ? 'var(--alerta)' : 'var(--verde)' },
        ].map((s, i) => (
          <div key={i} style={{ background: 'var(--surface)', borderRadius: 'var(--radius-sm)', padding: '12px 8px', textAlign: 'center' }}>
            <div style={{ fontSize: '20px' }}>{s.i}</div>
            <div style={{ fontSize: '17px', fontWeight: 700, color: s.c, marginTop: '4px' }}>{s.v}</div>
            <div style={{ fontSize: '10px', color: 'var(--dim)', marginTop: '2px' }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Busca */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--borda)', borderRadius: 'var(--radius-sm)', padding: '11px 14px', display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '14px' }}>
        <span style={{ color: '#444', fontSize: '16px' }}>🔍</span>
        <input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar cliente..."
          style={{ background: 'none', border: 'none', color: 'var(--texto)', fontSize: '15px', width: '100%', outline: 'none' }} />
      </div>

      {/* Lista */}
      {filtrados.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--dim)' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>👥</div>
          <div>{busca ? 'Nenhum cliente encontrado' : 'Nenhum cliente ainda'}</div>
        </div>
      ) : filtrados.map(c => {
        const ats = c.atendimentos || []
        const total = ats.reduce((a, at) => a + (parseFloat(String(at.valor)) || 0), 0)
        const ultimo = ats.length ? ats[ats.length - 1] : null
        const dias = diasDesde(formatarDataBR(ultimo?.data || ''))
        const alerta = dias !== null && dias >= 30
        return (
          <div key={c.id} onClick={() => setPerfilId(c.id)}
            style={{ ...S.card, borderColor: alerta ? 'rgba(240,165,0,.4)' : 'var(--borda)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Avatar nome={c.nome} warn={alerta} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '15px', fontWeight: 600 }}>{c.nome}</div>
                <div style={{ fontSize: '12px', color: 'var(--dim)', marginTop: '2px' }}>
                  {TIPOS_V[c.tipoVeiculo || ''] || ''} {c.marca || ''} {c.modelo || ''}
                </div>
                {alerta && (
                  <div style={{ display: 'inline-block', fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: '20px', marginTop: '5px', background: 'rgba(240,165,0,.1)', color: 'var(--alerta)', border: '1px solid rgba(240,165,0,.3)' }}>
                    🔔 {dias}d sem retorno
                  </div>
                )}
                {!alerta && c.origem && (
                  <div style={{ display: 'inline-block', fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: '20px', marginTop: '5px', background: 'rgba(170,255,0,.08)', color: 'var(--verde)', border: '1px solid rgba(170,255,0,.2)' }}>
                    {ORIGENS[c.origem] || c.origem}
                  </div>
                )}
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--verde)' }}>R${total.toFixed(0)}</div>
                <div style={{ fontSize: '11px', color: 'var(--dim)' }}>{ats.length} atend.</div>
              </div>
            </div>
            {ultimo && (
              <div style={{ borderTop: '1px solid var(--borda)', marginTop: '10px', paddingTop: '8px', fontSize: '12px', color: 'var(--dim)' }}>
                Último: {formatarDataBR(ultimo.data)} · {ultimo.servicos}
              </div>
            )}
          </div>
        )
      })}

      {/* Perfil */}
      {perfil && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 10000, background: 'var(--bg)', overflowY: 'auto' }}>
          <div style={{ maxWidth: '500px', margin: '0 auto', padding: '20px 16px 40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ fontSize: '18px', fontWeight: 700 }}>Perfil</div>
              <button onClick={() => setPerfilId(null)} style={{ background: '#1c1c1c', border: '1px solid #333', color: '#ccc', padding: '8px 14px', borderRadius: '10px', cursor: 'pointer' }}>✕</button>
            </div>
            {/* Card principal */}
            <div style={{ background: 'var(--verde-bg)', border: '2px solid var(--verde)', borderRadius: 'var(--radius-lg)', padding: '18px', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
                <Avatar nome={perfil.nome} />
                <div>
                  <div style={{ fontSize: '20px', fontWeight: 700 }}>{perfil.nome}</div>
                  <div style={{ fontSize: '12px', color: 'var(--dim)', marginTop: '3px' }}>
                    {perfil.tel && <span>📞 {perfil.tel} · </span>}
                    {TIPOS_V[perfil.tipoVeiculo || ''] || ''} {perfil.marca || ''} {perfil.modelo || ''}
                  </div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                {[
                  { v: (perfil.atendimentos || []).length, l: 'Atend.' },
                  { v: `R$${(perfil.atendimentos || []).reduce((a, at) => a + (parseFloat(String(at.valor)) || 0), 0).toFixed(0)}`, l: 'Total' },
                  { v: (() => { const d = diasDesde(formatarDataBR(perfil.atendimentos?.slice(-1)[0]?.data || '')); return d !== null ? `${d}d` : '—' })(), l: 'Último' },
                ].map((s, i) => (
                  <div key={i} style={{ background: 'rgba(0,0,0,.3)', borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
                    <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--verde)' }}>{s.v}</div>
                    <div style={{ fontSize: '10px', color: 'var(--verde-dim)', marginTop: '2px' }}>{s.l}</div>
                  </div>
                ))}
              </div>
            </div>
            {/* Chamar de volta */}
            {(() => { const d = diasDesde(formatarDataBR(perfil.atendimentos?.slice(-1)[0]?.data || '')); return d !== null && d >= 30 && perfil.tel ? (
              <button onClick={() => chamarDeVolta(perfil)}
                style={{ width: '100%', background: 'rgba(240,165,0,.1)', border: '1px solid var(--alerta)', color: 'var(--alerta)', padding: '12px', borderRadius: 'var(--radius-md)', fontSize: '13px', fontWeight: 700, cursor: 'pointer', marginBottom: '10px', letterSpacing: '1px' }}>
                🔔 Chamar de volta — {d} dias sem visita
              </button>
            ) : null })()}
            {/* Ações */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
              <button onClick={() => { setForm({ ...perfil }); setEditId(perfil.id); setModalOpen(true); setPerfilId(null) }}
                style={{ flex: 1, padding: '12px', borderRadius: 'var(--radius-md)', fontSize: '13px', fontWeight: 700, cursor: 'pointer', background: 'transparent', border: '1px solid var(--verde)', color: 'var(--verde)' }}>
                ✏️ Editar
              </button>
            </div>
            {/* Histórico */}
            <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--dim)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '10px' }}>Histórico</div>
            {(perfil.atendimentos || []).length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px', color: 'var(--dim)', fontSize: '14px' }}>Nenhum atendimento registrado</div>
            ) : [...(perfil.atendimentos || [])].reverse().map((at, i) => (
              <div key={i} style={{ background: 'var(--surface)', border: '1px solid var(--borda)', borderRadius: 'var(--radius-md)', padding: '14px', marginBottom: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '12px', color: 'var(--dim)' }}>{formatarDataBR(at.data)}</div>
                    <div style={{ fontSize: '14px', fontWeight: 500, marginTop: '3px' }}>{at.servicos}</div>
                    {at.formaPagamento && <div style={{ fontSize: '12px', color: 'var(--dim)', marginTop: '2px' }}>{String(at.formaPagamento).toUpperCase()}{Number(at.parcelas) > 1 ? ` ${at.parcelas}x` : ''}</div>}
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--verde)', marginLeft: '12px' }}>
                    R${parseFloat(String(at.valorLiquido || at.valor || 0)).toFixed(0)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal cadastro */}
      {modalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 10001, background: 'var(--bg)', overflowY: 'auto' }}>
          <div style={{ maxWidth: '500px', margin: '0 auto', padding: '20px 16px 40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ fontSize: '18px', fontWeight: 700 }}>{editId ? 'Editar Cliente' : 'Novo Cliente'}</div>
              <button onClick={() => setModalOpen(false)} style={{ background: '#1c1c1c', border: '1px solid #333', color: '#ccc', padding: '8px 14px', borderRadius: '10px', cursor: 'pointer' }}>✕</button>
            </div>
            {[
              { l: 'Nome *', k: 'nome', t: 'text', p: 'Nome completo' },
              { l: 'Telefone / WhatsApp', k: 'tel', t: 'tel', p: '(11) 99999-9999' },
              { l: 'Instagram', k: 'ig', t: 'text', p: '@perfil' },
              { l: 'E-mail', k: 'email', t: 'email', p: 'email@email.com' },
              { l: 'Marca', k: 'marca', t: 'text', p: 'Ex: Hyundai' },
              { l: 'Modelo', k: 'modelo', t: 'text', p: 'Ex: HB20' },
              { l: 'Ano', k: 'ano', t: 'number', p: '2020' },
              { l: 'Cor', k: 'cor', t: 'text', p: 'Ex: Prata' },
            ].map(f => (
              <div key={f.k} style={{ marginBottom: '12px' }}>
                <label style={S.label}>{f.l}</label>
                <input type={f.t} value={(form as any)[f.k] || ''} placeholder={f.p}
                  onChange={e => setForm(p => ({ ...p, [f.k]: e.target.value }))} style={S.input} />
              </div>
            ))}
            <div style={{ marginBottom: '12px' }}>
              <label style={S.label}>Como chegou</label>
              <select value={form.origem || ''} onChange={e => setForm(p => ({ ...p, origem: e.target.value }))} style={{ ...S.input, appearance: 'auto' }}>
                <option value="">Selecione...</option>
                {Object.entries(ORIGENS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={S.label}>Tipo de veículo</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
                {Object.entries(TIPOS_V).map(([k, v]) => (
                  <button key={k} onClick={() => setForm(p => ({ ...p, tipoVeiculo: k }))}
                    style={{ padding: '10px 4px', borderRadius: 'var(--radius-sm)', fontSize: '12px', fontWeight: 600, border: `1px solid ${form.tipoVeiculo === k ? 'var(--verde)' : 'var(--borda)'}`, background: form.tipoVeiculo === k ? 'var(--verde-bg)' : 'var(--surface)', color: form.tipoVeiculo === k ? 'var(--verde)' : 'var(--dim)', cursor: 'pointer' }}>
                    {v}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {editId && <button onClick={excluir} style={{ flex: 1, padding: '14px', borderRadius: 'var(--radius-md)', fontSize: '14px', fontWeight: 700, cursor: 'pointer', background: 'transparent', border: '1px solid var(--erro)', color: 'var(--erro)' }}>🗑 Excluir</button>}
              <button onClick={salvar} style={{ flex: 2, padding: '14px', borderRadius: 'var(--radius-md)', fontSize: '14px', fontWeight: 700, cursor: 'pointer', background: 'var(--verde)', color: '#000', border: 'none' }}>SALVAR</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
