import { useState } from 'react'
import { useStore } from '@/store'
import { apiCall } from '@/lib/api'
import { hoje, formatarDataBR, dataStrParaDate, gerarId, diasDesde } from '@/lib/utils'
import type { Cliente } from '@/types'

const ORIGENS: Record<string, string> = {
  vizinho: '🏘 Vizinho', instagram: '📸 Instagram',
  whatsapp: '💬 WhatsApp', indicacao: '🤝 Indicação', outro: '🔹 Outro'
}
const TIPOS_V: Record<string, string> = {
  hatch: '🚗 Hatch', sedan: '🚙 Sedan', suv: '🛻 SUV/Pickup'
}

const EMPTY: Cliente = {
  id: '', nome: '', email: '', tel: '', ig: '', origem: '',
  tipoVeiculo: 'hatch', marca: '', modelo: '', ano: '', cor: '', atendimentos: []
}

export function Clientes() {
  const { clientes, setClientes, showToast } = useStore()
  const [busca, setBusca] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [perfilId, setPerfilId] = useState<string | null>(null)
  const [form, setForm] = useState<Cliente>(EMPTY)
  const [editId, setEditId] = useState<string | null>(null)

  const filtrados = busca
    ? clientes.filter(c => c.nome?.toLowerCase().includes(busca.toLowerCase()) || c.tel?.includes(busca))
    : clientes

  const totalFat = clientes.reduce((a, c) => a + (c.atendimentos || []).reduce((b, at) => b + (parseFloat(String(at.valor)) || 0), 0), 0)

  function abrirNovo() {
    setForm({ ...EMPTY })
    setEditId(null)
    setModalOpen(true)
  }

  function abrirEditar(c: Cliente) {
    setForm({ ...c })
    setEditId(c.id)
    setModalOpen(true)
    setPerfilId(null)
  }

  async function salvar() {
    if (!form.nome.trim()) { showToast('⚠️ Nome é obrigatório'); return }
    const lista = [...clientes]
    const dados: Cliente = {
      ...form,
      id: editId || gerarId(),
      criadoEm: editId ? clientes.find(x => x.id === editId)?.criadoEm || hoje() : hoje(),
      atendimentos: editId ? clientes.find(x => x.id === editId)?.atendimentos || [] : []
    }
    if (editId) {
      const idx = lista.findIndex(x => x.id === editId)
      if (idx >= 0) lista[idx] = dados
    } else {
      lista.unshift(dados)
    }
    setClientes(lista)
    setModalOpen(false)
    const r = await apiCall('salvarCliente', { cliente: dados })
    showToast(r.ok ? '☁️ Salvo na nuvem!' : '💾 Salvo local')
  }

  async function excluir() {
    if (!editId) return
    if (!confirm('Excluir este cliente e todo o histórico?')) return
    const lista = clientes.filter(x => x.id !== editId)
    setClientes(lista)
    setModalOpen(false)
    setPerfilId(null)
    apiCall('excluirCliente', { id: editId })
    showToast('🗑 Cliente removido')
  }

  function chamarDeVolta(c: Cliente) {
    if (!c.tel) return
    const veiculo = [c.marca, c.modelo, c.cor].filter(Boolean).join(' ')
    const msg = `Oi ${c.nome.split(' ')[0]}! 🚗✨\n\nFaz um tempinho que não vejo você por aqui...\n\n`
      + (veiculo ? `Seu ${veiculo} está precisando de um cuidado especial? 😄\n\n` : `Seu carro está precisando de cuidado especial? 😄\n\n`)
      + `Tenho agenda disponível essa semana!\nMe chama aqui 👇\n\nBOX 0.0 — Estética Automotiva 🏁`
    const tel = c.tel.replace(/\D/g, '')
    window.open(`https://wa.me/55${tel}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  const perfil = perfilId ? clientes.find(x => x.id === perfilId) : null

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-3 gap-2">
        <div className="font-bebas text-2xl tracking-widest" style={{ color: 'var(--verde)' }}>Clientes</div>
        <button onClick={abrirNovo}
          className="font-barlow font-extrabold text-sm tracking-widest uppercase px-4 py-2 rounded-xl"
          style={{ background: 'var(--verde)', color: '#080808', border: 'none' }}>
          + NOVO
        </button>
      </div>

      {/* Cards resumo */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {[
          { val: clientes.length, label: 'Clientes', icon: '👥' },
          { val: `R$${totalFat.toFixed(0)}`, label: 'Faturado', icon: '💰' },
          { val: clientes.filter(c => { const d = diasDesde(c.atendimentos?.slice(-1)[0]?.data || ''); return d !== null && d >= 30 }).length, label: 'Sem retorno', icon: '🔔' },
        ].map((card, i) => (
          <div key={i} className="rounded-xl p-3 text-center" style={{ background: 'var(--card)', border: '1px solid var(--borda)' }}>
            <div className="text-xl mb-1">{card.icon}</div>
            <div className="font-bebas text-xl leading-none" style={{ color: 'var(--verde)' }}>{card.val}</div>
            <div className="font-barlow text-[10px] uppercase tracking-wider mt-1" style={{ color: 'var(--dim)' }}>{card.label}</div>
          </div>
        ))}
      </div>

      {/* Busca */}
      <div className="relative mb-4">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base">🔍</span>
        <input value={busca} onChange={e => setBusca(e.target.value)}
          placeholder="Buscar por nome ou telefone..."
          className="w-full rounded-xl py-3 pl-9 pr-4 text-sm outline-none"
          style={{ background: '#111', border: '1px solid var(--borda)', color: 'var(--texto)' }} />
      </div>

      {/* Lista */}
      {filtrados.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-3">👥</div>
          <div className="font-barlow text-sm" style={{ color: 'var(--dim)' }}>
            {busca ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado ainda'}
          </div>
        </div>
      ) : filtrados.map(c => {
        const ats = c.atendimentos || []
        const total = ats.reduce((a, at) => a + (parseFloat(String(at.valor)) || 0), 0)
        const ultimo = ats.length ? ats[ats.length - 1] : null
        const dias = diasDesde(formatarDataBR(ultimo?.data || ''))
        const alerta = dias !== null && dias >= 30

        return (
          <div key={c.id} onClick={() => setPerfilId(c.id)}
            className="rounded-xl p-4 mb-3 cursor-pointer transition-all"
            style={{ background: 'var(--card)', border: `1px solid ${alerta ? '#f0a50044' : 'var(--borda)'}` }}>
            <div className="flex justify-between items-start gap-3">
              <div className="flex-1">
                <div className="font-barlow font-bold text-base uppercase tracking-wide">{c.nome}</div>
                <div className="font-barlow text-xs mt-1 leading-relaxed" style={{ color: 'var(--dim)' }}>
                  {c.tel && <span>📞 {c.tel}<br /></span>}
                  {c.ig && <span>📸 {c.ig}<br /></span>}
                  {TIPOS_V[c.tipoVeiculo || ''] || ''} {c.marca || ''} {c.modelo || ''} {c.ano || ''}
                </div>
                {alerta && (
                  <div className="inline-block mt-2 px-2 py-0.5 rounded-full font-barlow text-[10px] font-bold tracking-wider uppercase"
                    style={{ background: 'rgba(240,165,0,.15)', border: '1px solid #f0a500', color: '#f0a500' }}>
                    🔔 {dias}d sem retorno
                  </div>
                )}
              </div>
              <div className="text-right flex-shrink-0">
                <div className="font-bebas text-2xl leading-none" style={{ color: 'var(--verde)' }}>R${total.toFixed(0)}</div>
                <div className="font-barlow text-[10px]" style={{ color: 'var(--dim)' }}>{ats.length} atend.</div>
                {c.origem && (
                  <div className="mt-1 px-2 py-0.5 rounded-full font-barlow text-[10px] inline-block"
                    style={{ background: 'var(--verde-bg)', border: '1px solid var(--verde-dim)', color: 'var(--verde)' }}>
                    {ORIGENS[c.origem] || c.origem}
                  </div>
                )}
              </div>
            </div>
            {ultimo && (
              <div className="mt-2 pt-2 font-barlow text-xs" style={{ borderTop: '1px solid var(--borda)', color: 'var(--dim)' }}>
                Último: {formatarDataBR(ultimo.data)} · {ultimo.servicos}
              </div>
            )}
          </div>
        )
      })}

      {/* Modal Perfil */}
      {perfil && (
        <div className="fixed inset-0 z-[10000] overflow-y-auto" style={{ background: '#080808' }}>
          <div className="max-w-[500px] mx-auto p-4 pb-20">
            <div className="flex justify-between items-center mb-5">
              <div className="font-bebas text-2xl tracking-widest" style={{ color: 'var(--verde)' }}>PERFIL</div>
              <button onClick={() => setPerfilId(null)}
                className="px-4 py-2 rounded-lg font-barlow text-sm font-bold"
                style={{ background: '#1c1c1c', border: '1px solid #333', color: '#ccc' }}>✕</button>
            </div>

            {/* Card principal */}
            <div className="rounded-xl p-5 mb-4" style={{ background: 'var(--card)', border: '2px solid var(--verde)' }}>
              <div className="font-bebas text-3xl tracking-wider">{perfil.nome}</div>
              <div className="font-barlow text-xs leading-loose mt-2" style={{ color: 'var(--dim)' }}>
                {perfil.tel && <div><a href={`tel:${perfil.tel}`} style={{ color: 'var(--verde)' }}>📞 {perfil.tel}</a></div>}
                {perfil.ig && <div><a href={`https://instagram.com/${perfil.ig.replace('@','')}`} target="_blank" style={{ color: 'var(--verde)' }}>📸 {perfil.ig}</a></div>}
                {perfil.origem && <div>{ORIGENS[perfil.origem]}</div>}
                <div>{TIPOS_V[perfil.tipoVeiculo || ''] || ''} {perfil.marca || ''} {perfil.modelo || ''} {perfil.ano || ''} {perfil.cor ? `· ${perfil.cor}` : ''}</div>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-4">
                {[
                  { val: (perfil.atendimentos || []).length, label: 'Atendimentos' },
                  { val: `R$${(perfil.atendimentos || []).reduce((a, at) => a + (parseFloat(String(at.valor)) || 0), 0).toFixed(0)}`, label: 'Total gasto' },
                  { val: (() => { const d = diasDesde(formatarDataBR(perfil.atendimentos?.slice(-1)[0]?.data || '')); return d !== null ? `${d}d` : '—' })(), label: 'Último visit.' },
                ].map((s, i) => (
                  <div key={i} className="rounded-lg p-3 text-center" style={{ background: '#111' }}>
                    <div className="font-bebas text-2xl leading-none" style={{ color: 'var(--verde)' }}>{s.val}</div>
                    <div className="font-barlow text-[10px] uppercase tracking-wider mt-1" style={{ color: 'var(--dim)' }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Botão chamar de volta */}
            {(() => {
              const dias = diasDesde(formatarDataBR(perfil.atendimentos?.slice(-1)[0]?.data || ''))
              return dias !== null && dias >= 30 && perfil.tel ? (
                <button onClick={() => chamarDeVolta(perfil)}
                  className="w-full py-3 rounded-xl font-barlow font-extrabold text-sm tracking-widest uppercase mb-3"
                  style={{ background: 'rgba(240,165,0,.15)', border: '1px solid #f0a500', color: '#f0a500' }}>
                  🔔 Chamar de volta — {dias} dias sem visita
                </button>
              ) : null
            })()}

            {/* Ações */}
            <div className="flex gap-2 mb-5">
              <button onClick={() => abrirEditar(perfil)}
                className="flex-1 py-3 rounded-xl font-barlow font-bold text-sm tracking-widest uppercase"
                style={{ background: 'transparent', border: '1px solid var(--verde)', color: 'var(--verde)' }}>
                ✏️ Editar
              </button>
            </div>

            {/* Histórico */}
            <div className="font-barlow text-xs font-bold tracking-[2px] uppercase mb-3" style={{ color: 'var(--dim)' }}>Histórico</div>
            {(perfil.atendimentos || []).length === 0 ? (
              <div className="text-center py-8 font-barlow text-sm" style={{ color: 'var(--dim)' }}>Nenhum atendimento registrado</div>
            ) : [...(perfil.atendimentos || [])].reverse().map((at, i) => (
              <div key={i} className="rounded-xl p-3 mb-2" style={{ background: '#111', border: '1px solid var(--borda)' }}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="font-barlow text-xs" style={{ color: 'var(--dim)' }}>{formatarDataBR(at.data)}</div>
                    <div className="font-barlow text-sm mt-1">{at.servicos}</div>
                    {at.formaPagamento && (
                      <div className="font-barlow text-xs mt-1" style={{ color: 'var(--dim)' }}>
                        {String(at.formaPagamento).toUpperCase()}{Number(at.parcelas) > 1 ? ` ${at.parcelas}x` : ''}
                      </div>
                    )}
                  </div>
                  <div className="font-bebas text-2xl ml-3" style={{ color: 'var(--verde)' }}>
                    R${parseFloat(String(at.valorLiquido || at.valor || 0)).toFixed(0)}
                  </div>
                </div>
                {at.obs && <div className="font-barlow text-xs mt-2 italic" style={{ color: 'var(--dim)' }}>{at.obs}</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Cadastro/Editar */}
      {modalOpen && (
        <div className="fixed inset-0 z-[10001] overflow-y-auto" style={{ background: '#080808' }}>
          <div className="max-w-[500px] mx-auto p-4 pb-20">
            <div className="flex justify-between items-center mb-5">
              <div className="font-bebas text-2xl tracking-widest" style={{ color: 'var(--verde)' }}>
                {editId ? 'EDITAR CLIENTE' : 'NOVO CLIENTE'}
              </div>
              <button onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded-lg font-barlow text-sm font-bold"
                style={{ background: '#1c1c1c', border: '1px solid #333', color: '#ccc' }}>✕</button>
            </div>

            {[
              { label: 'Nome *', key: 'nome', type: 'text', placeholder: 'Nome completo' },
              { label: 'E-mail', key: 'email', type: 'email', placeholder: 'cliente@email.com' },
              { label: 'Telefone / WhatsApp', key: 'tel', type: 'tel', placeholder: '(11) 99999-9999' },
              { label: 'Instagram', key: 'ig', type: 'text', placeholder: '@perfil' },
              { label: 'Marca', key: 'marca', type: 'text', placeholder: 'Ex: Hyundai' },
              { label: 'Modelo', key: 'modelo', type: 'text', placeholder: 'Ex: HB20' },
              { label: 'Ano', key: 'ano', type: 'number', placeholder: '2020' },
              { label: 'Cor', key: 'cor', type: 'text', placeholder: 'Ex: Prata' },
            ].map(f => (
              <div key={f.key} className="mb-3">
                <label className="font-barlow text-xs font-bold tracking-wider uppercase block mb-1" style={{ color: '#777' }}>{f.label}</label>
                <input type={f.type} value={(form as any)[f.key] || ''} placeholder={f.placeholder}
                  onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                  style={{ background: '#111', border: '1px solid var(--borda)', color: 'var(--texto)' }} />
              </div>
            ))}

            <div className="mb-3">
              <label className="font-barlow text-xs font-bold tracking-wider uppercase block mb-1" style={{ color: '#777' }}>Como chegou</label>
              <select value={form.origem || ''} onChange={e => setForm(prev => ({ ...prev, origem: e.target.value }))}
                className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                style={{ background: '#111', border: '1px solid var(--borda)', color: 'var(--texto)' }}>
                <option value="">Selecione...</option>
                {Object.entries(ORIGENS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>

            <div className="mb-5">
              <label className="font-barlow text-xs font-bold tracking-wider uppercase block mb-1" style={{ color: '#777' }}>Tipo de veículo</label>
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(TIPOS_V).map(([k, v]) => (
                  <button key={k} onClick={() => setForm(prev => ({ ...prev, tipoVeiculo: k }))}
                    className="py-3 rounded-xl font-barlow font-bold text-xs tracking-wider uppercase"
                    style={{
                      background: form.tipoVeiculo === k ? 'var(--verde-bg)' : '#111',
                      border: `1px solid ${form.tipoVeiculo === k ? 'var(--verde)' : 'var(--borda)'}`,
                      color: form.tipoVeiculo === k ? 'var(--verde)' : 'var(--dim)'
                    }}>{v}</button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              {editId && (
                <button onClick={excluir}
                  className="flex-1 py-3 rounded-xl font-barlow font-bold text-sm tracking-widest uppercase"
                  style={{ background: 'transparent', border: '1px solid var(--erro)', color: 'var(--erro)' }}>
                  🗑 Excluir
                </button>
              )}
              <button onClick={salvar}
                className="flex-2 flex-1 py-3 rounded-xl font-barlow font-extrabold text-sm tracking-widest uppercase"
                style={{ background: 'var(--verde)', color: '#080808', border: 'none' }}>
                SALVAR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
