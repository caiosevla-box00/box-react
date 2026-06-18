import { useState } from 'react'
import { useStore } from '@/store'
import { apiCall } from '@/lib/api'
import { gerarId, hoje, formatarDataBR, primeiroNome, dataISO } from '@/lib/utils'
import { SERVICOS, TEMPO_SERVICO } from '@/lib/servicos'
import type { Cliente, Agendamento } from '@/types'

const ORIGENS: Record<string,string> = {
  instagram:'📸 Instagram', indicacao:'🤝 Indicação',
  passagem:'🚶 Passagem', outro:'🔹 Outro'
}
const TIPOS_V = ['hatch','sedan','suv']
const TIPOS_V_L: Record<string,string> = { hatch:'🚗 Hatch', sedan:'🚙 Sedan', suv:'🛻 SUV' }
const DIAS_FULL = ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado']

interface Props {
  svcs: string[]
  svcIds: string[]
  total: number
  delivery: number
  desconto: number
  veiculo: 'hatch'|'sedan'|'suv'
  onPDF: () => void
  onFinalizado: () => void
  onCancelar: () => void
}

type Etapa = 'acao' | 'cliente' | 'novo_cliente' | 'agendar'

export function AcaoOrcamento({ svcs, svcIds, total, delivery, desconto, veiculo, onPDF, onFinalizado, onCancelar }: Props) {
  const { clientes, setClientes, agendamentos, setAgendamentos, showToast, servicosCustom } = useStore()

  const [etapa, setEtapa] = useState<Etapa>('acao')
  const [busca, setBusca] = useState('')
  const [clienteId, setClienteId] = useState('')

  // Novo cliente
  const [novoNome, setNovoNome] = useState('')
  const [novoTel, setNovoTel] = useState('')
  const [novoMarca, setNovoMarca] = useState('')
  const [novoModelo, setNovoModelo] = useState('')
  const [novoTipoV, setNovoTipoV] = useState('hatch')
  const [novoOrigem, setNovoOrigem] = useState('')

  // Agendamento
  const [agData, setAgData] = useState(dataISO(new Date()))
  const [agHora, setAgHora] = useState('')
  const [agSvcId, setAgSvcId] = useState(svcIds[0] || SERVICOS[0].id)
  const [agObs, setAgObs] = useState('')
  const [salvando, setSalvando] = useState(false)

  const clientesFil = busca
    ? clientes.filter(c => c.nome?.toLowerCase().includes(busca.toLowerCase()) || (c.tel||'').includes(busca))
    : clientes

  const clienteSel = clientes.find(c => c.id === clienteId)

  // ─── SALVAR NOVO CLIENTE ───────────────────────────────
  async function salvarNovoCliente() {
    if (!novoNome.trim()) { showToast('⚠️ Nome é obrigatório'); return }
    const novo: Cliente = {
      id: gerarId(), nome: novoNome.trim(), tel: novoTel, marca: novoMarca,
      modelo: novoModelo, tipoVeiculo: novoTipoV, origem: novoOrigem,
      criadoEm: hoje(), atendimentos: [],
      email: '', ig: '', ano: '', cor: '',
    }
    const lista = [novo, ...clientes]
    setClientes(lista)
    apiCall('salvarCliente', { cliente: novo })
    setClienteId(novo.id)
    showToast('✅ Cliente salvo!')
    setEtapa('agendar')
  }

  // ─── CONFIRMAR AGENDAMENTO ─────────────────────────────
  async function confirmarAgendamento() {
    if (!clienteId) { showToast('⚠️ Selecione um cliente'); return }
    if (!agData)   { showToast('⚠️ Selecione a data'); return }
    if (!agHora)   { showToast('⚠️ Selecione o horário'); return }

    setSalvando(true)

    const svcNome = (() => {
      const custom = servicosCustom.find(s => s.id === agSvcId)
      if (custom) return custom.nome
      return SERVICOS.find(s => s.id === agSvcId)?.nome || svcs[0] || agSvcId
    })()

    const ag: Agendamento = {
      id: gerarId(),
      clienteId,
      data: agData,
      hora: agHora,
      duracao: TEMPO_SERVICO[agSvcId] || 60,
      servico: svcs.length > 1 ? svcs.join(' + ') : svcNome,
      svcId: agSvcId,
      obs: agObs,
      status: 'agendado',
      valorAcordado: total,
      criadoEm: hoje(),
    }

    // Salva localmente ANTES da chamada de API
    setAgendamentos([...agendamentos, ag])
    setEtapa('acao')
    setSalvando(false)

    // API em background
    const r = await apiCall('salvarAgendamento', { agendamento: ag })
    showToast(r.ok ? '📅 Agendamento salvo!' : '📅 Salvo local — sincronize quando online')

    // WhatsApp
    const c = clientes.find(x => x.id === clienteId)
    if (c?.tel) {
      const dtObj = new Date(agData + 'T12:00:00')
      const nomeDia = DIAS_FULL[dtObj.getDay()]
      const fim = (() => {
        const [h, m] = agHora.split(':').map(Number)
        const total = h * 60 + m + (TEMPO_SERVICO[agSvcId] || 60)
        return `${String(Math.floor(total/60)).padStart(2,'0')}:${String(total%60).padStart(2,'0')}`
      })()
      const msg = `Olá ${primeiroNome(c.nome)}! 🚗✨\nSeu agendamento está confirmado!\n📅 ${nomeDia}, ${formatarDataBR(agData)}\n⏰ ${agHora} até ${fim}\n🔧 ${ag.servico}\n📍 BOX 0.0 — Estética Automotiva\nQualquer dúvida é só chamar! 👋`
      const tel = (c.tel || '').replace(/\D/g, '')
      // Modal WhatsApp abre depois
      setTimeout(() => {
        if (confirm(`Enviar confirmação WhatsApp para ${primeiroNome(c.nome)}?`)) {
          window.open(`https://wa.me/55${tel}?text=${encodeURIComponent(msg)}`, '_blank')
        }
        onFinalizado()
      }, 100)
    } else {
      onFinalizado()
    }
  }

  const S = {
    input: { width: '100%', background: 'var(--bg)', border: '1px solid var(--borda)', borderRadius: '12px', padding: '12px 14px', color: 'var(--texto)', outline: 'none', fontSize: '15px' } as React.CSSProperties,
    label: { fontSize: '11px', fontWeight: 600, color: 'var(--dim)', letterSpacing: '1px', textTransform: 'uppercase' as const, display: 'block', marginBottom: '6px', marginTop: '12px' },
  }

  // ─── TELA 1: AÇÃO ─────────────────────────────────────
  if (etapa === 'acao') return (
    <div style={{ position:'fixed', inset:0, zIndex:10010, background:'rgba(0,0,0,.7)', display:'flex', alignItems:'flex-end', justifyContent:'center' }}
      onClick={e => e.target === e.currentTarget && onCancelar()}>
      <div style={{ width:'100%', maxWidth:'500px', background:'var(--surface2)', borderRadius:'20px 20px 0 0', padding:'8px 20px 40px' }}>
        <div style={{ width:36, height:4, background:'var(--borda)', borderRadius:2, margin:'10px auto 20px' }} />

        {/* Resumo */}
        <div style={{ background:'var(--verde-bg)', border:'1px solid var(--verde)', borderRadius:14, padding:14, marginBottom:20 }}>
          <div style={{ fontSize:12, color:'var(--verde-dim)', marginBottom:4 }}>{svcs.length} serviço{svcs.length>1?'s':''} · {TIPOS_V_L[veiculo]}</div>
          <div style={{ fontSize:28, fontWeight:800, color:'var(--verde)', lineHeight:1 }}>R${total}</div>
          {delivery > 0 && <div style={{ fontSize:12, color:'var(--dim)', marginTop:4 }}>Inclui delivery R${delivery}</div>}
          {desconto > 0 && <div style={{ fontSize:12, color:'var(--erro)', marginTop:2 }}>Desconto -R${desconto}</div>}
          <div style={{ fontSize:12, color:'var(--dim)', marginTop:6 }}>{svcs.slice(0,3).join(' · ')}{svcs.length>3?` +${svcs.length-3}`:''}
          </div>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
          <button onClick={onPDF} style={{
            padding:16, borderRadius:14, border:'1px solid var(--borda)',
            background:'var(--surface)', color:'var(--texto)',
            fontSize:14, fontWeight:600, cursor:'pointer', display:'flex',
            flexDirection:'column', alignItems:'center', gap:6,
          }}>
            <span style={{ fontSize:24 }}>📄</span>
            Gerar PDF
          </button>
          <button onClick={() => setEtapa('cliente')} style={{
            padding:16, borderRadius:14, border:'none',
            background:'var(--verde)', color:'#000',
            fontSize:14, fontWeight:700, cursor:'pointer', display:'flex',
            flexDirection:'column', alignItems:'center', gap:6,
          }}>
            <span style={{ fontSize:24 }}>📅</span>
            Agendar
          </button>
        </div>
        <button onClick={onCancelar} style={{ width:'100%', marginTop:10, padding:12, background:'transparent', border:'none', color:'var(--dim)', fontSize:13, cursor:'pointer' }}>
          Voltar ao orçamento
        </button>
      </div>
    </div>
  )

  // ─── TELA 2: SELECIONAR CLIENTE ───────────────────────
  if (etapa === 'cliente') return (
    <div style={{ position:'fixed', inset:0, zIndex:10010, background:'var(--bg)', overflowY:'auto' }}>
      <div style={{ maxWidth:'500px', margin:'0 auto', padding:'20px 16px 40px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
          <button onClick={() => setEtapa('acao')} style={{ background:'var(--surface)', border:'1px solid var(--borda)', color:'var(--texto)', padding:'8px 14px', borderRadius:10, cursor:'pointer', fontSize:13 }}>‹ Voltar</button>
          <div style={{ fontSize:16, fontWeight:700 }}>Selecionar Cliente</div>
          <button onClick={() => { setBusca(''); setEtapa('novo_cliente') }} style={{
            background:'var(--verde)', color:'#000', border:'none',
            padding:'8px 14px', borderRadius:20, cursor:'pointer', fontSize:13, fontWeight:700,
          }}>+ Novo</button>
        </div>

        <div style={{ background:'var(--surface)', border:'1px solid var(--borda)', borderRadius:12, padding:'11px 14px', display:'flex', gap:10, alignItems:'center', marginBottom:12 }}>
          <span style={{ color:'var(--dim)' }}>🔍</span>
          <input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar por nome ou telefone..."
            style={{ background:'none', border:'none', color:'var(--texto)', fontSize:15, width:'100%', outline:'none' }} />
        </div>

        {clientesFil.length === 0 ? (
          <div style={{ textAlign:'center', padding:'40px 0', color:'var(--dim)' }}>
            <div style={{ fontSize:40, marginBottom:12 }}>👥</div>
            <div>Nenhum cliente encontrado</div>
            <button onClick={() => setEtapa('novo_cliente')} style={{ marginTop:12, padding:'10px 20px', borderRadius:20, background:'var(--verde)', color:'#000', border:'none', fontWeight:700, cursor:'pointer', fontSize:13 }}>
              + Criar novo cliente
            </button>
          </div>
        ) : clientesFil.map(c => {
          const veiculo = [c.marca, c.modelo].filter(Boolean).join(' ')
          return (
            <button key={c.id} onClick={() => { setClienteId(c.id); setEtapa('agendar') }}
              style={{ width:'100%', textAlign:'left', background:'var(--surface)', border:`1.5px solid ${clienteId===c.id?'var(--verde)':'var(--borda)'}`, borderRadius:14, padding:14, marginBottom:8, cursor:'pointer' }}>
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ width:40, height:40, borderRadius:12, background:'var(--verde-bg)', border:'1.5px solid var(--verde)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, fontWeight:700, color:'var(--verde)', flexShrink:0 }}>
                  {c.nome[0].toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize:15, fontWeight:600, color:'var(--texto)' }}>{c.nome}</div>
                  <div style={{ fontSize:12, color:'var(--dim)', marginTop:2 }}>
                    {c.tel}{veiculo ? ` · ${veiculo}` : ''}
                  </div>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )

  // ─── TELA 3: NOVO CLIENTE ─────────────────────────────
  if (etapa === 'novo_cliente') return (
    <div style={{ position:'fixed', inset:0, zIndex:10011, background:'var(--bg)', overflowY:'auto' }}>
      <div style={{ maxWidth:'500px', margin:'0 auto', padding:'20px 16px 40px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
          <button onClick={() => setEtapa('cliente')} style={{ background:'var(--surface)', border:'1px solid var(--borda)', color:'var(--texto)', padding:'8px 14px', borderRadius:10, cursor:'pointer', fontSize:13 }}>‹ Voltar</button>
          <div style={{ fontSize:16, fontWeight:700 }}>Novo Cliente</div>
          <div style={{ width:70 }} />
        </div>

        <label style={S.label}>Nome *</label>
        <input value={novoNome} onChange={e => setNovoNome(e.target.value)} placeholder="Nome completo" style={S.input} />

        <label style={S.label}>Telefone / WhatsApp</label>
        <input type="tel" value={novoTel} onChange={e => setNovoTel(e.target.value)} placeholder="(11) 99999-9999" style={S.input} />

        <label style={S.label}>Marca do veículo</label>
        <input value={novoMarca} onChange={e => setNovoMarca(e.target.value)} placeholder="Ex: Hyundai" style={S.input} />

        <label style={S.label}>Modelo</label>
        <input value={novoModelo} onChange={e => setNovoModelo(e.target.value)} placeholder="Ex: HB20" style={S.input} />

        <label style={S.label}>Tipo de veículo</label>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:6, marginBottom:0 }}>
          {TIPOS_V.map(t => (
            <button key={t} onClick={() => setNovoTipoV(t)} style={{
              padding:'10px 4px', borderRadius:10, fontSize:12, fontWeight:600,
              border:`1px solid ${novoTipoV===t?'var(--verde)':'var(--borda)'}`,
              background: novoTipoV===t ? 'var(--verde-bg)' : 'var(--surface)',
              color: novoTipoV===t ? 'var(--verde)' : 'var(--dim)', cursor:'pointer',
            }}>{TIPOS_V_L[t]}</button>
          ))}
        </div>

        <label style={S.label}>Como chegou</label>
        <select value={novoOrigem} onChange={e => setNovoOrigem(e.target.value)}
          style={{ ...S.input, appearance:'auto' } as any}>
          <option value="">Selecione...</option>
          {Object.entries(ORIGENS).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
        </select>

        <button onClick={salvarNovoCliente} style={{
          width:'100%', marginTop:24, padding:15, borderRadius:14,
          background:'var(--verde)', color:'#000', border:'none',
          fontSize:15, fontWeight:700, cursor:'pointer',
        }}>
          SALVAR E AGENDAR →
        </button>
      </div>
    </div>
  )

  // ─── TELA 4: AGENDAR ──────────────────────────────────
  if (etapa === 'agendar') return (
    <div style={{ position:'fixed', inset:0, zIndex:10010, background:'var(--bg)', overflowY:'auto' }}>
      <div style={{ maxWidth:'500px', margin:'0 auto', padding:'20px 16px 40px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
          <button onClick={() => setEtapa('cliente')} style={{ background:'var(--surface)', border:'1px solid var(--borda)', color:'var(--texto)', padding:'8px 14px', borderRadius:10, cursor:'pointer', fontSize:13 }}>‹ Voltar</button>
          <div style={{ fontSize:16, fontWeight:700 }}>Agendar</div>
          <div style={{ width:70 }} />
        </div>

        {/* Cliente selecionado */}
        {clienteSel && (
          <div style={{ background:'var(--verde-bg)', border:'1px solid var(--verde)', borderRadius:14, padding:12, marginBottom:16, display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:36, height:36, borderRadius:10, background:'var(--verde-bg)', border:'1.5px solid var(--verde)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:15, fontWeight:700, color:'var(--verde)' }}>
              {clienteSel.nome[0].toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize:14, fontWeight:600, color:'var(--texto)' }}>{clienteSel.nome}</div>
              <div style={{ fontSize:12, color:'var(--dim)' }}>{clienteSel.marca} {clienteSel.modelo}</div>
            </div>
          </div>
        )}

        {/* Serviço */}
        <label style={S.label}>Serviço principal</label>
        <select value={agSvcId} onChange={e => setAgSvcId(e.target.value)}
          style={{ ...S.input, appearance:'auto' } as any}>
          {SERVICOS.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
          {servicosCustom.map(s => <option key={s.id} value={s.id}>{s.nome} ✨</option>)}
        </select>

        {/* Total */}
        <div style={{ background:'var(--surface)', border:'1px solid var(--borda)', borderRadius:12, padding:'10px 14px', marginTop:12, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <span style={{ fontSize:13, color:'var(--dim)' }}>Valor acordado</span>
          <span style={{ fontSize:20, fontWeight:700, color:'var(--verde)' }}>R${total}</span>
        </div>

        {/* Data */}
        <label style={S.label}>Data</label>
        <input type="date" value={agData} onChange={e => setAgData(e.target.value)} style={S.input} />

        {/* Horário */}
        <label style={S.label}>Horário</label>
        <input type="time" value={agHora} onChange={e => setAgHora(e.target.value)} step={1800} style={S.input} />

        {/* Slots disponíveis */}
        {agData && (
          <div style={{ marginTop:10 }}>
            <div style={{ fontSize:11, color:'var(--dim)', fontWeight:600, letterSpacing:'1px', textTransform:'uppercase', marginBottom:8 }}>Slots disponíveis</div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:4 }}>
              {Array.from({length:20},(_,i) => {
                const min = i * 30
                const h = 8 + Math.floor(min/60)
                const m = min % 60
                const slot = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`
                const ocupado = agendamentos.some(a =>
                  (String(a.data||'').trim() === agData || String(a.data||'').trim() === formatarDataBR(agData)) &&
                  a.hora === slot && a.status !== 'cancelado'
                )
                return (
                  <button key={slot} onClick={() => !ocupado && setAgHora(slot)}
                    style={{
                      padding:'6px 2px', borderRadius:8, fontSize:11, fontWeight:600,
                      border:`1px solid ${agHora===slot ? 'var(--verde)' : ocupado ? 'transparent' : 'rgba(170,255,0,.3)'}`,
                      background: agHora===slot ? 'var(--verde)' : ocupado ? 'var(--surface)' : 'var(--verde-bg)',
                      color: agHora===slot ? '#000' : ocupado ? 'var(--dim)' : 'var(--verde)',
                      cursor: ocupado ? 'not-allowed' : 'pointer',
                      opacity: ocupado ? 0.4 : 1,
                    }}>
                    {slot}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Obs */}
        <label style={S.label}>Observações (opcional)</label>
        <input value={agObs} onChange={e => setAgObs(e.target.value)} placeholder="Ex: Cliente vem buscar às 15h" style={S.input} />

        <button onClick={confirmarAgendamento} disabled={salvando} style={{
          width:'100%', marginTop:20, padding:15, borderRadius:14,
          background: salvando ? 'var(--dim)' : 'var(--verde)',
          color:'#000', border:'none', fontSize:15, fontWeight:700, cursor: salvando ? 'not-allowed' : 'pointer',
        }}>
          {salvando ? 'Salvando...' : '✅ CONFIRMAR AGENDAMENTO'}
        </button>
      </div>
    </div>
  )

  return null
}
