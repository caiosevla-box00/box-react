// Formata data para dd/mm/yyyy independente do formato de entrada
export function formatarDataBR(str: string | undefined | null): string {
  if (!str) return ''
  const s = String(str).trim()
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(s)) return s
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    const [a, m, d] = s.split('-')
    return `${d}/${m}/${a}`
  }
  const dt = new Date(s)
  if (!isNaN(dt.getTime())) {
    return `${String(dt.getDate()).padStart(2,'0')}/${String(dt.getMonth()+1).padStart(2,'0')}/${dt.getFullYear()}`
  }
  return s
}

export function dataStrParaDate(str: string | undefined | null): Date | null {
  if (!str) return null
  const s = String(str).trim()
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(s)) {
    const [d, m, a] = s.split('/')
    const dt = new Date(Number(a), Number(m)-1, Number(d))
    return isNaN(dt.getTime()) ? null : dt
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    const dt = new Date(s + 'T12:00:00')
    return isNaN(dt.getTime()) ? null : dt
  }
  const dt = new Date(s)
  return isNaN(dt.getTime()) ? null : dt
}

export function hoje(): string {
  const d = new Date()
  return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`
}

export function dataISO(d: Date): string {
  return d.toISOString().slice(0, 10)
}

export function getISOWeek(d: Date): string {
  const dt = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
  dt.setUTCDate(dt.getUTCDate() + 4 - (dt.getUTCDay() || 7))
  const yearStart = new Date(Date.UTC(dt.getUTCFullYear(), 0, 1))
  const week = Math.ceil((((dt.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
  return `${dt.getUTCFullYear()}-W${String(week).padStart(2,'0')}`
}

export function getMesAtual(): string {
  const n = new Date()
  return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,'0')}`
}

export function getSemanaAtual(): string {
  return getISOWeek(new Date())
}

export function gerarId(): string {
  return Math.random().toString(36).slice(2, 10)
}

export function primeiroNome(nome: string | undefined): string {
  if (!nome) return ''
  return nome.trim().split(' ')[0]
}

export function numBR(val: number): string {
  return val.toFixed(2).replace('.', ',')
}

export function formatMoney(val: number): string {
  return `R$${val.toFixed(0)}`
}

export function parseValor(str: string | number | undefined): number {
  if (typeof str === 'number') return str
  if (!str) return 0
  return parseFloat(String(str).replace('R$','').replace(/\s/g,'').replace(',','.')) || 0
}

export function diasDesde(dataStr: string | undefined): number | null {
  if (!dataStr) return null
  const dt = dataStrParaDate(formatarDataBR(dataStr))
  if (!dt) return null
  return Math.floor((new Date().getTime() - dt.getTime()) / (1000*60*60*24))
}
