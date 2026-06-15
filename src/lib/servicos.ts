import type { Servico, Combo } from '@/types'

export const SERVICOS: Servico[] = [
  { id:'start',     num:'01', nome:'Lavagem Start',              tempo:'1h – 1h30',  base:{hatch:60,  sedan:72,  suv:78 },  desc:'Pré-lavagem com água e shampoo desencrustante · Lavagem com pH neutro · Secagem técnica com microfibra · Sopro de frestas · Pretinho nos pneus · Limpeza de painéis e plásticos internos com flanela' },
  { id:'perf',      num:'02', nome:'Lavagem Performance',        tempo:'2h – 2h30',  base:{hatch:110, sedan:120, suv:130},  desc:'Tudo da Lavagem Start · Limpeza química de rodas e caixas de roda · Proteção UV dos plásticos internos · Mais brilho e durabilidade' },
  { id:'resgate',   num:'03', nome:'Lavagem Resgate',            tempo:'4h – 5h',    base:{hatch:220, sedan:240, suv:260},  desc:'Tudo da Lavagem Performance · Detalhamento de emblemas e frisos com pincel · Proteção e hidratação dos plásticos externos · Cera de alta repelência na pintura · Reset completo do exterior' },
  { id:'interior',  num:'04', nome:'Limpeza de Interior',        tempo:'1h30 – 2h',  base:{hatch:90,  sedan:100, suv:110},  desc:'Limpeza completa de todas as superfícies internas · Painel, console, porta-luvas e portas · Bancos e encostos · Tapetes e carpetes · Aspiração profunda com produtos específicos por superfície' },
  { id:'higien',    num:'05', nome:'Higienização c/ Extratora',  tempo:'3h – 4h',    base:{hatch:200, sedan:240, suv:250},  desc:'Higienização profunda com extratora · Produto que flora e remove sujeira impregnada em tecidos · Bancos, tapetes, carpetes e forrações · Elimina odores, ácaros, fungos e bactérias · Resultado que você sente ao entrar' },
  { id:'teto',      num:'06', nome:'Limpeza de Teto',            tempo:'45min',      base:{hatch:60,  sedan:72,  suv:78 },  desc:'APC (limpador multiuso) no forro do teto · Produto específico que flora os tecidos e remove manchas e resíduos impregnados · Processo 100% manual com flanelas específicas' },
  { id:'couro',     num:'07', nome:'Revitalização de Couro',     tempo:'2h',         base:{hatch:60,  sedan:70,  suv:80 },  desc:'Limpeza profunda dos bancos e superfícies em couro · Aplicação de hidratante específico para couro · Restaura maciez, cor e proteção natural · Evita ressecamento e rachaduras' },
  { id:'clarfarol', num:'08', nome:'Clareamento de Faróis',      tempo:'45min',      base:{hatch:120, sedan:120, suv:120},  desc:'Lixamento progressivo dos faróis oxidados · Polimento e selagem com produto específico · Recupera a transparência original · Melhora iluminação e aparência' },
  { id:'revfarol',  num:'09', nome:'Revitalização de Faróis',    tempo:'2h – 3h',    base:{hatch:280, sedan:280, suv:280},  desc:'Processo completo de restauração de faróis · Lixamento, polimento e aplicação de verniz UV · Resultado duradouro e proteção contra nova oxidação' },
  { id:'motor',     num:'10', nome:'Lavagem de Motor',           tempo:'1h',         base:{hatch:80,  sedan:80,  suv:80 },  desc:'Limpeza completa do compartimento do motor · Uso de produtos específicos e seguros · Remove graxa, óleo e resíduos acumulados' },
  { id:'descontam', num:'11', nome:'Descontaminação',            tempo:'1h',         base:{hatch:120, sedan:144, suv:156},  desc:'Remoção de partículas de ferro impregnadas na pintura · Argila e produtos específicos · Preparação ideal antes de polimento ou enceramento' },
  { id:'encera',    num:'12', nome:'Enceramento',                tempo:'40min',      base:{hatch:80,  sedan:96,  suv:104},  desc:'Aplicação de cera carnaúba ou sintética · Proteção e brilho duradouros · Repele água e sujeira · Facilita limpezas futuras' },
  { id:'macaneta',  num:'13', nome:'Polimento de Maçaneta',      tempo:'1h20',       base:{hatch:50,  sedan:50,  suv:50 },  desc:'Polimento específico das maçanetas · Remove riscos e oxidação · Devolve o brilho original' },
  { id:'plastext',  num:'14', nome:'Revit. Plásticos Externos',  tempo:'40min',      base:{hatch:35,  sedan:42,  suv:45 },  desc:'Revitalizador nos plásticos externos · Para-choques, caixas de roda, frisos e soleiras · Devolve a cor original e protege contra UV' },
  { id:'plastint',  num:'15', nome:'Revit. Plásticos Internos',  tempo:'1h',         base:{hatch:35,  sedan:42,  suv:45 },  desc:'Revitalização dos plásticos internos · Painel, console e acabamentos · Aspecto renovado e proteção UV' },
  { id:'polim',     num:'16', nome:'Polimento Profissional',     tempo:'6h – 8h',    base:{hatch:400, sedan:480, suv:530},  desc:'Lavagem detalhada com descontaminação incluída · Fita de pintura em toda borracharia · Polimento de corte e refino · Roto-orbital em toda extensão · Remove micro-riscos e oxidação · Acabamento espelhado' },
]

