import { useCallback } from 'react'
import { apiCall } from '@/lib/api'
import { useStore } from '@/store'
import { SERVICOS } from '@/lib/servicos'
import { formatarDataBR, getISOWeek, parseValor } from '@/lib/utils'
import type { Cliente, Agendamento } from '@/types'

export function useSync() {
  const { setLoadingStep, setLoading, setApiOnline, setClientes, setAgendamentos, setSaidas, setPrecos, setFinCache, showToast, precos } = useStore()

  const sincronizarTudo = useCallback(async (bgMode = false) => {
    if (!bgMode) setLoadingStep('Carregando configurações...', 25)

    // 1. Config/preços
    const rConfig = await apiCall('getConfig')
    if (rConfig.ok && rConfig.data) {
      const d = rConfig.data as Record<string, string>
      const novosPrecos = { ...precos }
      SERVICOS.forEach(s => {
        ['hatch','sedan','suv'].forEach(v => {
          const key = `preco_${s.id}_${v}`
          if (d[key]) novosPrecos[s.id] = { ...novosPrecos[s.id], [v]: parseInt(d[key]) || novosPrecos[s.id][v as keyof typeof novosPrecos[typeof s.id]] }
        })
      })
      setPrecos(novosPrecos)
    }

    if (!bgMode) setLoadingStep('Carregando clientes...', 50)

    // 2. Clientes + atendimentos
    const rClientes = await apiCall<Cliente[]>('getClientes')
    if (rClientes.ok && rClientes.data) {
      const clientesComAt = await Promise.all(
        rClientes.data.map(async (c) => {
          const rAt = await apiCall('getAtendimentos', { clienteId: c.id })
          return {
            ...c,
            atendimentos: rAt.ok && Array.isArray((rAt as any).data)
              ? (rAt as any).data.map((a: any) => ({ ...a, valor: parseValor(a.valor) }))
              : []
          }
        })
      )
      setClientes(clientesComAt)
    }

    if (!bgMode) setLoadingStep('Sincronizando agenda...', 75)

    // 3. Agendamentos
    const rAgs = await apiCall<Agendamento[]>('getAgendamentos')
    if (rAgs.ok && rAgs.data) {
      setAgendamentos(rAgs.data)
    }

    // 4. Financeiro cache
    const rAtAll = await apiCall('getAtendimentos', {})
    if (rAtAll.ok && Array.isArray((rAtAll as any).data)) {
      const normalized = (rAtAll as any).data.map((a: any) => {
        const dt = (() => {
          const s = String(a.data || '').trim()
          const d = new Date(s)
          return isNaN(d.getTime()) ? null : d
        })()
        return {
          ...a,
          data:         dt ? formatarDataBR(dt.toISOString().slice(0,10)) : formatarDataBR(a.data),
          semana:       dt ? getISOWeek(dt) : String(a.semana||'').trim(),
          mes:          dt ? `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}` : String(a.mes||'').trim(),
          ano:          dt ? String(dt.getFullYear()) : String(a.ano||'').trim(),
          valor:        parseValor(a.valor),
          valorLiquido: parseValor(a.valorLiquido),
          valorCobrado: parseValor(a.valorCobrado),
          custoTaxa:    parseValor(a.custoTaxa),
        }
      })
      setFinCache(normalized)
    }

    // 5. Saídas
    const rSaidas = await apiCall('getSaidas')
    if (rSaidas.ok && Array.isArray((rSaidas as any).data)) {
      setSaidas((rSaidas as any).data.map((s: any) => ({ ...s, valor: parseValor(s.valor) })))
    }

    if (!bgMode) {
      setLoadingStep('Tudo pronto! ✅', 100)
      await new Promise(r => setTimeout(r, 400))
      setLoading(false, '', 0)
      showToast('✅ Tudo sincronizado!')
    } else {
      showToast('✅ Atualizado!')
    }
  }, [precos])

  const checkAPI = useCallback(async () => {
    const { clientes } = useStore.getState()
    const temCache = clientes.length > 0

    if (temCache) {
      setLoadingStep('Carregando dados locais...', 80)
      await new Promise(r => setTimeout(r, 300))
      setLoading(false, '', 0)
      setTimeout(async () => {
        const r = await apiCall('ping')
        setApiOnline(r.ok === true)
        if (r.ok) sincronizarTudo(true)
      }, 500)
    } else {
      setLoadingStep('Conectando à nuvem...', 10)
      const r = await apiCall('ping')
      setApiOnline(r.ok === true)
      if (r.ok) {
        await sincronizarTudo(false)
      } else {
        setLoadingStep('Modo offline', 100)
        await new Promise(r => setTimeout(r, 400))
        setLoading(false, '', 0)
        showToast('⚠️ Sem conexão — modo offline')
      }
    }
  }, [sincronizarTudo])

  return { checkAPI, sincronizarTudo }
}
