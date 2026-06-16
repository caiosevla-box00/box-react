import { SERVICOS } from '@/lib/servicos'

export interface OrcamentoPDFDados {
  cliente?: { nome: string; veiculo?: string; tel?: string }
  svcIds: string[]
  servicosCustom?: { id: string; nome: string; tempo: string; desc: string; hatch: number; sedan: number; suv: number }[]
  veiculo?: 'hatch' | 'sedan' | 'suv'
  total: number
  delivery?: number
  desconto?: number
  formaPagamento?: string
  parcelas?: number
  valorCobrado?: number
  taxaPct?: number
}

const PROCESSO = [
  { num: '01', titulo: 'Avaliacao', desc: 'Inspecionamos cada detalhe do veiculo antes de comecar.' },
  { num: '02', titulo: 'Execucao', desc: 'Produtos profissionais e tecnicas certificadas em cada etapa.' },
  { num: '03', titulo: 'Inspecao final', desc: 'Revisamos tudo antes de entregar — so liberamos quando esta perfeito.' },
  { num: '04', titulo: 'Entrega', desc: 'Seu carro de volta impecavel, com orientacoes para manter o resultado.' },
]

export async function gerarOrcamentoPDF(dados: OrcamentoPDFDados): Promise<void> {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })

  const W = 210
  const M = 18
  const C = W - M * 2
  let y = 0

  const VERDE:  [number,number,number] = [90, 191, 0]
  const PRETO:  [number,number,number] = [12, 12, 12]
  const BRANCO: [number,number,number] = [255, 255, 255]
  const CINZA1: [number,number,number] = [245, 245, 245]
  const CINZA2: [number,number,number] = [160, 160, 160]
  const CINZA3: [number,number,number] = [80, 80, 80]

  const setFont = (f: 'normal'|'bold', size: number, color: [number,number,number] = PRETO) => {
    doc.setFont('helvetica', f); doc.setFontSize(size); doc.setTextColor(...color)
  }
  const text = (t: string, x: number, yy: number, opts?: any) => doc.text(t, x, yy, opts)
  const hline = (yy: number, color: [number,number,number] = CINZA1, w = 0.3) => {
    doc.setDrawColor(...color); doc.setLineWidth(w)
    doc.line(M, yy, W - M, yy)
  }

  // ─── HEADER ────────────────────────────────────────────
  doc.setFillColor(...PRETO)
  doc.rect(0, 0, W, 44, 'F')
  doc.setFillColor(...VERDE)
  doc.rect(0, 40, W, 4, 'F')

  setFont('bold', 26, BRANCO)
  text('BOX', M, 20)
  doc.setTextColor(...VERDE)
  text(' 0.0', M + 20, 20)
  setFont('normal', 8, [160,160,160])
  text('ESTETICA AUTOMOTIVA  -  PADRAO DE QUALIDADE', M, 29)

  const dataHoje = new Date().toLocaleDateString('pt-BR')
  const numOrc = `ORC-${Date.now().toString().slice(-6)}`
  setFont('normal', 8, [160,160,160])
  text(dataHoje, W - M, 20, { align: 'right' })
  setFont('bold', 9, VERDE)
  text(numOrc, W - M, 29, { align: 'right' })

  y = 58

  // ─── SAUDACAO ──────────────────────────────────────────
  const primeiroNome = dados.cliente?.nome?.split(' ')[0] || 'Cliente'
  setFont('bold', 16, PRETO)
  text(`Ola, ${primeiroNome}!`, M, y)
  y += 7

  setFont('normal', 10, CINZA3)
  const veiculoTexto = dados.cliente?.veiculo
    ? dados.cliente.veiculo.replace(/[🚗🚙🛻]/g, '').trim()
    : ''
  const saudacao = doc.splitTextToSize(
    `Preparei esse orcamento especialmente para o seu veiculo${veiculoTexto ? ` - ${veiculoTexto}` : ''}. ` +
    `Cada servico e executado com produtos profissionais e tecnica dedicada. ` +
    `Fique a vontade para tirar qualquer duvida antes de confirmar.`,
    C
  )
  doc.text(saudacao, M, y)
  y += saudacao.length * 5 + 8

  hline(y)
  y += 8

  // ─── SERVICOS ──────────────────────────────────────────
  setFont('bold', 11, PRETO)
  text('SERVICOS SELECIONADOS', M, y)
  doc.setFillColor(...VERDE)
  doc.rect(M, y + 2, 26, 1, 'F')
  y += 10

  // Combina serviços padrão + custom
  const veiculo = dados.veiculo || 'hatch'
  const svcsParaRenderizar = dados.svcIds.map(id => {
    // Verifica se é serviço custom primeiro
    const custom = dados.servicosCustom?.find(s => s.id === id)
    if (custom) {
      return {
        nome: custom.nome,
        tempo: custom.tempo,
        preco: custom[veiculo] || custom.hatch,
        desc: custom.desc,
      }
    }
    // Serviço padrão
    const svc = SERVICOS.find(s => s.id === id)
    if (!svc) return null
    return {
      nome: svc.nome,
      tempo: svc.tempo,
      preco: svc.base[veiculo],
      desc: svc.desc,
    }
  }).filter(Boolean) as { nome: string; tempo: string; preco: number; desc: string }[]

  svcsParaRenderizar.forEach((svc, i) => {
    const descLines = doc.splitTextToSize(svc.desc.replace(/[·•]/g, '-'), C - 30)
    const cardH = 10 + descLines.length * 4.5 + 4

    // Page break
    if (y + cardH > 270) { doc.addPage(); y = 20 }

    doc.setFillColor(...CINZA1)
    doc.roundedRect(M, y, C, cardH, 2, 2, 'F')
    doc.setFillColor(...VERDE)
    doc.roundedRect(M, y, 3, cardH, 1, 1, 'F')

    setFont('bold', 11, PRETO)
    text(svc.nome, M + 8, y + 7)
    setFont('normal', 8, CINZA2)
    text(`Duracao: ${svc.tempo}`, M + 8, y + 12)
    setFont('bold', 13, VERDE)
    text(`R$${svc.preco.toFixed(2)}`, W - M - 2, y + 8, { align: 'right' })
    setFont('normal', 8, CINZA3)
    doc.text(descLines, M + 8, y + 17)

    y += cardH + 4
  })

  y += 4

  // ─── PROCESSO ──────────────────────────────────────────
  if (y > 220) { doc.addPage(); y = 20 }
  hline(y)
  y += 8

  setFont('bold', 11, PRETO)
  text('COMO TRABALHAMOS', M, y)
  doc.setFillColor(...VERDE)
  doc.rect(M, y + 2, 22, 1, 'F')
  y += 10

  PROCESSO.forEach((p, i) => {
    if (y > 255) { doc.addPage(); y = 20 }
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
      doc.setDrawColor(...CINZA1); doc.setLineWidth(0.5)
      doc.setLineDashPattern([1,1], 0)
      doc.line(M + 4, y - 5, M + 4, y - 1)
      doc.setLineDashPattern([], 0)
    }
  })

  y += 4

  // ─── TOTAL ─────────────────────────────────────────────
  if (y > 230) { doc.addPage(); y = 20 }
  hline(y)
  y += 8

  if ((dados.delivery || 0) > 0) {
    setFont('normal', 9, CINZA3)
    text('Taxa de Delivery', M, y)
    text(`+R$${(dados.delivery||0).toFixed(2)}`, W - M, y, { align: 'right' })
    y += 6
  }
  if ((dados.desconto || 0) > 0) {
    setFont('normal', 9, CINZA3)
    text('Desconto', M, y)
    text(`-R$${(dados.desconto||0).toFixed(2)}`, W - M, y, { align: 'right' })
    y += 6
  }

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

  // ─── FORMAS DE PAGAMENTO ───────────────────────────────
  if (y > 220) { doc.addPage(); y = 20 }
  hline(y)
  y += 8

  setFont('bold', 11, PRETO)
  text('FORMAS DE PAGAMENTO', M, y)
  doc.setFillColor(...VERDE)
  doc.rect(M, y + 2, 24, 1, 'F')
  y += 10

  // PIX
  doc.setFillColor(240, 255, 220)
  doc.roundedRect(M, y, C, 14, 3, 3, 'F')
  doc.setDrawColor(...VERDE)
  doc.setLineWidth(0.5)
  doc.roundedRect(M, y, C, 14, 3, 3, 'S')
  setFont('bold', 10, PRETO)
  text('PIX', M + 6, y + 9)
  setFont('normal', 9, CINZA3)
  text('Sem taxa - Pagamento instantaneo', M + 22, y + 9)
  setFont('bold', 10, [90,191,0])
  text('SEM TAXA', W - M - 4, y + 9, { align: 'right' })
  y += 18

  // Débito
  doc.setFillColor(...CINZA1)
  doc.roundedRect(M, y, C, 14, 3, 3, 'F')
  setFont('bold', 10, PRETO)
  text('DEBITO', M + 6, y + 9)
  setFont('normal', 9, CINZA3)
  text('Mastercard, Visa, Elo - InfinitePay', M + 28, y + 9)
  setFont('bold', 10, CINZA3)
  text('1.5%', W - M - 4, y + 9, { align: 'right' })
  y += 18

  // Crédito
  doc.setFillColor(...CINZA1)
  doc.roundedRect(M, y, C, 14, 3, 3, 'F')
  setFont('bold', 10, PRETO)
  text('CREDITO', M + 6, y + 5)
  setFont('normal', 8, CINZA3)
  text('Mastercard, Visa, Elo, American Express', M + 30, y + 5)
  setFont('bold', 9, [180,120,0])
  text('Taxa consulte', W - M - 4, y + 5, { align: 'right' })
  setFont('normal', 8, CINZA3)
  text('Parcelamento em ate 12x - taxas variam por parcela', M + 6, y + 11)
  y += 18

  // ─── CTA ────────────────────────────────────────────────
  if (y > 240) { doc.addPage(); y = 20 }
  doc.setFillColor(240, 255, 220)
  doc.roundedRect(M, y, C, 28, 3, 3, 'F')
  doc.setDrawColor(...VERDE)
  doc.setLineWidth(0.5)
  doc.roundedRect(M, y, C, 28, 3, 3, 'S')

  setFont('bold', 12, PRETO)
  text('Pronto para agendar?', M + 6, y + 9)
  setFont('normal', 9, CINZA3)
  const ctaLines = doc.splitTextToSize(
    'Responda esse orcamento confirmando os servicos ou me chame no WhatsApp. ' +
    'Agenda disponivel - garanta sua data!',
    C - 12
  )
  doc.text(ctaLines, M + 6, y + 15)
  y += 36

  // ─── ASSINATURA ────────────────────────────────────────
  if (y > 260) { doc.addPage(); y = 20 }
  hline(y)
  y += 8

  doc.setDrawColor(...PRETO)
  doc.setLineWidth(0.4)
  doc.line(M, y + 8, M + 60, y + 8)

  setFont('bold', 10, PRETO)
  text('Caio Alves', M, y + 14)
  setFont('normal', 8, CINZA2)
  text('BOX 0.0 - Estetica Automotiva', M, y + 19)
  text(dataHoje, M, y + 24)

  setFont('normal', 7, CINZA2)
  text('Este orcamento tem validade de 7 dias a partir da data de emissao.', W / 2, y + 32, { align: 'center' })

  // ─── SALVA ─────────────────────────────────────────────
  const nomeCliente = dados.cliente?.nome?.replace(/\s/g, '-').toLowerCase() || 'cliente'
  doc.save(`orcamento-${nomeCliente}-${dataHoje.replace(/\//g, '-')}.pdf`)
}
