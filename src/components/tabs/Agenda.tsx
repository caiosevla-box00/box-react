import { useState } from 'react'
import { useStore } from '@/store'
import { apiCall } from '@/lib/api'
import { hoje, dataISO, formatarDataBR, dataStrParaDate, gerarId, getISOWeek, primeiroNome, parseValor } from '@/lib/utils'
import { SERVICOS, TEMPO_SERVICO, HORA_INICIO, HORA_FIM, SLOT_MIN } from '@/lib/servicos'
import type { Agendamento, FechamentoDados } from '@/types'
import { Checkout } from '@/components/modals/Checkout'

const NOMES_DIA = ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado']
const TOTAL_SLOTS = ((HORA_FIM - HORA_INICIO) * 60) / SLOT_MIN

function slotParaMinutos(slot: string) {
  const [h, m] = slot.split(':').map(Number)
  return (h - HORA_INICIO) * 60 + m
}
function minutosParaSlot(min: number) {
  const total = HORA_INICIO * 60 + min
  return `${String(Math.floor(total/60)).padStart(2,'0')}:${String(total%60).padStart(2,'0')}`
}
function gerarTodosSlots() {
  return Array.from({ length: TOTAL_SLOTS }, (_, i) => minutosParaSlot(i * SLOT_MIN))
}
function getDiasSemana(offset: number) {
  const now = new Date()
  const diaSemana = now.getDay() === 0 ? 6 : now.getDay() - 1
  const seg = new Date(now)
  seg.setDate(now.getDate() - diaSemana + offset * 7)
  seg.setHours(0,0,0,0)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(seg)
    d.setDate(seg.getDate() + i)
    return d
  })
}