export const CATEGORIAS = [
  { nome: '💧 Lavagens',               ids: ['start','perf','resgate'] },
  { nome: '🪑 Interior & Higienização', ids: ['interior','higien','teto','couro'] },
  { nome: '✨ Serviços Especiais',      ids: ['clarfarol','revfarol','motor','descontam'] },
  { nome: '🔩 Acabamentos',            ids: ['encera','macaneta','plastext','plastint'] },
  { nome: '🔬 Polimento',              ids: ['polim'] },
]

export const COMBOS: Combo[] = [
  { id:'c1', nome:'Combo Limpeza Total',        svcs:['start','interior'],                    desc:'Lavagem Start + Limpeza Interior · Exterior e interior impecáveis',                          tag:'ESSENCIAL' },
  { id:'c2', nome:'Combo Proteção Completa',    svcs:['perf','encera','plastext'],             desc:'Lavagem Performance + Enceramento + Revit. Plásticos Ext. · Proteção total',               tag:'PROTEÇÃO'  },
  { id:'c3', nome:'Combo Faróis Kit',           svcs:['clarfarol','revfarol'],                 desc:'Clareamento + Revitalização de Faróis · Segurança e estética',                              tag:'FARÓIS'    },
  { id:'c4', nome:'Interior Total',             svcs:['interior','higien'],                    desc:'Limpeza Interior + Higienização c/ Extratora · Interior como novo',                         tag:'PREMIUM'   },
  { id:'c5', nome:'Kit Refresh',                svcs:['higien','teto','couro'],                desc:'Higienização + Limpeza de Teto + Revit. Couro · Ambiente renovado e saudável',              tag:'REFRESH'   },
  { id:'c6', nome:'Combo Completo FULL',        svcs:['perf','descontam','encera','plastext','plastint'], desc:'Performance + Descontaminação + Enceramento + Plásticos · Proteção máxima', tag:'FULL'      },
]

export const TAXAS_INFINITEPAY = {
  debito: 1.5,
  credito: [0, 3.49, 4.49, 5.49, 5.99, 6.49, 6.99, 7.49, 7.99, 8.49, 8.99, 9.49, 9.99],
}

export const ORIGENS: Record<string, string> = {
  instagram: '📸 Instagram',
  indicacao: '🤝 Indicação',
  passagem:  '🚶 Passagem',
  evento:    '🎪 Evento',
  outro:     '💬 Outro',
}

export const TIPOS_V: Record<string, string> = {
  hatch: '🚗',
  sedan: '🚙',
  suv:   '🛻',
}

export const NOMES_DIA = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb']
export const NOMES_DIA_FULL = ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado']

export const HORA_INICIO = 8
export const HORA_FIM    = 18
export const SLOT_MIN    = 30
export const TOTAL_SLOTS = ((HORA_FIM - HORA_INICIO) * 60) / SLOT_MIN

export const TEMPO_SERVICO: Record<string, number> = {
  start:90, perf:150, resgate:300, interior:120, higien:240,
  clarfarol:45, revfarol:180, motor:60, descontam:60,
  encera:40, macaneta:80, plastext:40, plastint:60, teto:45,
  polim:480, couro:120,
}
