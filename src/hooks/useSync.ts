import { useCallback } from 'react'
import { apiCall } from '@/lib/api'
import { useStore } from '@/store'
import { SERVICOS } from '@/lib/servicos'
import { formatarDataBR, getISOWeek, parseValor, dataStrParaDate } from '@/lib/utils'
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

    // 3. Agendamentos — normaliza data para yyyy-mm-dd sempre
    const rAgs = await apiCall<Agendamento[]>('getAgendamentos')
    if (rAgs.ok && rAgs.data) {
      const agsNorm = rAgs.data.map((a: any) => {
        const raw = String(a.data || '').trim()
        // Converte dd/mm/yyyy → yyyy-mm-dd
        let dataISO = raw
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(raw)) {
          const [d, m, y] = raw.split('/')
          dataISO = `${y}-${m}-${d}`
        } else if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
          dataISO = raw // já correto
        } else {
          // Tenta parse genérico
          const dt = new Date(raw)
          if (!isNaN(dt.getTime())) {
            dataISO = dt.toISOString().slice(0, 10)
          }
        }
        return {
          ...a,
          data: dataISO,
          valorAcordado: parseValor(a.valorAcordado),
        }
      })
      setAgendamentos(agsNorm)
    }

    // 4. Financeiro cache
    const rAtAll = await apiCall('getAtendimentos', {})
    if (rAtAll.ok && Array.isArray((rAtAll as any).data)) {
      const normalized = (rAtAll as any).data.map((a: any) => {
        // Tenta parsear a data em qualquer formato
        const rawData = String(a.data || '').trim()
        const dt = (() => {
          // Tenta via dataStrParaDate (suporta dd/mm/yyyy e yyyy-mm-dd)
          const d1 = dataStrParaDate(rawData)
          if (d1) return d1
          // Tenta via Date nativo (Sun Mar 22 2026... formato longo)
          const d2 = new Date(rawData)
          return isNaN(d2.getTime()) ? null : d2
        })()

        // Se não conseguiu parsear a data, tenta parsear mes/semana diretamente
        const mesRaw = String(a.mes || '').trim()
        const semanaRaw = String(a.semana || '').trim()

        // Normaliza mes: pode ser "Sun Mar 01 2026..." → "2026-03"
        const mesNorm = (() => {
          if (/^\d{4}-\d{2}$/.test(mesRaw)) return mesRaw // já correto
          if (dt) return `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}`
          const d = new Date(mesRaw)
          if (!isNaN(d.getTime())) return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`
          return ''
        })()

        // Normaliza semana: pode ser "2026-W10" já correto, ou recalcula
        const semanaNorm = (() => {
          if (/^\d{4}-W\d{2}$/.test(semanaRaw)) return semanaRaw // já correto
          if (dt) return getISOWeek(dt)
          return ''
        })()

        return {
          ...a,
          data:         dt ? formatarDataBR(dt.toISOString().slice(0,10)) : rawData,
          semana:       semanaNorm,
          mes:          mesNorm,
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
