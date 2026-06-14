import { SERVICOS } from '@/lib/servicos'

export interface OrcamentoPDFDados {
  cliente?: { nome: string; veiculo?: string; tel?: string }
  svcIds: string[]
  total: number
  delivery?: number
  desconto?: number
  formaPagamento?: string
  parcelas?: number
  valorCobrado?: number
  taxaPct?: number
}

// Processo de trabalho — valor percebido
const PROCESSO = [
  { num: '01', titulo: 'Avaliação', desc: 'Inspecionamos cada detalhe do seu veículo antes de começar.' },
  { num: '02', titulo: 'Execução', desc: 'Produtos profissionais Vonixx e técnicas certificadas em cada etapa.' },
  { num: '03', titulo: 'Inspeção final', desc: 'Revisamos tudo antes de entregar — só liberamos quando está perfeito.' },
  { num: '04', titulo: 'Entrega', desc: 'Seu carro de volta impecável, com orientações para manter o resultado.' },
]

export async function gerarOrcamentoPDF(dados: OrcamentoPDFDados): Promise<void> {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })

  const W = 210
  const M = 18
  const C = W - M * 2 // content width
  let y = 0

  // ─── PALETTE ───────────────────────────────────────────
  const VERDE:  [number,number,number] = [90, 191, 0]
  const PRETO:  [number,number,number] = [12, 12, 12]
  const BRANCO: [number,number,number] = [255, 255, 255]
  const CINZA1: [number,number,number] = [245, 245, 245]
  const CINZA2: [number,number,number] = [160, 160, 160]
  const CINZA3: [number,number,number] = [80, 80, 80]

  // ─── HELPERS ───────────────────────────────────────────
  const text = (t: string, x: number, yy: number, opts?: any) => doc.text(t, x, yy, opts)
  const setFont = (f: 'normal'|'bold', size: number, color: [number,number,number] = PRETO) => {
    doc.setFont('helvetica', f)
    doc.setFontSize(size)
    doc.setTextColor(...color)
  }
  const hline = (yy: number, color: [number,number,number] = CINZA1, w = 0.3) => {
    doc.setDrawColor(...color)
    doc.setLineWidth(w)
    doc.line(M, yy, W - M, yy)
  }

  // ─── HEADER ────────────────────────────────────────────
  doc.setFillColor(...PRETO)
  doc.rect(0, 0, W, 48, 'F')

  // Verde accent bar
  doc.setFillColor(...VERDE)
  doc.rect(0, 44, W, 4, 'F')

  // Logo
  setFont('bold', 26, BRANCO)
  text('BOX', M, 22)
  setFont('bold', 26, VERDE)
  text(' 0.0', M + 20, 22)
  setFont('normal', 8, [160,160,160])
  text('ESTÉTICA AUTOMOTIVA  ·  PADRÃO DE QUALIDADE', M, 30)

  // Data + numero orçamento
  const dataHoje = new Date().toLocaleDateString('pt-BR')
  const numOrc = `ORC-${Date.now().toString().slice(-6)}`
  setFont('normal', 8, [160,160,160])
  text(dataHoje, W - M, 22, { align: 'right' })
  setFont('bold', 9, VERDE)
  text(numOrc, W - M, 30, { align: 'right' })

  y = 58

  // ─── SAUDAÇÃO ──────────────────────────────────────────
  const primeiroNome = dados.cliente?.nome?.split(' ')[0] || 'Cliente'
  setFont('bold', 16, PRETO)
  text(`Olá, ${primeiroNome}! 👋`, M, y)
  y += 7

  setFont('normal', 10, CINZA3)
  const saudacao = doc.splitTextToSize(
    `Preparei esse orçamento especialmente para o seu veículo${dados.cliente?.veiculo ? ` — ${dados.cliente.veiculo}` : ''}. ` +
    `Cada serviço é executado com produtos profissionais Vonixx e técnica dedicada. ` +
    `Fique à vontade para tirar qualquer dúvida antes de confirmar.`,
    C
  )
  doc.text(saudacao, M, y)
  y += saudacao.length * 5 + 6

  hline(y, CINZA1)
  y += 8

  // ─── SERVIÇOS ──────────────────────────────────────────
  setFont('bold', 11, PRETO)
  text('SERVIÇOS SELECIONADOS', M, y)
  doc.setFillColor(...VERDE)
  doc.rect(M, y + 2, 24, 1, 'F')
  y += 10

  const svcsData = dados.svcIds.map(id => SERVICOS.find(s => s.id === id)).filter(Boolean)

  svcsData.forEach((svc, i) => {
    if (!svc) return

    // Card background
    doc.setFillColor(...CINZA1)
    const descLines = doc.splitTextToSize(svc.desc.replace(/·/g, '•'), C - 30)
    const cardH = 10 + descLines.length * 4.5 + 4
    doc.roundedRect(M, y, C, cardH, 2, 2, 'F')

    // Verde left bar
    doc.setFillColor(...VERDE)
    doc.roundedRect(M, y, 3, cardH, 1, 1, 'F')

    // Nome
    setFont('bold', 11, PRETO)
    text(svc.nome, M + 8, y + 7)

    // Tempo
    setFont('normal', 8, CINZA2)
    text(`⏱ ${svc.tempo}`, M + 8, y + 12)

    // Preço
    setFont('bold', 13, VERDE)
    text(`R$${svc.base.hatch}`, W - M - 2, y + 8, { align: 'right' })

    // Descrição
    setFont('normal', 8, CINZA3)
    doc.text(descLines, M + 8, y + 17)

    y += cardH + 4

    // Page break
    if (y > 240 && i < svcsData.length - 1) {
      doc.addPage()
      y = 20
    }
  })

  y += 4

  // ─── PROCESSO ──────────────────────────────────────────
  if (y > 220) { doc.addPage(); y = 20 }

  hline(y, CINZA1)
  y += 8

  setFont('bold', 11, PRETO)
  text('COMO TRABALHAMOS', M, y)
  doc.setFillColor(...VERDE)
  doc.rect(M, y + 2, 22, 1, 'F')
  y += 10

  PROCESSO.forEach((p, i) => {
    // Número
    doc.setFillColor(...PRETO)
    doc.circle(M + 4, y + 1, 3.5, 'F')
    setFont('bold', 8, BRANCO)
    text(p.num, M + 4, y + 2.5, { align: 'center' })

    setFont('bold', 10, PRETO)
    text(p.titulo, M + 12, y + 2)
    setFont('normal', 8, CINZA3)
    const pLines = doc.splitTextToSize(p.desc, C - 16)
    doc.text(pLines, M + 12, y + 7)
    y += pLines.length * 4.5 + 8

    if (i < PROCESSO.length - 1) {
      // Connector line
      doc.setDrawColor(...CINZA1)
      doc.setLineWidth(0.5)
      doc.setLineDashPattern([1, 1], 0)
      doc.line(M + 4, y - 5, M + 4, y - 1)
      doc.setLineDashPattern([], 0)
    }
  })

  y += 4

  // ─── TOTAL ─────────────────────────────────────────────
  if (y > 230) { doc.addPage(); y = 20 }

  hline(y, CINZA1)
  y += 8

  // Extras
  if ((dados.delivery || 0) > 0) {
    setFont('normal', 9, CINZA3)
    text('Taxa de Delivery', M, y)
    text(`+R$${(dados.delivery||0).toFixed(2)}`, W - M, y, { align: 'right' })
    y += 6
  }
  if ((dados.desconto || 0) > 0) {
    setFont('normal', 9, CINZA3)
    text('Desconto aplicado', M, y)
    text(`-R$${(dados.desconto||0).toFixed(2)}`, W - M, y, { align: 'right' })
    y += 6
  }

  // Total box
  doc.setFillColor(...PRETO)
  doc.roundedRect(M, y, C, 22, 3, 3, 'F')

  setFont('normal', 9, [160,160,160])
  text('INVESTIMENTO TOTAL', M + 6, y + 7)

  const valorFinal = dados.valorCobrado || dados.total
  setFont('bold', 20, VERDE)
  text(`R$${valorFinal.toFixed(2)}`, W - M - 6, y + 14, { align: 'right' })

  if (dados.formaPagamento) {
    setFont('normal', 9, [160,160,160])
    const fp = dados.formaPagamento.toUpperCase() + (dados.parcelas && dados.parcelas > 1 ? ` em ${dados.parcelas}x` : '')
    text(fp, M + 6, y + 15)
  }

  y += 30

  // ─── CHAMADA PARA AÇÃO ─────────────────────────────────
  if (y > 240) { doc.addPage(); y = 20 }

  doc.setFillColor(240, 255, 225)
  doc.roundedRect(M, y, C, 28, 3, 3, 'F')
  doc.setDrawColor(...VERDE)
  doc.setLineWidth(0.5)
  doc.roundedRect(M, y, C, 28, 3, 3, 'S')

  setFont('bold', 12, PRETO)
  text('Pronto para agendar? 🚗', M + 6, y + 9)
  setFont('normal', 9, CINZA3)
  const ctaLines = doc.splitTextToSize(
    'Responda esse orçamento confirmando os serviços ou me chame no WhatsApp. ' +
    'Agenda disponível — garanta sua data!',
    C - 12
  )
  doc.text(ctaLines, M + 6, y + 15)

  y += 36

  // ─── ASSINATURA ────────────────────────────────────────
  if (y > 260) { doc.addPage(); y = 20 }

  hline(y, CINZA1)
  y += 8

  // Linha de assinatura
  doc.setDrawColor(...PRETO)
  doc.setLineWidth(0.4)
  doc.line(M, y + 8, M + 60, y + 8)

  setFont('bold', 10, PRETO)
  text('Caio Alves', M, y + 14)
  setFont('normal', 8, CINZA2)
  text('BOX 0.0 — Estética Automotiva', M, y + 19)
  text(dataHoje, M, y + 24)

  // Rodapé
  setFont('normal', 7, CINZA2)
  text('Este orçamento tem validade de 7 dias a partir da data de emissão.', W / 2, y + 32, { align: 'center' })

  // ─── SALVA ─────────────────────────────────────────────
  const nomeCliente = dados.cliente?.nome?.replace(/\s/g, '-').toLowerCase() || 'cliente'
  const dataArq = dataHoje.replace(/\//g, '-')
  doc.save(`orcamento-${nomeCliente}-${dataArq}.pdf`)
}
