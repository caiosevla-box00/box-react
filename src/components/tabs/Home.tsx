import { useMemo } from 'react'
import { useStore } from '@/store'
import { parseValor, formatarDataBR, getMesAtual, diasDesde, dataISO } from '@/lib/utils'
import type { TabId } from '@/types'

function saudacao(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Bom dia'
  if (h < 18) return 'Boa tarde'
  return 'Boa noite'
}

function StatCard({ icon, val, label, sub, cor }: { icon: string; val: string | number; label: string; sub?: string; cor?: string }) {
  return (
    <div style={{ background: 'var(--surface)', border: '0.5px solid var(--borda)', borderRadius: '14px', padding: '14px 12px' }}>
      <div style={{ fontSize: '20px', marginBottom: '6px' }}>{icon}</div>
      <div style={{ fontSize: '20px', fontWeight: 700, color: cor || 'var(--texto)', lineHeight: 1 }}>{val}</div>
      <div style={{ fontSize: '11px', color: 'var(--dim)', marginTop: '4px', fontWeight: 500 }}>{label}</div>
      {sub && <div style={{ fontSize: '10px', color: 'var(--dim)', marginTop: '2px', opacity: .8 }}>{sub}</div>}
    </div>
  )
}

export function Home() {
  const { agendamentos, clientes, finCache, meta, setTab } = useStore()

  const hoje = dataISO(new Date())
  const mesAtual = getMesAtual()

  const agHoje = useMemo(() =>
    agendamentos
      .filter(a => {
        const d = String(a.data || '').trim()
        // Normaliza para yyyy-mm-dd para comparar com hoje
        let norm = d
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(d)) {
          const [dd, mm, yy] = d.split('/')
          norm = `${yy}-${mm}-${dd}`
        }
        return norm === hoje && a.status !== 'cancelado'
      })
      .sort((a, b) => a.hora.localeCompare(b.hora)),
    [agendamentos, hoje]
  )

  const faturamentoMes = useMemo(() =>
    finCache
      .filter(a => String(a.mes || '').trim() === mesAtual)
      .reduce((acc, a) => acc + (parseValor(a.valorLiquido) || parseValor(a.valor)), 0),
    [finCache, mesAtual]
  )

  const ultimoPagamento = useMemo(() => {
    if (!finCache.length) return null
    return finCache[finCache.length - 1]
  }, [finCache])

  const clientesSemRetorno = useMemo(() =>
    clientes.filter(c => {
      const ult = c.atendimentos?.slice(-1)[0]
      const d = diasDesde(formatarDataBR(ult?.data || ''))
      return d !== null && d >= 30
    }).length,
    [clientes]
  )

  const metaPct = meta > 0 ? Math.min(100, Math.round((faturamentoMes / meta) * 100)) : 0

  const STATUS_COLOR: Record<string, string> = {
    agendado: 'var(--verde)',
    concluido: 'var(--alerta)',
    pago: 'var(--azul)',
  }
  const STATUS_LABEL: Record<string, string> = {
    agendado: 'Agendado',
    concluido: 'Aguardando cobrança',
    pago: 'Pago',
  }

  return (
    <div style={{ paddingTop: '4px' }}>
      {/* Saudação */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '13px', color: 'var(--dim)', fontWeight: 500 }}>{saudacao()},</div>
        <div style={{ fontSize: '26px', fontWeight: 700, color: 'var(--texto)', lineHeight: 1.2, marginTop: '2px' }}>
          Caio <span style={{ fontSize: '22px' }}>👋</span>
        </div>
      </div>

      {/* Cards resumo */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '20px' }}>
        <StatCard
          icon="💰"
          val={`R$${faturamentoMes.toFixed(0)}`}
          label="Junho · meta"
          sub={meta > 0 ? `${metaPct}% de R$${meta}` : 'Meta não definida'}
          cor="var(--verde)"
        />
        <StatCard
          icon="📅"
          val={agHoje.length}
          label={agHoje.length === 1 ? 'Agendamento hoje' : 'Agendamentos hoje'}
          cor={agHoje.length > 0 ? 'var(--verde)' : 'var(--dim)'}
        />
        <StatCard
          icon="💳"
          val={ultimoPagamento ? `R$${parseValor(ultimoPagamento.valorLiquido || ultimoPagamento.valor).toFixed(0)}` : '—'}
          label="Último recebido"
          sub={ultimoPagamento ? formatarDataBR(ultimoPagamento.data) : undefined}
          cor="var(--verde)"
        />
        <StatCard
          icon="🔔"
          val={clientesSemRetorno}
          label="Sem retorno 30d+"
          cor={clientesSemRetorno > 0 ? 'var(--alerta)' : 'var(--verde)'}
        />
      </div>

      {/* Meta barra */}
      {meta > 0 && (
        <div style={{ background: 'var(--surface)', border: '0.5px solid var(--borda)', borderRadius: '14px', padding: '14px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--texto)' }}>Meta do mês</div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: metaPct >= 100 ? 'var(--verde)' : metaPct >= 60 ? 'var(--alerta)' : 'var(--erro)' }}>
              {metaPct}%
            </div>
          </div>
          <div style={{ height: '6px', background: 'var(--borda)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: '4px', transition: 'width .6s ease',
              width: `${metaPct}%`,
              background: metaPct >= 100 ? 'var(--verde)' : metaPct >= 60 ? 'var(--alerta)' : 'var(--erro)'
            }} />
          </div>
          <div style={{ fontSize: '11px', color: 'var(--dim)', marginTop: '6px' }}>
            {metaPct < 100
              ? `Faltam R$${(meta - faturamentoMes).toFixed(0)} para atingir a meta`
              : '🎉 Meta atingida!'}
          </div>
        </div>
      )}

      {/* Agenda de hoje */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--dim)', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Hoje
          </div>
          <button onClick={() => setTab('agenda')} style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            fontSize: '12px', color: 'var(--verde)', fontWeight: 600, padding: '4px 0'
          }}>
            Ver tudo →
          </button>
        </div>

        {agHoje.length === 0 ? (
          <div style={{ background: 'var(--surface)', border: '1px dashed var(--borda)', borderRadius: '14px', padding: '24px', textAlign: 'center' }}>
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>📅</div>
            <div style={{ fontSize: '13px', color: 'var(--dim)' }}>Nenhum agendamento hoje</div>
            <button onClick={() => setTab('agenda')} style={{
              marginTop: '10px', background: 'var(--verde-bg)', border: '1px solid var(--verde)',
              borderRadius: '10px', padding: '8px 16px', fontSize: '12px', fontWeight: 600,
              color: 'var(--verde)', cursor: 'pointer'
            }}>
              + Agendar
            </button>
          </div>
        ) : agHoje.map(ag => {
          const c = clientes.find(x => x.id === ag.clienteId)
          const status = ag.status || 'agendado'
          const cor = STATUS_COLOR[status] || 'var(--verde)'
          const isCobrar = status === 'concluido'

          return (
            <div key={ag.id}
              onClick={() => setTab('agenda')}
              style={{
                background: 'var(--surface)', borderRadius: '14px', padding: '14px',
                marginBottom: '8px', cursor: 'pointer',
                borderLeft: `3px solid ${cor}`,
                border: `0.5px solid var(--borda)`,
                borderLeftWidth: '3px', borderLeftColor: cor,
              }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--texto)' }}>
                    {c?.nome || 'Cliente'}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--dim)', marginTop: '3px' }}>
                    {ag.hora} · {ag.servico}
                  </div>
                  <div style={{ marginTop: '6px' }}>
                    <span style={{
                      fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: '20px',
                      background: `${cor}18`, color: cor, border: `1px solid ${cor}44`
                    }}>
                      {STATUS_LABEL[status] || status}
                    </span>
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '12px' }}>
                  {parseValor(ag.valorAcordado) > 0 && (
                    <div style={{ fontSize: '17px', fontWeight: 700, color: cor }}>
                      R${parseValor(ag.valorAcordado).toFixed(0)}
                    </div>
                  )}
                  {isCobrar && (
                    <div style={{
                      marginTop: '6px', background: 'var(--alerta)', color: '#000',
                      fontSize: '11px', fontWeight: 700, padding: '5px 10px',
                      borderRadius: '8px', letterSpacing: '0.5px'
                    }}>
                      COBRAR
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Ações rápidas */}
      <div style={{ marginBottom: '8px' }}>
        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--dim)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>
          Ações rápidas
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          {[
            { icon: '🧾', label: 'Novo Orçamento', tab: 'orcamento' as TabId, primary: true },
            { icon: '📅', label: 'Abrir Agenda', tab: 'agenda' as TabId, primary: false },
            { icon: '👥', label: 'Clientes', tab: 'clientes' as TabId, primary: false },
            { icon: '💰', label: 'Financeiro', tab: 'financeiro' as TabId, primary: false },
          ].map(a => (
            <button key={a.tab} onClick={() => setTab(a.tab)} style={{
              padding: '14px 12px', borderRadius: '14px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '10px',
              background: a.primary ? 'var(--verde)' : 'var(--surface)',
              border: a.primary ? 'none' : '0.5px solid var(--borda)',
              color: a.primary ? '#000' : 'var(--texto)',
              fontSize: '13px', fontWeight: 600, textAlign: 'left',
              transition: 'opacity .15s',
            }}>
              <span style={{ fontSize: '20px' }}>{a.icon}</span>
              {a.label}
            </button>
          ))}
        </div>
      </div>

      {/* Alerta clientes sem retorno */}
      {clientesSemRetorno > 0 && (
        <div onClick={() => setTab('clientes')}
          style={{
            marginTop: '12px', padding: '14px', borderRadius: '14px', cursor: 'pointer',
            background: 'rgba(240,165,0,.08)', border: '1px solid rgba(240,165,0,.3)'
          }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '20px' }}>🔔</span>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--alerta)' }}>
                {clientesSemRetorno} cliente{clientesSemRetorno !== 1 ? 's' : ''} sem retorno
              </div>
              <div style={{ fontSize: '12px', color: 'var(--dim)', marginTop: '2px' }}>
                Mais de 30 dias desde a última visita — toque para chamar de volta
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