export function Agenda() {
  const { agendamentos, setAgendamentos, clientes, setClientes, showToast, divisao } = useStore()
  const [offset, setOffset] = useState(0)
  const [modalAg, setModalAg] = useState(false)
  const [modalEnc, setModalEnc] = useState<string | null>(null)
  const [checkoutCob, setCheckoutCob] = useState<string | null>(null)
  const [agData, setAgData] = useState('')
  const [agHora, setAgHora] = useState('')
  const [agSvcId, setAgSvcId] = useState(SERVICOS[0].id)
  const [agObs, setAgObs] = useState('')
  const [agClienteId, setAgClienteId] = useState('')
  const [agValorAcordado, setAgValorAcordado] = useState(0)
  const [encObs, setEncObs] = useState('')

  const dias = getDiasSemana(offset)
  const primeiroDia = dias[0]
  const ultimoDia = dias[6]

  function getSlotsOcupados(iso: string) {
    const ocupados = new Set<string>()
    agendamentos
      .filter(a => String(a.data||'').trim() === iso || String(a.data||'').trim() === formatarDataBR(iso))
      .forEach(ag => {
        const ini = slotParaMinutos(ag.hora)
        for (let i = 0; i < Math.ceil(ag.duracao / SLOT_MIN); i++) {
          ocupados.add(minutosParaSlot(ini + i * SLOT_MIN))
        }
      })
    return ocupados
  }

  function abrirModalAgendamento(iso: string, slot?: string) {
    setAgData(iso)
    setAgHora(slot || '')
    setAgSvcId(SERVICOS[0].id)
    setAgObs('')
    setAgClienteId(clientes[0]?.id || '')
    setAgValorAcordado(0)
    setModalAg(true)
  }

  async function confirmarAgendamento() {
    if (!agClienteId || !agData || !agHora) {
      showToast('⚠️ Preencha todos os campos')
      return
    }
    const svc = SERVICOS.find(s => s.id === agSvcId)
    const ag: Agendamento = {
      id: gerarId(),
      clienteId: agClienteId,
      data: agData,
      hora: agHora,
      duracao: TEMPO_SERVICO[agSvcId] || 60,
      servico: svc?.nome || agSvcId,
      svcId: agSvcId,
      obs: agObs,
      status: 'agendado',
      valorAcordado: agValorAcordado,
      criadoEm: hoje()
    }
    setAgendamentos([...agendamentos, ag])
    setModalAg(false)
    const r = await apiCall('salvarAgendamento', { agendamento: ag })
    showToast(r.ok ? '📅 Agendado!' : '📅 Agendado local!')

    const c = clientes.find(x => x.id === agClienteId)
    if (c?.tel) {
      const dtObj = new Date(agData + 'T12:00:00')
      const nomeDia = NOMES_DIA[dtObj.getDay()]
      const fimHora = minutosParaSlot(slotParaMinutos(agHora) + ag.duracao)
      const msg = `Olá ${primeiroNome(c.nome)}! 🚗✨\nSeu agendamento está confirmado!\n📅 ${nomeDia}, ${formatarDataBR(agData)}\n⏰ ${agHora} até ${fimHora}\n🔧 ${svc?.nome}\n📍 BOX 0.0 — Estética Automotiva\nQualquer dúvida é só chamar! 👋`
      const tel = (c.tel || '').replace(/\D/g, '')
      setTimeout(() => {
        if (confirm(`Enviar confirmação via WhatsApp para ${primeiroNome(c.nome)}?`)) {
          window.open(`https://wa.me/55${tel}?text=${encodeURIComponent(msg)}`, '_blank')
        }
      }, 400)
    }
  }

  async function confirmarEncerramento() {
    if (!modalEnc) return
    const lista = [...agendamentos]
    const idx = lista.findIndex(a => a.id === modalEnc)
    if (idx < 0) return
    lista[idx] = { ...lista[idx], status: 'concluido', obsEncerramento: encObs }
    setAgendamentos(lista)
    await apiCall('atualizarAgendamento', { id: modalEnc, campos: { status: 'concluido', obsEncerramento: encObs } })

    const ag = lista[idx]
    const c = clientes.find(x => x.id === ag.clienteId)
    setModalEnc(null)
    setEncObs('')
    showToast('✅ Serviço encerrado! Use COBRAR quando o cliente chegar.')

    if (c?.tel) {
      const veiculo = [c.marca, c.modelo, c.cor].filter(Boolean).join(' ')
      const msg = `Olá ${primeiroNome(c.nome)}! 🏁\nSeu ${veiculo || 'carro'} está pronto!\n✅ ${ag.servico} concluído com sucesso\nPode vir buscar! 🚗✨\nBOX 0.0 — Estética Automotiva`
      const tel = (c.tel || '').replace(/\D/g, '')
      setTimeout(() => {
        if (confirm(`Avisar conclusão via WhatsApp para ${primeiroNome(c.nome)}?`)) {
          window.open(`https://wa.me/55${tel}?text=${encodeURIComponent(msg)}`, '_blank')
        }
      }, 500)
    }
  }

  async function cancelar(id: string) {
    if (!confirm('Cancelar este agendamento?')) return
    setAgendamentos(agendamentos.filter(a => a.id !== id))
    await apiCall('atualizarAgendamento', { id, campos: { status: 'cancelado' } })
    showToast('🗑 Agendamento cancelado')
  }

  function handleCheckoutConfirm(dados: FechamentoDados) {
    if (!checkoutCob) return
    const ag = agendamentos.find(a => a.id === checkoutCob)
    if (!ag) return

    const dtObj = dataStrParaDate(formatarDataBR(ag.data)) || new Date()
    const atendimento = {
      id: gerarId(),
      clienteId: ag.clienteId,
      data: formatarDataBR(ag.data),
      semana: getISOWeek(dtObj),
      mes: `${dtObj.getFullYear()}-${String(dtObj.getMonth()+1).padStart(2,'0')}`,
      ano: String(dtObj.getFullYear()),
      servicos: dados.svcs || ag.servico,
      valor: dados.valorOriginal,
      obs: ag.obsEncerramento || ag.obs || '',
      formaPagamento: dados.formaPagamento,
      parcelas: dados.parcelas,
      taxaPct: dados.taxaPct,
      valorCobrado: dados.valorCobrado,
      custoTaxa: dados.custoTaxa,
      valorLiquido: dados.liquido,
      divContas: dados.divisao.contas,
      divMaquinas: dados.divisao.maquinas,
      divEstoque: dados.divisao.estoque,
      divLucro: dados.divisao.lucro,
      criadoEm: hoje()
    }

    const lista = [...clientes]
    const idx = lista.findIndex(x => x.id === ag.clienteId)
    if (idx >= 0) {
      lista[idx] = { ...lista[idx], atendimentos: [...(lista[idx].atendimentos || []), atendimento] }
      setClientes(lista)
    }

    apiCall('salvarAtendimento', { atendimento }).then(r =>
      showToast(r.ok ? '✅ Pagamento registrado!' : '💾 Salvo local')
    )

    const ags = [...agendamentos]
    const agIdx = ags.findIndex(a => a.id === checkoutCob)
    if (agIdx >= 0) {
      ags[agIdx] = { ...ags[agIdx], status: 'pago' }
      setAgendamentos(ags)
      apiCall('atualizarAgendamento', { id: checkoutCob, campos: { status: 'pago' } })
    }
    setCheckoutCob(null)
  }

  const agCobranca = checkoutCob ? agendamentos.find(a => a.id === checkoutCob) : null

  return (
    <div>
      {/* Navegação semana */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => setOffset(o => o - 1)}
          className="w-10 h-10 flex items-center justify-center rounded-xl font-bebas text-2xl"
          style={{ background: '#111', border: '1px solid var(--borda)', color: 'var(--verde)' }}>‹</button>
        <div className="font-barlow font-bold text-sm tracking-widest text-center">
          {primeiroDia.getDate()}/{String(primeiroDia.getMonth()+1).padStart(2,'0')} — {ultimoDia.getDate()}/{String(ultimoDia.getMonth()+1).padStart(2,'0')}
        </div>
        <button onClick={() => setOffset(o => o + 1)}
          className="w-10 h-10 flex items-center justify-center rounded-xl font-bebas text-2xl"
          style={{ background: '#111', border: '1px solid var(--borda)', color: 'var(--verde)' }}>›</button>
      </div>

      {/* Dias */}
      {dias.map(dia => {
        const iso = dataISO(dia)
        const diaAgs = agendamentos
          .filter(a => String(a.data||'').trim() === iso || String(a.data||'').trim() === formatarDataBR(iso))
          .sort((a,b) => a.hora.localeCompare(b.hora))
        const ocupados = getSlotsOcupados(iso)
        const slots = gerarTodosSlots()
        const nomeDia = NOMES_DIA[dia.getDay()]
        const isHoje = dataISO(new Date()) === iso

        return (
          <div key={iso} className="rounded-xl mb-3 overflow-hidden"
            style={{ background: 'var(--card)', border: `1px solid ${isHoje ? 'var(--verde)' : 'var(--borda)'}` }}>
            <div className="flex justify-between items-center px-4 py-3"
              style={{ background: '#111', borderBottom: '1px solid var(--borda)' }}>
              <div>
                <span className="font-bebas text-lg tracking-wider"
                  style={{ color: isHoje ? 'var(--verde)' : 'var(--texto)' }}>
                  {nomeDia} <span style={{ color: 'var(--verde)' }}>{dia.getDate()}/{String(dia.getMonth()+1).padStart(2,'0')}</span>
                </span>
                {isHoje && (
                  <span className="ml-2 px-1.5 py-0.5 rounded font-barlow text-[10px] font-bold"
                    style={{ background: 'var(--verde)', color: '#000' }}>HOJE</span>
                )}
              </div>
              <div className="font-barlow text-xs" style={{ color: 'var(--dim)' }}>
                {diaAgs.length} agend.
              </div>
            </div>

            {diaAgs.map(ag => {
              const c = clientes.find(x => x.id === ag.clienteId)
              const fim = minutosParaSlot(slotParaMinutos(ag.hora) + ag.duracao)
              const status = ag.status || 'agendado'
              const corMap: Record<string, string> = { agendado: 'var(--verde)', concluido: '#f0a500', pago: '#74b9ff' }
              const bgMap: Record<string, string> = { agendado: 'rgba(170,255,0,.06)', concluido: 'rgba(240,165,0,.06)', pago: 'rgba(116,185,255,.06)' }
              const badgeMap: Record<string, string> = { agendado: '📅 AGENDADO', concluido: '⏳ AGUARDANDO COBRANÇA', pago: '✅ PAGO' }
              const cor = corMap[status] || 'var(--verde)'
              const bg = bgMap[status] || 'transparent'

              return (
                <div key={ag.id} className="px-4 py-3"
                  style={{ borderBottom: '1px solid #1a1a1a', background: bg }}>
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1">
                      <div className="font-barlow font-bold text-sm uppercase" style={{ color: cor }}>
                        {ag.hora} — {fim}
                      </div>
                      <div className="font-barlow text-sm mt-1">
                        {primeiroNome(c?.nome) || 'Cliente'} · {ag.servico}
                      </div>
                      {ag.obs && (
                        <div className="font-barlow text-xs mt-1" style={{ color: 'var(--dim)' }}>{ag.obs}</div>
                      )}
                      <div className="inline-block mt-2 px-2 py-0.5 rounded-full font-barlow text-[9px] font-bold tracking-wider"
                        style={{ border: `1px solid ${cor}`, color: cor }}>
                        {badgeMap[status] || status.toUpperCase()}
                      </div>
                    </div>
                    <div className="flex-shrink-0 text-right min-w-[80px]">
                      {parseValor(ag.valorAcordado) > 0 && (
                        <div className="font-bebas text-xl leading-none mb-1" style={{ color: cor }}>
                          R${parseValor(ag.valorAcordado).toFixed(0)}
                        </div>
                      )}
                      {status === 'agendado' && (
                        <button onClick={() => { setModalEnc(ag.id); setEncObs('') }}
                          className="w-full py-1.5 px-3 rounded-lg font-barlow font-extrabold text-xs tracking-wider uppercase mb-1"
                          style={{ background: 'var(--verde)', color: '#080808', border: 'none' }}>
                          ENCERRAR
                        </button>
                      )}
                      {status === 'concluido' && (
                        <button onClick={() => setCheckoutCob(ag.id)}
                          className="w-full py-1.5 px-3 rounded-lg font-barlow font-extrabold text-xs tracking-wider uppercase mb-1"
                          style={{ background: '#f0a500', color: '#000', border: 'none' }}>
                          💳 COBRAR
                        </button>
                      )}
                      {status !== 'pago' && (
                        <button onClick={() => cancelar(ag.id)}
                          className="w-full py-1 px-3 rounded-lg font-barlow text-xs"
                          style={{ background: 'transparent', border: '1px solid #333', color: 'var(--erro)' }}>
                          cancelar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}

            <div className="p-3">
              <div className="font-barlow text-[10px] tracking-[2px] uppercase mb-2" style={{ color: 'var(--dim)' }}>
                Disponibilidade
              </div>
              <div className="grid grid-cols-4 gap-1">
                {slots.map(slot => {
                  const livre = !ocupados.has(slot)
                  return (
                    <button key={slot}
                      onClick={() => livre && abrirModalAgendamento(iso, slot)}
                      className="py-1.5 rounded-lg font-barlow font-bold text-xs text-center"
                      style={{
                        background: livre ? '#1a2600' : '#1a1a1a',
                        border: `1px solid ${livre ? 'rgba(170,255,0,.3)' : '#222'}`,
                        color: livre ? '#AAFF00' : '#333',
                        cursor: livre ? 'pointer' : 'not-allowed'
                      }}>
                      {slot}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )
      })}

      {/* Modal Agendamento */}
      {modalAg && (
        <div className="fixed inset-0 z-[10000] overflow-y-auto" style={{ background: '#080808' }}>
          <div className="max-w-[500px] mx-auto p-4 pb-20">
            <div className="flex justify-between items-center mb-5">
              <div className="font-bebas text-2xl tracking-widest" style={{ color: 'var(--verde)' }}>
                NOVO AGENDAMENTO
              </div>
              <button onClick={() => setModalAg(false)}
                className="px-4 py-2 rounded-lg font-barlow text-sm font-bold"
                style={{ background: '#1c1c1c', border: '1px solid #333', color: '#ccc' }}>✕</button>
            </div>

            <div className="mb-3">
              <label className="font-barlow text-xs font-bold tracking-wider uppercase block mb-1" style={{ color: '#777' }}>
                Cliente
              </label>
              <select value={agClienteId} onChange={e => setAgClienteId(e.target.value)}
                className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                style={{ background: '#111', border: '1px solid var(--borda)', color: 'var(--texto)' }}>
                {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
            </div>

            <div className="mb-3">
              <label className="font-barlow text-xs font-bold tracking-wider uppercase block mb-1" style={{ color: '#777' }}>
                Serviço
              </label>
              <select value={agSvcId} onChange={e => setAgSvcId(e.target.value)}
                className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                style={{ background: '#111', border: '1px solid var(--borda)', color: 'var(--texto)' }}>
                {SERVICOS.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="font-barlow text-xs font-bold tracking-wider uppercase block mb-1" style={{ color: '#777' }}>
                  Data
                </label>
                <input type="date" value={agData} onChange={e => setAgData(e.target.value)}
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                  style={{ background: '#111', border: '1px solid var(--borda)', color: 'var(--texto)' }} />
              </div>
              <div>
                <label className="font-barlow text-xs font-bold tracking-wider uppercase block mb-1" style={{ color: '#777' }}>
                  Horário
                </label>
                <input type="time" value={agHora} onChange={e => setAgHora(e.target.value)}
                  step="1800"
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                  style={{ background: '#111', border: '1px solid var(--borda)', color: 'var(--texto)' }} />
              </div>
            </div>

            <div className="mb-3">
              <label className="font-barlow text-xs font-bold tracking-wider uppercase block mb-1" style={{ color: '#777' }}>
                Valor acordado (R$)
              </label>
              <input type="number" value={agValorAcordado || ''}
                onChange={e => setAgValorAcordado(Number(e.target.value))}
                placeholder="0"
                className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                style={{ background: '#111', border: '1px solid var(--borda)', color: 'var(--texto)' }} />
            </div>

            <div className="mb-5">
              <label className="font-barlow text-xs font-bold tracking-wider uppercase block mb-1" style={{ color: '#777' }}>
                Observações
              </label>
              <input type="text" value={agObs} onChange={e => setAgObs(e.target.value)}
                placeholder="Observações opcionais..."
                className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                style={{ background: '#111', border: '1px solid var(--borda)', color: 'var(--texto)' }} />
            </div>

            <button onClick={confirmarAgendamento}
              className="w-full py-4 rounded-xl font-barlow font-extrabold text-base tracking-widest uppercase"
              style={{ background: 'var(--verde)', color: '#080808', border: 'none' }}>
              CONFIRMAR AGENDAMENTO
            </button>
          </div>
        </div>
      )}

      {/* Modal Encerrar */}
      {modalEnc && (
        <div className="fixed inset-0 z-[10001] flex items-end justify-center"
          style={{ background: 'rgba(0,0,0,.8)' }}>
          <div className="w-full max-w-[500px] rounded-t-2xl p-6 pb-10" style={{ background: '#111' }}>
            <div className="font-bebas text-2xl tracking-widest mb-4" style={{ color: 'var(--verde)' }}>
              ENCERRAR SERVIÇO
            </div>
            <div className="mb-4">
              <label className="font-barlow text-xs font-bold tracking-wider uppercase block mb-1" style={{ color: '#777' }}>
                Observação (opcional)
              </label>
              <input type="text" value={encObs} onChange={e => setEncObs(e.target.value)}
                placeholder="Ex: Cliente muito satisfeito..."
                className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                style={{ background: '#000', border: '1px solid var(--borda)', color: 'var(--texto)' }} />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setModalEnc(null)}
                className="flex-1 py-3 rounded-xl font-barlow font-bold text-sm tracking-widest uppercase"
                style={{ border: '1px solid #333', color: '#777', background: 'transparent' }}>
                Cancelar
              </button>
              <button onClick={confirmarEncerramento}
                className="flex-1 py-3 rounded-xl font-barlow font-extrabold text-sm tracking-widest uppercase"
                style={{ background: 'var(--verde)', color: '#080808', border: 'none' }}>
                ENCERRAR
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Checkout Cobrança */}
      {checkoutCob && agCobranca && (
        <Checkout
          valorInicial={parseValor(agCobranca.valorAcordado)}
          svcsTexto={agCobranca.servico}
          onConfirmar={handleCheckoutConfirm}
          onCancelar={() => setCheckoutCob(null)}
        />
      )}
    </div>
  )
}
