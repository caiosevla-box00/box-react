import { useState, useMemo, useRef, useEffect } from 'react'
import { useStore } from '@/store'
import { formatarDataBR, parseValor, diasDesde } from '@/lib/utils'
import type { TabId } from '@/types'

interface Resultado {
  tipo: 'cliente' | 'agendamento' | 'atendimento'
  id: string
  titulo: string
  sub: string
  meta?: string
  cor?: string
  clienteId?: string
}

export function BuscaGlobal() {
  const { clientes, agendamentos, finCache, setTab } = useStore()
  const [aberta, setAberta] = useState(false)
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (aberta) setTimeout(() => inputRef.current?.focus(), 100)
  }, [aberta])

  function fechar() { setAberta(false); setQuery('') }

  const resultados = useMemo((): Resultado[] => {
    if (query.trim().length < 2) return []
    const q = query.toLowerCase().trim()
    const res: Resultado[] = []

    // Clientes
    clientes.forEach(c => {
      if (
        c.nome?.toLowerCase().includes(q) ||
        (c.tel || '').includes(q) ||
        (c.marca || '').toLowerCase().includes(q) ||
        (c.modelo || '').toLowerCase().includes(q)
      ) {
        const ats = c.atendimentos || []
        const total = ats.reduce((a, at) => a + parseValor(at.valor), 0)
        const dias = diasDesde(formatarDataBR(ats.slice(-1)[0]?.data || ''))
        res.push({
          tipo: 'cliente', id: c.id,
          titulo: c.nome,
          sub: [c.tel, c.marca, c.modelo].filter(Boolean).join(' · '),
          meta: total > 0 ? `R$${total.toFixed(0)} · ${ats.length} atend.` : `${ats.length} atend.`,
          cor: dias !== null && dias >= 30 ? 'var(--alerta)' : 'var(--verde)',
        })
      }
    })

    // Agendamentos
    agendamentos
      .filter(a => a.status !== 'cancelado')
      .forEach(ag => {
        const c = clientes.find(x => x.id === ag.clienteId)
        const nomeCliente = c?.nome || ''
        if (
          nomeCliente.toLowerCase().includes(q) ||
          ag.servico?.toLowerCase().includes(q) ||
          (ag.obs || '').toLowerCase().includes(q)
        ) {
          const STATUS_COR: Record<string, string> = {
            agendado: 'var(--verde)', concluido: 'var(--alerta)', pago: 'var(--azul)'
          }
          const STATUS_L: Record<string, string> = {
            agendado: 'Agendado', concluido: 'Aguardando cobrança', pago: 'Pago'
          }
          res.push({
            tipo: 'agendamento', id: ag.id,
            titulo: nomeCliente || 'Cliente',
            sub: `${formatarDataBR(ag.data)} às ${ag.hora} · ${ag.servico}`,
            meta: STATUS_L[ag.status] || ag.status,
            cor: STATUS_COR[ag.status] || 'var(--verde)',
            clienteId: ag.clienteId,
          })
        }
      })

    // Atendimentos (financeiro)
    finCache.forEach((a, i) => {
      if (
        (a.nomeCliente || '').toLowerCase().includes(q) ||
        (a.servicos || '').toLowerCase().includes(q)
      ) {
        const liq = parseValor(a.valorLiquido) || parseValor(a.valor)
        res.push({
          tipo: 'atendimento', id: `fin-${i}`,
          titulo: a.nomeCliente || 'Cliente',
          sub: `${formatarDataBR(a.data)} · ${a.servicos}`,
          meta: `R$${liq.toFixed(0)} · ${(a.formaPagamento || '').toUpperCase()}`,
          cor: 'var(--azul)',
        })
      }
    })

    return res.slice(0, 12) // máx 12 resultados
  }, [query, clientes, agendamentos, finCache])

  const TIPO_ICON: Record<string, string> = {
    cliente: '👤', agendamento: '📅', atendimento: '💰'
  }
  const TIPO_LABEL: Record<string, string> = {
    cliente: 'Cliente', agendamento: 'Agendamento', atendimento: 'Atendimento'
  }

  function irPara(r: Resultado) {
    fechar()
    if (r.tipo === 'cliente') setTab('clientes' as TabId)
    else if (r.tipo === 'agendamento') setTab('agenda' as TabId)
    else if (r.tipo === 'atendimento') setTab('financeiro' as TabId)
  }

  return (
    <>
      {/* Botão lupa */}
      <button onClick={() => setAberta(true)} style={{
        background: 'var(--surface)', border: '0.5px solid var(--borda)',
        borderRadius: '20px', padding: '7px 10px', cursor: 'pointer',
        fontSize: '15px', lineHeight: 1, display: 'flex', alignItems: 'center',
      }}>
        🔍
      </button>

      {/* Overlay de busca */}
      {aberta && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 10020,
          background: 'rgba(0,0,0,.6)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center',
          paddingTop: '60px',
        }} onClick={e => e.target === e.currentTarget && fechar()}>
          <div style={{
            width: '100%', maxWidth: '500px',
            background: 'var(--surface2)',
            borderRadius: '16px',
            margin: '0 16px',
            overflow: 'hidden',
            boxShadow: '0 8px 40px rgba(0,0,0,.5)',
          }}>
            {/* Campo de busca */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '14px 16px', borderBottom: '1px solid var(--borda)',
            }}>
              <span style={{ fontSize: '16px', flexShrink: 0 }}>🔍</span>
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Buscar clientes, agendamentos, serviços..."
                style={{
                  flex: 1, background: 'none', border: 'none',
                  color: 'var(--texto)', fontSize: '16px', outline: 'none',
                }}
              />
              {query && (
                <button onClick={() => setQuery('')} style={{
                  background: 'none', border: 'none', color: 'var(--dim)',
                  cursor: 'pointer', fontSize: '16px', padding: '0 4px',
                }}>✕</button>
              )}
              <button onClick={fechar} style={{
                background: 'none', border: 'none', color: 'var(--dim)',
                cursor: 'pointer', fontSize: '13px', fontWeight: 600, padding: '0 4px',
              }}>Fechar</button>
            </div>

            {/* Resultados */}
            <div style={{ maxHeight: '65vh', overflowY: 'auto' }}>
              {query.length < 2 ? (
                <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--dim)', fontSize: '13px' }}>
                  Digite pelo menos 2 caracteres para buscar
                </div>
              ) : resultados.length === 0 ? (
                <div style={{ padding: '24px 16px', textAlign: 'center' }}>
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>🔍</div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--texto)', marginBottom: '4px' }}>
                    Nenhum resultado
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--dim)' }}>
                    Tente buscar por nome, telefone ou serviço
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ padding: '8px 16px 4px', fontSize: '11px', fontWeight: 600, color: 'var(--dim)', letterSpacing: '1px', textTransform: 'uppercase' }}>
                    {resultados.length} resultado{resultados.length !== 1 ? 's' : ''}
                  </div>
                  {resultados.map(r => (
                    <button key={r.id} onClick={() => irPara(r)} style={{
                      width: '100%', textAlign: 'left', padding: '12px 16px',
                      background: 'none', border: 'none', cursor: 'pointer',
                      borderBottom: '0.5px solid var(--borda)',
                      display: 'flex', alignItems: 'center', gap: '12px',
                    }}>
                      {/* Ícone */}
                      <div style={{
                        width: '38px', height: '38px', borderRadius: '10px', flexShrink: 0,
                        background: `${r.cor}18`, border: `1px solid ${r.cor}44`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '16px',
                      }}>
                        {TIPO_ICON[r.tipo]}
                      </div>
                      {/* Conteúdo */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--texto)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {r.titulo}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--dim)', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {r.sub}
                        </div>
                      </div>
                      {/* Meta */}
                      {r.meta && (
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <div style={{ fontSize: '11px', fontWeight: 600, color: r.cor, whiteSpace: 'nowrap' }}>
                            {r.meta}
                          </div>
                          <div style={{ fontSize: '10px', color: 'var(--dim)', marginTop: '2px' }}>
                            {TIPO_LABEL[r.tipo]}
                          </div>
                        </div>
                      )}
                    </button>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
