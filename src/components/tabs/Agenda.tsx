import React, { useState } from 'react'
import { useStore } from '@/store'
import { apiCall } from '@/lib/api'
import { hoje, dataISO, formatarDataBR, dataStrParaDate, gerarId, getISOWeek, primeiroNome, parseValor } from '@/lib/utils'
import { SERVICOS, TEMPO_SERVICO, HORA_INICIO, HORA_FIM, SLOT_MIN } from '@/lib/servicos'
import type { Agendamento, FechamentoDados } from '@/types'

const TAXAS_CREDITO = [0,3.49,4.49,5.49,5.99,6.49,6.99,7.49,7.99,8.49,8.99,9.49,9.99]

function CobrancaModal({ ag, valor, onConfirmar, onCancelar }: {
  ag: Agendamento; valor: number;
  onConfirmar: (d: FechamentoDados) => void
  onCancelar: () => void
}) {
  const { divisao, taxaDebito } = useStore()
  const [forma, setForma] = useState<'pix'|'debito'|'credito'>('pix')
  const [parcelas, setParcelas] = useState(1)
  const [taxaM, setTaxaM] = useState<number|''>('')

  const taxa = taxaM !== '' ? Number(taxaM) : forma==='pix' ? 0 : forma==='debito' ? taxaDebito : (TAXAS_CREDITO[parcelas]||0)
  const valorCobrado = taxa > 0 ? Math.ceil(valor / (1 - taxa/100)) : valor
  const custoTaxa = valorCobrado - valor

  function confirmar() {
    onConfirmar({
      svcs: ag.servico, formaPagamento: forma, parcelas: forma==='credito'?parcelas:1,
      taxaPct: taxa, valorOriginal: valor, valorCobrado, custoTaxa, liquido: valor,
      divisao: {
        contas: parseFloat((valor*divisao.contas/100).toFixed(2)),
        maquinas: parseFloat((valor*divisao.maquinas/100).toFixed(2)),
        estoque: parseFloat((valor*divisao.estoque/100).toFixed(2)),
        lucro: parseFloat((valor*divisao.lucro/100).toFixed(2)),
      }
    })
  }

  const S = { background:'var(--surface2)', borderRadius:'20px 20px 0 0', padding:'20px 18px 40px', width:'100%', maxWidth:'500px' }
  const inp = { background:'var(--bg)', border:'1px solid var(--borda)', borderRadius:10, padding:'9px 12px', color:'var(--texto)', outline:'none', width:'100%', fontSize:'15px' } as React.CSSProperties

  return (
    <div style={{ position:'fixed', inset:0, zIndex:10002, background:'rgba(0,0,0,.8)', display:'flex', alignItems:'flex-end', justifyContent:'center' }}
      onClick={e => e.target===e.currentTarget && onCancelar()}>
      <div style={S}>
        <div style={{ fontSize:16, fontWeight:700, marginBottom:4 }}>Registrar Pagamento</div>
        <div style={{ fontSize:13, color:'var(--dim)', marginBottom:16 }}>{ag.servico}</div>

        {/* Valor */}
        <div style={{ background:'var(--verde-bg)', border:'1px solid var(--verde)', borderRadius:12, padding:12, marginBottom:16, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <span style={{ fontSize:13, color:'var(--dim)' }}>Valor acordado</span>
          <span style={{ fontSize:26, fontWeight:800, color:'var(--verde)' }}>R${valor.toFixed(0)}</span>
        </div>

        {/* Forma */}
        <div style={{ fontSize:11, color:'var(--dim)', fontWeight:600, letterSpacing:1, textTransform:'uppercase', marginBottom:8 }}>Forma de pagamento</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:6, marginBottom:14 }}>
          {(['pix','debito','credito'] as const).map(f => (
            <button key={f} onClick={() => { setForma(f); setParcelas(1); setTaxaM('') }} style={{
              padding:'10px 4px', borderRadius:10, fontSize:12, fontWeight:600, border:'none', cursor:'pointer',
              background: forma===f ? 'var(--verde)' : 'var(--surface)',
              color: forma===f ? '#000' : 'var(--dim)',
              outline: forma===f ? 'none' : '1px solid var(--borda)',
            }}>
              {f==='pix'?'⚡ PIX':f==='debito'?'💳 Débito':'💳 Crédito'}
              <div style={{ fontSize:9, marginTop:2, opacity:.8 }}>
                {f==='pix'?'sem taxa':f==='debito'?`${taxaDebito}%`:`${TAXAS_CREDITO[1]}%+`}
              </div>
            </button>
          ))}
        </div>

        {forma==='credito' && (
          <div style={{ marginBottom:14 }}>
            <div style={{ fontSize:11, color:'var(--dim)', fontWeight:600, letterSpacing:1, textTransform:'uppercase', marginBottom:6 }}>Parcelas</div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(6,1fr)', gap:4 }}>
              {[1,2,3,4,5,6,7,8,9,10,11,12].map(p => (
                <button key={p} onClick={() => setParcelas(p)} style={{ padding:'6px 2px', borderRadius:8, fontSize:11, fontWeight:600, border:'none', cursor:'pointer', background:parcelas===p?'var(--verde)':'var(--surface)', color:parcelas===p?'#000':'var(--dim)', outline:parcelas===p?'none':'1px solid var(--borda)' }}>
                  {p}x
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Resumo */}
        {taxa > 0 && (
          <div style={{ background:'var(--bg)', borderRadius:10, padding:10, marginBottom:14, fontSize:12 }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
              <span style={{ color:'var(--dim)' }}>Taxa ({taxa.toFixed(2)}%)</span>
              <span style={{ color:'var(--erro)' }}>+R${custoTaxa.toFixed(2)}</span>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between' }}>
              <span style={{ color:'var(--dim)', fontWeight:600 }}>Cobrar do cliente</span>
              <span style={{ color:'var(--alerta)', fontWeight:700, fontSize:15 }}>R${valorCobrado.toFixed(2)}</span>
            </div>
          </div>
        )}

        <div style={{ display:'flex', gap:10 }}>
          <button onClick={onCancelar} style={{ flex:1, padding:13, borderRadius:12, border:'1px solid var(--borda)', background:'transparent', color:'var(--dim)', cursor:'pointer', fontWeight:600 }}>Cancelar</button>
          <button onClick={confirmar} style={{ flex:2, padding:13, borderRadius:12, background:'var(--verde)', color:'#000', border:'none', cursor:'pointer', fontWeight:700, fontSize:14 }}>
            ✅ CONFIRMAR PAGAMENTO
          </button>
        </div>
      </div>
    </div>
  )
}

const DIAS_SEMANA = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb']
const DIAS_FULL   = ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado']
const TOTAL_SLOTS = ((HORA_FIM - HORA_INICIO) * 60) / SLOT_MIN

function slotMin(slot: string) { const [h,m]=slot.split(':').map(Number); return (h-HORA_INICIO)*60+m }
function minSlot(min: number) { const t=HORA_INICIO*60+min; return `${String(Math.floor(t/60)).padStart(2,'0')}:${String(t%60).padStart(2,'0')}` }
function allSlots() { return Array.from({length:TOTAL_SLOTS},(_,i)=>minSlot(i*SLOT_MIN)) }
function getWeekDays(offset: number) {
  const now=new Date(); const ds=now.getDay()===0?6:now.getDay()-1
  const seg=new Date(now); seg.setDate(now.getDate()-ds+offset*7); seg.setHours(0,0,0,0)
  return Array.from({length:7},(_,i)=>{ const d=new Date(seg); d.setDate(seg.getDate()+i); return d })
}

export function Agenda() {
  const { agendamentos, setAgendamentos, clientes, setClientes, showToast } = useStore()
  const [offset, setOffset] = useState(0)
  const [selDay, setSelDay] = useState(dataISO(new Date()))
  const [modalAg, setModalAg] = useState(false)
  const [modalEnc, setModalEnc] = useState<string|null>(null)
  const [checkoutId, setCheckoutId] = useState<string|null>(null)
  const [agData, setAgData] = useState('')
  const [agHora, setAgHora] = useState('')
  const [agSvcId, setAgSvcId] = useState(SERVICOS[0].id)
  const [agClienteId, setAgClienteId] = useState('')
  const [agValor, setAgValor] = useState(0)
  const [agObs, setAgObs] = useState('')
  const [encObs, setEncObs] = useState('')
  const [wppPendente, setWppPendente] = useState<{tel:string;msg:string;nome:string}|null>(null)

  const days = getWeekDays(offset)

  // Compara data do agendamento com uma data no formato yyyy-mm-dd
  // Aceita qualquer formato no agendamento
  function mesmoDia(agData: string | undefined, iso: string): boolean {
    const d = String(agData || '').trim()
    if (!d) return false
    // Normaliza para yyyy-mm-dd
    let norm = d
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(d)) {
      const [dd, mm, yy] = d.split('/')
      norm = `${yy}-${mm}-${dd}`
    }
    return norm === iso
  }

  function getOcupados(iso: string) {
    const s = new Set<string>()
    agendamentos
      .filter(a => mesmoDia(a.data, iso))
      .forEach(ag => {
        const ini = slotMin(ag.hora)
        for (let i = 0; i < Math.ceil(ag.duracao / SLOT_MIN); i++) s.add(minSlot(ini + i * SLOT_MIN))
      })
    return s
  }

  const selAgs = agendamentos
    .filter(a => mesmoDia(a.data, selDay) && a.status !== 'cancelado')
    .sort((a, b) => a.hora.localeCompare(b.hora))
  const ocupados = getOcupados(selDay)

  async function confirmarAg() {
    if (!agClienteId||!agData||!agHora) { showToast('⚠️ Preencha todos os campos'); return }
    const svc=SERVICOS.find(s=>s.id===agSvcId)
    const ag: Agendamento = { id:gerarId(), clienteId:agClienteId, data:agData, hora:agHora, duracao:TEMPO_SERVICO[agSvcId]||60, servico:svc?.nome||agSvcId, svcId:agSvcId, obs:agObs, status:'agendado', valorAcordado:agValor, criadoEm:hoje() }
    setAgendamentos([...agendamentos, ag])
    setModalAg(false)
    const r=await apiCall('salvarAgendamento',{agendamento:ag})
    showToast(r.ok?'📅 Agendado!':'📅 Agendado local!')
    const c=clientes.find(x=>x.id===agClienteId)
    if (c?.tel) {
      const dtObj=new Date(agData+'T12:00:00'); const nomeDia=DIAS_FULL[dtObj.getDay()]
      const fim=minSlot(slotMin(agHora)+ag.duracao)
      const msg=`Olá ${primeiroNome(c.nome)}! 🚗✨\nSeu agendamento está confirmado!\n📅 ${nomeDia}, ${formatarDataBR(agData)}\n⏰ ${agHora} até ${fim}\n🔧 ${svc?.nome}\n📍 BOX 0.0 — Estética Automotiva\nQualquer dúvida é só chamar! 👋`
      const tel=(c.tel||'').replace(/\D/g,'')
      setWppPendente({ tel, msg, nome: primeiroNome(c.nome) })
    }
  }

  async function confirmarEnc() {
    if (!modalEnc) return
    const lista=[...agendamentos]; const idx=lista.findIndex(a=>a.id===modalEnc)
    if (idx<0) return
    lista[idx]={...lista[idx],status:'concluido',obsEncerramento:encObs}
    setAgendamentos(lista)
    await apiCall('atualizarAgendamento',{id:modalEnc,campos:{status:'concluido',obsEncerramento:encObs}})
    const ag=lista[idx]; const c=clientes.find(x=>x.id===ag.clienteId)
    setModalEnc(null); setEncObs('')
    showToast('✅ Encerrado! Use COBRAR quando o cliente chegar.')
    if (c?.tel) {
      const veiculo=[c.marca,c.modelo,c.cor].filter(Boolean).join(' ')
      const msg=`Olá ${primeiroNome(c.nome)}! 🏁\nSeu ${veiculo||'carro'} está pronto!\n✅ ${ag.servico} concluído\nPode vir buscar! 🚗✨\nBOX 0.0 — Estética Automotiva`
      const tel=(c.tel||'').replace(/\D/g,'')
      setWppPendente({ tel, msg, nome: primeiroNome(c.nome) })
    }
  }

  async function cancelar(id: string) {
    if (!confirm('Cancelar agendamento?')) return
    setAgendamentos(agendamentos.filter(a=>a.id!==id))
    await apiCall('atualizarAgendamento',{id,campos:{status:'cancelado'}})
    showToast('🗑 Cancelado')
  }

  function handleCobrar(dados: FechamentoDados) {
    if (!checkoutId) return
    const ag=agendamentos.find(a=>a.id===checkoutId); if (!ag) return
    const dtObj=dataStrParaDate(formatarDataBR(ag.data))||new Date()
    const at={ id:gerarId(), clienteId:ag.clienteId, data:formatarDataBR(ag.data), semana:getISOWeek(dtObj), mes:`${dtObj.getFullYear()}-${String(dtObj.getMonth()+1).padStart(2,'0')}`, ano:String(dtObj.getFullYear()), servicos:dados.svcs||ag.servico, valor:dados.valorOriginal, obs:ag.obsEncerramento||ag.obs||'', formaPagamento:dados.formaPagamento, parcelas:dados.parcelas, taxaPct:dados.taxaPct, valorCobrado:dados.valorCobrado, custoTaxa:dados.custoTaxa, valorLiquido:dados.liquido, divContas:dados.divisao.contas, divMaquinas:dados.divisao.maquinas, divEstoque:dados.divisao.estoque, divLucro:dados.divisao.lucro, criadoEm:hoje() }
    const lista=[...clientes]; const idx=lista.findIndex(x=>x.id===ag.clienteId)
    if (idx>=0) { lista[idx]={...lista[idx],atendimentos:[...(lista[idx].atendimentos||[]),at]}; setClientes(lista) }
    apiCall('salvarAtendimento',{atendimento:at}).then(r=>showToast(r.ok?'✅ Pagamento registrado!':'💾 Salvo local'))
    const ags=[...agendamentos]; const ai=ags.findIndex(a=>a.id===checkoutId)
    if (ai>=0) { ags[ai]={...ags[ai],status:'pago'}; setAgendamentos(ags); apiCall('atualizarAgendamento',{id:checkoutId,campos:{status:'pago'}}) }
    setCheckoutId(null)
  }

  const COR:Record<string,string>={agendado:'var(--verde)',concluido:'var(--alerta)',pago:'var(--azul)'}
  const BADGE:Record<string,string>={agendado:'📅 Agendado',concluido:'⏳ Aguardando cobrança',pago:'✅ Pago'}
  const selDayObj = days.find(d => dataISO(d) === selDay) || days[0]

  return (
    <div>
      {/* Week nav */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
        <button onClick={()=>setOffset(o=>o-1)} style={{ background:'var(--surface)', border:'none', color:'#fff', fontSize:16, width:34, height:34, borderRadius:10, cursor:'pointer' }}>‹</button>
        <span style={{ fontSize:13, fontWeight:600, color:'var(--dim)' }}>{days[0].getDate()}/{String(days[0].getMonth()+1).padStart(2,'0')} — {days[6].getDate()}/{String(days[6].getMonth()+1).padStart(2,'0')}</span>
        <button onClick={()=>setOffset(o=>o+1)} style={{ background:'var(--surface)', border:'none', color:'#fff', fontSize:16, width:34, height:34, borderRadius:10, cursor:'pointer' }}>›</button>
      </div>

      {/* Day strip */}
      <div style={{ display:'flex', gap:4, marginBottom:16, overflowX:'auto' }}>
        {days.map(d => {
          const iso=dataISO(d); const isToday=dataISO(new Date())===iso; const isSel=selDay===iso
          const hasAg = agendamentos.some(a => mesmoDia(a.data, iso) && a.status !== 'cancelado')
          return (
            <div key={iso} onClick={()=>setSelDay(iso)} style={{
              flexShrink:0, width:44, padding:'8px 2px', borderRadius:12, textAlign:'center', cursor:'pointer',
              background: isSel ? 'var(--verde)' : isToday ? 'var(--verde-bg)' : 'var(--surface)',
              border: isToday&&!isSel ? '1px solid var(--verde)' : '1px solid transparent',
              transition:'all .15s'
            }}>
              <div style={{ fontSize:9, fontWeight:600, textTransform:'uppercase', color: isSel?'#000':isToday?'var(--verde)':'var(--dim)' }}>{DIAS_SEMANA[d.getDay()]}</div>
              <div style={{ fontSize:16, fontWeight:700, color: isSel?'#000':'#fff', marginTop:2 }}>{d.getDate()}</div>
              {hasAg && <div style={{ width:4, height:4, borderRadius:'50%', background:isSel?'#000':'var(--verde)', margin:'3px auto 0' }}/>}
            </div>
          )
        })}
      </div>

      {/* Day label + add button */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
        <div style={{ fontSize:13, color:'var(--dim)', fontWeight:600 }}>
          {DIAS_FULL[selDayObj.getDay()]}, {selDayObj.getDate()} de {selDayObj.toLocaleString('pt-BR',{month:'long'})}
        </div>
        <button onClick={()=>{ setAgData(selDay); setAgHora(''); setAgClienteId(clientes[0]?.id||''); setAgSvcId(SERVICOS[0].id); setAgObs(''); setAgValor(0); setModalAg(true) }}
          style={{ background:'var(--verde)', color:'#000', fontSize:12, fontWeight:700, padding:'7px 14px', borderRadius:20, border:'none', cursor:'pointer', letterSpacing:0.5 }}>
          + Agendar
        </button>
      </div>

      {/* Agendamentos do dia */}
      {selAgs.length === 0 ? (
        <div style={{ textAlign:'center', padding:'32px 0', color:'var(--dim)', fontSize:13 }}>Nenhum agendamento neste dia</div>
      ) : selAgs.map(ag => {
        const c=clientes.find(x=>x.id===ag.clienteId)
        const status=ag.status||'agendado'
        const cor=COR[status]||'var(--verde)'
        const fim=minSlot(slotMin(ag.hora)+ag.duracao)
        return (
          <div key={ag.id} style={{ background:'var(--surface)', borderRadius:14, padding:14, marginBottom:8, borderLeft:`3px solid ${cor}` }}>
            <div style={{ fontSize:12, color:cor, fontWeight:600 }}>{ag.hora} — {fim}</div>
            <div style={{ fontSize:15, fontWeight:600, marginTop:3 }}>{primeiroNome(c?.nome)||'Cliente'}</div>
            <div style={{ fontSize:13, color:'var(--dim)', marginTop:2 }}>{ag.servico}</div>
            {ag.obs && <div style={{ fontSize:12, color:'var(--dim)', marginTop:3 }}>{ag.obs}</div>}
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:10 }}>
              <span style={{ fontSize:11, fontWeight:600, padding:'4px 10px', borderRadius:20, background:`${cor}18`, color:cor }}>{BADGE[status]||status}</span>
              <div style={{ display:'flex', gap:6, alignItems:'center' }}>
                {parseValor(ag.valorAcordado)>0 && <span style={{ fontSize:15, fontWeight:700, color:cor }}>R${parseValor(ag.valorAcordado).toFixed(0)}</span>}
                {status==='agendado' && <button onClick={()=>{ setModalEnc(ag.id); setEncObs('') }} style={{ background:'var(--verde)', color:'#000', fontSize:11, fontWeight:700, padding:'7px 12px', borderRadius:8, border:'none', cursor:'pointer', letterSpacing:0.5 }}>ENCERRAR</button>}
                {status==='concluido' && <button onClick={()=>setCheckoutId(ag.id)} style={{ background:'var(--alerta)', color:'#000', fontSize:11, fontWeight:700, padding:'7px 12px', borderRadius:8, border:'none', cursor:'pointer' }}>💳 COBRAR</button>}
                {status!=='pago' && <button onClick={()=>cancelar(ag.id)} style={{ background:'transparent', border:'1px solid #333', color:'var(--erro)', fontSize:11, padding:'6px 10px', borderRadius:8, cursor:'pointer' }}>✕</button>}
              </div>
            </div>
          </div>
        )
      })}

      {/* Slots disponíveis */}
      <div style={{ marginTop:16 }}>
        <div style={{ fontSize:11, color:'var(--dim)', fontWeight:600, letterSpacing:1, textTransform:'uppercase', marginBottom:8 }}>Disponibilidade</div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:4 }}>
          {allSlots().map(slot => {
            const livre=!ocupados.has(slot)
            return (
              <button key={slot} onClick={()=>{ if(!livre) return; setAgData(selDay); setAgHora(slot); setAgClienteId(clientes[0]?.id||''); setAgSvcId(SERVICOS[0].id); setAgObs(''); setAgValor(0); setModalAg(true) }}
                style={{ padding:'7px 2px', borderRadius:8, fontSize:11, fontWeight:600, textAlign:'center', background:livre?'var(--verde-bg)':'#111', border:`1px solid ${livre?'rgba(170,255,0,.3)':'#1a1a1a'}`, color:livre?'var(--verde)':'#2a2a2a', cursor:livre?'pointer':'not-allowed' }}>
                {slot}
              </button>
            )
          })}
        </div>
      </div>

      {/* Modal Agendar */}
      {modalAg && (
        <div style={{ position:'fixed', inset:0, zIndex:10000, background:'var(--bg)', overflowY:'auto' }}>
          <div style={{ maxWidth:500, margin:'0 auto', padding:'16px 16px 60px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
              <div style={{ fontSize:18, fontWeight:800 }}>NOVO AGENDAMENTO</div>
              <button onClick={()=>setModalAg(false)} style={{ background:'#1a1a1a', border:'none', color:'#ccc', padding:'8px 14px', borderRadius:10, cursor:'pointer' }}>✕</button>
            </div>
            {[
              { label:'Cliente', el: <select value={agClienteId} onChange={e=>setAgClienteId(e.target.value)} style={{ width:'100%', background:'var(--surface)', border:'1px solid var(--borda)', borderRadius:12, padding:'12px 14px', color:'#fff', fontSize:14, outline:'none' }}>{clientes.map(c=><option key={c.id} value={c.id}>{c.nome}</option>)}</select> },
              { label:'Serviço', el: <select value={agSvcId} onChange={e=>setAgSvcId(e.target.value)} style={{ width:'100%', background:'var(--surface)', border:'1px solid var(--borda)', borderRadius:12, padding:'12px 14px', color:'#fff', fontSize:14, outline:'none' }}>{SERVICOS.map(s=><option key={s.id} value={s.id}>{s.nome}</option>)}</select> },
            ].map(f=>(
              <div key={f.label} style={{ marginBottom:12 }}>
                <div style={{ fontSize:11, color:'var(--dim)', fontWeight:600, letterSpacing:1, textTransform:'uppercase', marginBottom:6 }}>{f.label}</div>
                {f.el}
              </div>
            ))}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:12 }}>
              <div>
                <div style={{ fontSize:11, color:'var(--dim)', fontWeight:600, letterSpacing:1, textTransform:'uppercase', marginBottom:6 }}>Data</div>
                <input type="date" value={agData} onChange={e=>setAgData(e.target.value)} style={{ width:'100%', background:'var(--surface)', border:'1px solid var(--borda)', borderRadius:12, padding:'12px 14px', color:'#fff', fontSize:14, outline:'none' }}/>
              </div>
              <div>
                <div style={{ fontSize:11, color:'var(--dim)', fontWeight:600, letterSpacing:1, textTransform:'uppercase', marginBottom:6 }}>Horário</div>
                <input type="time" value={agHora} onChange={e=>setAgHora(e.target.value)} step="1800" style={{ width:'100%', background:'var(--surface)', border:'1px solid var(--borda)', borderRadius:12, padding:'12px 14px', color:'#fff', fontSize:14, outline:'none' }}/>
              </div>
            </div>
            <div style={{ marginBottom:12 }}>
              <div style={{ fontSize:11, color:'var(--dim)', fontWeight:600, letterSpacing:1, textTransform:'uppercase', marginBottom:6 }}>Valor acordado (R$)</div>
              <input type="number" value={agValor||''} onChange={e=>setAgValor(Number(e.target.value))} placeholder="0" style={{ width:'100%', background:'var(--surface)', border:'1px solid var(--borda)', borderRadius:12, padding:'12px 14px', color:'#fff', fontSize:14, outline:'none' }}/>
            </div>
            <div style={{ marginBottom:20 }}>
              <div style={{ fontSize:11, color:'var(--dim)', fontWeight:600, letterSpacing:1, textTransform:'uppercase', marginBottom:6 }}>Observações</div>
              <input type="text" value={agObs} onChange={e=>setAgObs(e.target.value)} placeholder="Opcional..." style={{ width:'100%', background:'var(--surface)', border:'1px solid var(--borda)', borderRadius:12, padding:'12px 14px', color:'#fff', fontSize:14, outline:'none' }}/>
            </div>
            <button onClick={confirmarAg} style={{ width:'100%', background:'var(--verde)', color:'#000', fontSize:15, fontWeight:700, padding:15, borderRadius:14, border:'none', cursor:'pointer', letterSpacing:1 }}>CONFIRMAR</button>
          </div>
        </div>
      )}

      {/* Modal Encerrar */}
      {modalEnc && (
        <div style={{ position:'fixed', inset:0, zIndex:10001, background:'rgba(0,0,0,.8)', display:'flex', alignItems:'flex-end', justifyContent:'center' }}>
          <div style={{ width:'100%', maxWidth:500, background:'var(--surface2)', borderRadius:'20px 20px 0 0', padding:'24px 20px 40px' }}>
            <div style={{ fontSize:18, fontWeight:800, color:'var(--verde)', marginBottom:16 }}>ENCERRAR SERVIÇO</div>
            <div style={{ fontSize:11, color:'var(--dim)', fontWeight:600, letterSpacing:1, textTransform:'uppercase', marginBottom:6 }}>Observação (opcional)</div>
            <input type="text" value={encObs} onChange={e=>setEncObs(e.target.value)} placeholder="Ex: Cliente satisfeito..." style={{ width:'100%', background:'var(--bg)', border:'1px solid var(--borda)', borderRadius:12, padding:'12px 14px', color:'#fff', fontSize:14, outline:'none', marginBottom:16 }}/>
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={()=>setModalEnc(null)} style={{ flex:1, padding:13, borderRadius:12, border:'1px solid #333', background:'transparent', color:'#777', cursor:'pointer', fontWeight:600 }}>Cancelar</button>
              <button onClick={confirmarEnc} style={{ flex:2, padding:13, borderRadius:12, background:'var(--verde)', color:'#000', border:'none', cursor:'pointer', fontWeight:700, fontSize:14, letterSpacing:1 }}>ENCERRAR</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Cobrar — forma de pagamento */}
      {checkoutId && (() => {
        const ag = agendamentos.find(a => a.id === checkoutId)
        if (!ag) return null
        const valor = parseValor(ag.valorAcordado)
        return (
          <CobrancaModal
            ag={ag}
            valor={valor}
            onConfirmar={handleCobrar}
            onCancelar={() => setCheckoutId(null)}
          />
        )
      })()}

      {/* WhatsApp confirmation — direct click, sem setTimeout */}
      {wppPendente && (
        <div style={{ position:'fixed', inset:0, zIndex:10010, display:'flex', alignItems:'flex-end', justifyContent:'center', background:'rgba(0,0,0,.7)' }}
          onClick={e => e.target === e.currentTarget && setWppPendente(null)}>
          <div style={{ width:'100%', maxWidth:'500px', background:'var(--surface2)', borderRadius:'20px 20px 0 0', padding:'24px 20px 40px' }}>
            <div style={{ fontSize:'16px', fontWeight:700, color:'var(--texto)', marginBottom:'6px' }}>
              📲 Enviar WhatsApp
            </div>
            <div style={{ fontSize:'13px', color:'var(--dim)', marginBottom:'20px' }}>
              Confirmar para {wppPendente.nome}?
            </div>
            <div style={{ background:'var(--surface)', border:'1px solid var(--borda)', borderRadius:'12px', padding:'14px', marginBottom:'16px', fontSize:'13px', color:'var(--texto2)', lineHeight:1.6, whiteSpace:'pre-line' }}>
              {wppPendente.msg}
            </div>
            <div style={{ display:'flex', gap:'10px' }}>
              <button onClick={() => setWppPendente(null)}
                style={{ flex:1, padding:'13px', borderRadius:'12px', border:'1px solid var(--borda)', background:'transparent', color:'var(--dim)', fontSize:'14px', fontWeight:600, cursor:'pointer' }}>
                Agora não
              </button>
              <button onClick={() => {
                window.open(`https://wa.me/55${wppPendente.tel}?text=${encodeURIComponent(wppPendente.msg)}`, '_blank')
                setWppPendente(null)
              }}
                style={{ flex:2, padding:'13px', borderRadius:'12px', border:'none', background:'#25D366', color:'#fff', fontSize:'14px', fontWeight:700, cursor:'pointer' }}>
                📲 Enviar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
