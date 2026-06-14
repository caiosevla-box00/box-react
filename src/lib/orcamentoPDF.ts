// Gera PDF do orçamento para o cliente
// Usa jsPDF carregado via CDN no index.html

export interface OrcamentoPDFDados {
  cliente?: { nome: string; veiculo?: string; tel?: string }
  servicos: { nome: string; preco: number; tempo: string }[]
  total: number
  delivery?: number
  desconto?: number
  formaPagamento?: string
  parcelas?: number
  valorCobrado?: number
  taxaPct?: number
  data: string
}

export async function gerarOrcamentoPDF(dados: OrcamentoPDFDados): Promise<void> {
  // Dynamically import jsPDF
  const { jsPDF } = await import('jspdf')

  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const W = 210
  const margin = 20
  let y = 20

  // Colors
  const verde = [90, 191, 0] as [number, number, number]
  const preto = [10, 10, 10] as [number, number, number]
  const cinza = [120, 120, 120] as [number, number, number]
  const cinzaClaro = [230, 230, 230] as [number, number, number]

  // Header background
  doc.setFillColor(...preto)
  doc.rect(0, 0, W, 40, 'F')

  // Logo BOX 0.0
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(28)
  doc.setFont('helvetica', 'bold')
  doc.text('BOX', margin, y + 10)

  doc.setTextColor(...verde)
  doc.text(' 0.0', margin + 22, y + 10)

  doc.setTextColor(180, 180, 180)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text('ESTÉTICA AUTOMOTIVA', margin, y + 17)

  // Data
  doc.setTextColor(180, 180, 180)
  doc.setFontSize(9)
  doc.text(dados.data, W - margin, y + 10, { align: 'right' })
  doc.text('ORÇAMENTO', W - margin, y + 17, { align: 'right' })

  y = 52

  // Cliente
  if (dados.cliente?.nome) {
    doc.setFillColor(...cinzaClaro)
    doc.roundedRect(margin, y, W - margin * 2, 22, 3, 3, 'F')

    doc.setTextColor(...cinza)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.text('CLIENTE', margin + 4, y + 7)

    doc.setTextColor(...preto)
    doc.setFontSize(13)
    doc.setFont('helvetica', 'bold')
    doc.text(dados.cliente.nome, margin + 4, y + 14)

    if (dados.cliente.veiculo) {
      doc.setTextColor(...cinza)
      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      doc.text(dados.cliente.veiculo, W - margin - 4, y + 14, { align: 'right' })
    }
    y += 30
  }

  // Título Serviços
  doc.setTextColor(...preto)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('SERVIÇOS', margin, y)
  doc.setDrawColor(...verde)
  doc.setLineWidth(0.5)
  doc.line(margin, y + 2, W - margin, y + 2)
  y += 8

  // Lista de serviços
  dados.servicos.forEach((svc, i) => {
    if (i % 2 === 0) {
      doc.setFillColor(248, 248, 248)
      doc.rect(margin, y - 4, W - margin * 2, 10, 'F')
    }

    doc.setTextColor(...preto)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(svc.nome, margin + 2, y + 2)

    doc.setTextColor(...cinza)
    doc.setFontSize(9)
    doc.text(`⏱ ${svc.tempo}`, margin + 100, y + 2)

    doc.setTextColor(...preto)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text(`R$${svc.preco.toFixed(2)}`, W - margin - 2, y + 2, { align: 'right' })

    y += 10
  })

  y += 4

  // Linha divisória
  doc.setDrawColor(...cinzaClaro)
  doc.setLineWidth(0.3)
  doc.line(margin, y, W - margin, y)
  y += 8

  // Subtotal / extras
  const linhas: { label: string; valor: string; destaque?: boolean }[] = []

  if ((dados.delivery || 0) > 0) {
    linhas.push({ label: '🚚 Taxa de Delivery', valor: `R$${(dados.delivery || 0).toFixed(2)}` })
  }
  if ((dados.desconto || 0) > 0) {
    linhas.push({ label: 'Desconto', valor: `-R$${(dados.desconto || 0).toFixed(2)}` })
  }
  if ((dados.taxaPct || 0) > 0 && dados.formaPagamento !== 'pix') {
    linhas.push({ label: `Taxa ${dados.formaPagamento?.toUpperCase()} (${dados.taxaPct}%)`, valor: `+R$${((dados.valorCobrado || dados.total) - dados.total).toFixed(2)}` })
  }

  linhas.forEach(l => {
    doc.setTextColor(...cinza)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.text(l.label, margin + 2, y)
    doc.text(l.valor, W - margin - 2, y, { align: 'right' })
    y += 7
  })

  // Total
  doc.setFillColor(...preto)
  doc.roundedRect(margin, y, W - margin * 2, 18, 3, 3, 'F')

  doc.setTextColor(180, 180, 180)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text('TOTAL', margin + 4, y + 7)

  doc.setTextColor(...verde)
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  const valorFinal = dados.valorCobrado || dados.total
  doc.text(`R$${valorFinal.toFixed(2)}`, W - margin - 4, y + 12, { align: 'right' })

  if (dados.formaPagamento) {
    doc.setTextColor(180, 180, 180)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    const fpLabel = dados.formaPagamento.toUpperCase() + (dados.parcelas && dados.parcelas > 1 ? ` ${dados.parcelas}x` : '')
    doc.text(fpLabel, margin + 4, y + 13)
  }

  y += 26

  // Rodapé
  doc.setTextColor(...cinza)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text('BOX 0.0 — Estética Automotiva · Padrão de Qualidade', W / 2, y, { align: 'center' })

  // Abre/baixa o PDF
  const nomeArquivo = `orcamento-${dados.cliente?.nome?.replace(/\s/g, '-').toLowerCase() || 'box00'}-${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.pdf`
  doc.save(nomeArquivo)
}
